"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { URL } = require("node:url");

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
const PORT = process.env.PORT || 8787;
const PROD = process.env.NODE_ENV === "production";
const SESSION_TTL = 12 * 60 * 60 * 1000;
const sessions = new Map();

function freshDb() {
  return { users: [], accountRequests: [], settings: {}, auditLogs: [], appState: null, createdAt: new Date().toISOString() };
}
function readDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(freshDb(), null, 2));
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function writeDb(db) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, { N: 16384 }, (err, key) => {
    if (err) reject(err);
    else resolve(`${salt}:${key.toString("hex")}`);
  }));
}
async function verifyPassword(password, stored) {
  const [salt, expected] = String(stored || "").split(":");
  if (!salt || !expected) return false;
  const actual = await hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(stored));
}
function json(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(body));
}
function body(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 10_000_000) reject(new Error("İstek çok büyük"));
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Geçersiz veri")); }
    });
  });
}
function cookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").filter(Boolean).map(x => {
    const i = x.indexOf("=");
    return [x.slice(0, i).trim(), decodeURIComponent(x.slice(i + 1))];
  }));
}
function currentSession(req) {
  const token = cookies(req).panel_session;
  const session = token && sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session;
}
function sessionCookie(token, clear = false) {
  const parts = [`panel_session=${clear ? "" : token}`, "HttpOnly", "SameSite=Strict", "Path=/", `Max-Age=${clear ? 0 : SESSION_TTL / 1000}`];
  if (PROD) parts.push("Secure");
  return parts.join("; ");
}
function audit(db, req, action, userId = null, details = {}) {
  db.auditLogs.unshift({
    id: crypto.randomUUID(), userId, action, entityType: details.entityType || "AUTH",
    entityId: details.entityId || null, oldValue: details.oldValue || null,
    newValue: details.newValue || null, ipAddress: req.socket.remoteAddress,
    userAgent: req.headers["user-agent"] || "", createdAt: new Date().toISOString()
  });
  db.auditLogs = db.auditLogs.slice(0, 5000);
}
function publicUser(user) {
  const { passwordHash, failedAttempts, lockedUntil, ...safe } = user;
  return safe;
}
function passwordValid(value) {
  return value.length >= 8 && /[A-ZÇĞİÖŞÜ]/.test(value) && /[a-zçğıöşü]/.test(value) && /\d/.test(value);
}
async function fetchJson(url, options = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), ...options });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || result.message || `API hatası: ${response.status}`);
  return result;
}
async function fetchText(url, options = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), ...options });
  const result = await response.text();
  if (!response.ok) throw new Error(`API hatası: ${response.status}`);
  return result;
}
function tcmbRates(xml) {
  return ["USD", "EUR"].map(code => {
    const block = xml.match(new RegExp(`<Currency[^>]+CurrencyCode="${code}"[\\s\\S]*?<\\/Currency>`))?.[0] || "";
    const value = tag => Number(block.match(new RegExp(`<${tag}>([^<]+)<\\/${tag}>`))?.[1]);
    return { code, buyRate: value("ForexBuying"), sellRate: value("ForexSelling") };
  }).filter(rate => Number.isFinite(rate.buyRate) && Number.isFinite(rate.sellRate));
}
async function currentExchangeRates() {
  if (process.env.EXCHANGE_RATE_API_URL) {
    const result = await fetchJson(process.env.EXCHANGE_RATE_API_URL);
    const rates = result.rates || result.data || result;
    const list = Array.isArray(rates) ? rates : Object.entries(rates).map(([code, value]) => ({
      code, buyRate: Number(value?.buy || value?.buying || value), sellRate: Number(value?.sell || value?.selling || value)
    }));
    return { source: result.source || "Kur API", rates: list.filter(x => x.code && Number.isFinite(x.sellRate)) };
  }
  try {
    const rates = tcmbRates(await fetchText("https://www.tcmb.gov.tr/kurlar/today.xml"));
    if (rates.length) return { source: "TCMB", rates };
  } catch {}
  const result = await fetchJson("https://api.frankfurter.app/latest?from=TRY&to=USD,EUR");
  const rates = ["USD", "EUR"].map(code => {
    const value = Number(result.rates?.[code]);
    const tryRate = value ? 1 / value : NaN;
    return { code, buyRate: tryRate, sellRate: tryRate };
  }).filter(rate => Number.isFinite(rate.sellRate));
  return { source: "ECB / Frankfurter", rates };
}
function responseText(result) {
  if (result.output_text) return result.output_text;
  return (result.output || []).flatMap(x => x.content || []).map(x => x.text || "").join("");
}

async function api(req, res, url) {
  const db = readDb();
  if (url.pathname === "/api/status" && req.method === "GET") {
    return json(res, 200, {
      setupRequired: db.users.length === 0,
      authenticated: !!currentSession(req),
      integrations: { exchangeRates: true, photoReading: !!process.env.OPENAI_API_KEY }
    });
  }
  if (url.pathname === "/api/exchange-rates" && req.method === "GET") {
    try {
      const result = await currentExchangeRates();
      if (!result.rates.length) throw new Error("Kur verisi bulunamadı.");
      return json(res, 200, { ...result, recordedAt: new Date().toISOString() });
    } catch (error) {
      return json(res, 502, { error: `Kur bilgisi alınamadı: ${error.message}` });
    }
  }
  if (url.pathname === "/api/setup" && req.method === "POST") {
    if (db.users.length) return json(res, 403, { error: "İlk kurulum daha önce tamamlanmış." });
    const data = await body(req);
    if (!data.businessName || !data.fullName || !data.username || !data.email || !passwordValid(data.password) || data.password !== data.passwordConfirm) {
      return json(res, 400, { error: "Alanları ve şifre kurallarını kontrol edin." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json(res, 400, { error: "Geçerli bir e-posta girin." });
    const user = {
      id: crypto.randomUUID(), fullName: data.fullName.trim(), username: data.username.trim(),
      email: data.email.trim().toLowerCase(), phone: data.phone || "", role: "OWNER", active: true,
      permissions: ["*"], passwordHash: await hashPassword(data.password), failedAttempts: 0,
      lockedUntil: null, lastLoginAt: null, createdAt: new Date().toISOString()
    };
    db.users.push(user);
    db.settings = { businessName: data.businessName.trim(), currency: data.currency || "TL", language: data.language || "tr", branchName: data.branchName || "Merkez" };
    audit(db, req, "FIRST_OWNER_CREATED", user.id, { entityType: "USER", entityId: user.id });
    writeDb(db);
    return json(res, 201, { ok: true });
  }
  if (url.pathname === "/api/register-request" && req.method === "POST") {
    db.accountRequests ||= [];
    const data = await body(req);
    const username = String(data.username || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    if (!data.fullName || !username || !email || !data.phone || !passwordValid(data.password || "") || data.password !== data.passwordConfirm) {
      return json(res, 400, { error: "Bilgileri ve şifre kurallarını kontrol edin." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: "Geçerli bir e-posta girin." });
    if (db.users.some(x => x.username.toLowerCase() === username.toLowerCase() || x.email.toLowerCase() === email)) {
      return json(res, 409, { error: "Bu kullanıcı adı veya e-posta zaten kayıtlı." });
    }
    if (db.accountRequests.some(x => x.status === "PENDING" && (x.username.toLowerCase() === username.toLowerCase() || x.email.toLowerCase() === email))) {
      return json(res, 409, { error: "Bu bilgilerle bekleyen bir hesap talebi var." });
    }
    const request = {
      id: crypto.randomUUID(), fullName: String(data.fullName).trim(), username, email,
      phone: String(data.phone || "").trim(), requestedRole: data.requestedRole || "STAFF",
      note: String(data.note || "").trim(), status: "PENDING",
      passwordHash: await hashPassword(data.password), createdAt: new Date().toISOString()
    };
    db.accountRequests.unshift(request);
    audit(db, req, "ACCOUNT_REQUEST_CREATED", null, { entityType: "USER_REQUEST", entityId: request.id, newValue: { username, email } });
    writeDb(db);
    return json(res, 201, { ok: true, message: "Talebiniz oluşturuldu. Yönetici onayından sonra giriş yapabilirsiniz." });
  }
  if (url.pathname === "/api/login" && req.method === "POST") {
    const data = await body(req);
    const key = String(data.identity || "").trim().toLowerCase();
    const user = db.users.find(x => x.username.toLowerCase() === key || x.email.toLowerCase() === key);
    if (!user) {
      audit(db, req, "LOGIN_FAILED", null, { newValue: { identity: key } }); writeDb(db);
      return json(res, 401, { error: "Kullanıcı adı veya şifre hatalı." });
    }
    if (!user.active) return json(res, 403, { error: "Bu hesap pasif durumda." });
    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) return json(res, 423, { error: "Hesap geçici olarak kilitli. Lütfen daha sonra tekrar deneyin." });
    if (!(await verifyPassword(String(data.password || ""), user.passwordHash))) {
      user.failedAttempts = Number(user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        user.failedAttempts = 0;
      }
      audit(db, req, "LOGIN_FAILED", user.id); writeDb(db);
      return json(res, 401, { error: "Kullanıcı adı veya şifre hatalı." });
    }
    user.failedAttempts = 0; user.lockedUntil = null; user.lastLoginAt = new Date().toISOString();
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL });
    audit(db, req, "LOGIN_SUCCESS", user.id); writeDb(db);
    return json(res, 200, { user: publicUser(user), settings: db.settings }, { "Set-Cookie": sessionCookie(token) });
  }
  if (url.pathname === "/api/logout" && req.method === "POST") {
    const session = currentSession(req);
    if (session) { audit(db, req, "LOGOUT", session.userId); writeDb(db); }
    const token = cookies(req).panel_session; if (token) sessions.delete(token);
    return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", true) });
  }
  const session = currentSession(req);
  if (!session) return json(res, 401, { error: "Oturum gerekli." });
  const user = db.users.find(x => x.id === session.userId);
  if (!user) return json(res, 401, { error: "Kullanıcı bulunamadı." });
  if (!user.active) {
    const token = cookies(req).panel_session;
    if (token) sessions.delete(token);
    return json(res, 403, { error: "Bu hesap askıya alınmış." }, { "Set-Cookie": sessionCookie("", true) });
  }
  if (url.pathname === "/api/ocr" && req.method === "POST") {
    if (!process.env.OPENAI_API_KEY) return json(res, 503, { error: "Fotoğraf okuma API anahtarı sunucuda tanımlanmamış." });
    const data = await body(req);
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(data.image || "")) return json(res, 400, { error: "JPEG, PNG veya WEBP fotoğraf gerekli." });
    try {
      const result = await fetchJson("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini",
          input: [{ role: "user", content: [
            { type: "input_text", text: "Bu cihaz/kutu/fatura fotoğrafından yalnızca görülebilen bilgileri çıkar. JSON döndür: brand, model, imeiOrSerial, color, storage, confidence (0-1), uncertainFields (dizi). Emin değilsen alanı boş bırak. Açıklama ekleme." },
            { type: "input_image", image_url: data.image, detail: "high" }
          ] }]
        })
      });
      const text = responseText(result).replace(/^```json\s*|\s*```$/g, "");
      return json(res, 200, { extracted: JSON.parse(text) });
    } catch (error) {
      return json(res, 502, { error: `Fotoğraf okunamadı: ${error.message}` });
    }
  }
  if (url.pathname === "/api/me" && req.method === "GET") return json(res, 200, { user: publicUser(user), settings: db.settings });
  if (url.pathname === "/api/account" && req.method === "PATCH") {
    const data = await body(req);
    if (db.users.some(x => x.id !== user.id && x.username.toLowerCase() === String(data.username).toLowerCase())) return json(res, 409, { error: "Bu kullanıcı adı kullanımda." });
    if (db.users.some(x => x.id !== user.id && x.email.toLowerCase() === String(data.email).toLowerCase())) return json(res, 409, { error: "Bu e-posta kullanımda." });
    const oldValue = publicUser(user);
    Object.assign(user, { fullName: data.fullName, username: data.username, email: data.email, phone: data.phone });
    audit(db, req, "ACCOUNT_UPDATED", user.id, { entityType: "USER", entityId: user.id, oldValue, newValue: publicUser(user) });
    writeDb(db); return json(res, 200, { user: publicUser(user) });
  }
  if (url.pathname === "/api/account/password" && req.method === "POST") {
    const data = await body(req);
    if (!(await verifyPassword(data.currentPassword || "", user.passwordHash))) return json(res, 400, { error: "Mevcut şifre yanlış." });
    if (!passwordValid(data.newPassword || "")) return json(res, 400, { error: "Yeni şifre kurallara uymuyor." });
    user.passwordHash = await hashPassword(data.newPassword);
    audit(db, req, "PASSWORD_CHANGED", user.id, { entityType: "USER", entityId: user.id });
    for (const [token, s] of sessions) if (s.userId === user.id) sessions.delete(token);
    writeDb(db); return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", true) });
  }
  if (url.pathname === "/api/account/sessions" && req.method === "DELETE") {
    for (const [token, s] of sessions) if (s.userId === user.id) sessions.delete(token);
    audit(db, req, "ALL_SESSIONS_CLOSED", user.id); writeDb(db);
    return json(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", true) });
  }
  if (url.pathname === "/api/audit-logs" && req.method === "GET") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Bu işlem için yönetici yetkisi gerekli." });
    return json(res, 200, { logs: db.auditLogs });
  }
  if (url.pathname === "/api/users" && req.method === "GET") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Kullanıcı yönetme yetkisi gerekli." });
    return json(res, 200, { users: db.users.map(publicUser) });
  }
  if (url.pathname === "/api/account-requests" && req.method === "GET") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Hesap taleplerini görme yetkisi gerekli." });
    db.accountRequests ||= [];
    return json(res, 200, { requests: db.accountRequests.map(({ passwordHash, ...safe }) => safe) });
  }
  if (url.pathname.startsWith("/api/account-requests/") && req.method === "PATCH") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Hesap talebi yönetme yetkisi gerekli." });
    db.accountRequests ||= [];
    const targetId = url.pathname.split("/")[3];
    const request = db.accountRequests.find(x => x.id === targetId);
    if (!request) return json(res, 404, { error: "Hesap talebi bulunamadı." });
    const data = await body(req);
    if (data.decision === "REJECT") {
      request.status = "REJECTED"; request.reviewedById = user.id; request.reviewedAt = new Date().toISOString();
      audit(db, req, "ACCOUNT_REQUEST_REJECTED", user.id, { entityType: "USER_REQUEST", entityId: request.id });
      writeDb(db);
      return json(res, 200, { ok: true });
    }
    if (data.decision !== "APPROVE") return json(res, 400, { error: "Geçersiz karar." });
    if (db.users.some(x => x.username.toLowerCase() === request.username.toLowerCase() || x.email.toLowerCase() === request.email.toLowerCase())) {
      return json(res, 409, { error: "Bu kullanıcı adı veya e-posta artık kullanımda." });
    }
    const role = data.role || request.requestedRole || "STAFF";
    if (role === "OWNER" && user.role !== "OWNER") return json(res, 403, { error: "OWNER rolünü yalnızca İşletme Sahibi verebilir." });
    const created = {
      id: crypto.randomUUID(), fullName: request.fullName, username: request.username, email: request.email,
      phone: request.phone || "", role, active: true, permissions: role === "OWNER" ? ["*"] : [],
      passwordHash: request.passwordHash, failedAttempts: 0, lockedUntil: null, createdAt: new Date().toISOString()
    };
    db.users.push(created);
    request.status = "APPROVED"; request.reviewedById = user.id; request.reviewedAt = new Date().toISOString();
    audit(db, req, "ACCOUNT_REQUEST_APPROVED", user.id, { entityType: "USER", entityId: created.id, newValue: publicUser(created) });
    writeDb(db);
    return json(res, 201, { user: publicUser(created) });
  }
  if (url.pathname === "/api/users" && req.method === "POST") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Kullanıcı yönetme yetkisi gerekli." });
    const data = await body(req);
    if (data.role === "OWNER" && user.role !== "OWNER") return json(res, 403, { error: "Yalnızca OWNER başka bir OWNER oluşturabilir." });
    if (db.users.some(x => x.username.toLowerCase() === String(data.username).toLowerCase() || x.email.toLowerCase() === String(data.email).toLowerCase())) return json(res, 409, { error: "Kullanıcı adı veya e-posta kullanımda." });
    if (!passwordValid(data.password || "")) return json(res, 400, { error: "Şifre kurallara uymuyor." });
    const created = { id: crypto.randomUUID(), fullName: data.fullName, username: data.username, email: data.email.toLowerCase(), phone: data.phone || "", role: data.role || "STAFF", active: true, permissions: data.role === "OWNER" ? ["*"] : [], passwordHash: await hashPassword(data.password), failedAttempts: 0, lockedUntil: null, createdAt: new Date().toISOString() };
    db.users.push(created); audit(db, req, "USER_CREATED", user.id, { entityType: "USER", entityId: created.id }); writeDb(db);
    return json(res, 201, { user: publicUser(created) });
  }
  if (url.pathname.startsWith("/api/users/") && req.method === "PATCH") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Kullanıcı yönetme yetkisi gerekli." });
    const target = db.users.find(x => x.id === url.pathname.split("/")[3]);
    if (!target) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    if (target.role === "OWNER" && target.id !== user.id) return json(res, 403, { error: "OWNER hesabı üzerinde bu işlem yapılamaz." });
    const data = await body(req);
    if (target.id === user.id && ((data.role && data.role !== target.role) || data.active === false)) return json(res, 403, { error: "Kendi rolünüzü değiştiremez veya hesabınızı pasifleştiremezsiniz." });
    if (data.role === "OWNER" && user.role !== "OWNER") return json(res, 403, { error: "Yalnızca OWNER bu rolü verebilir." });
    if (target.role === "OWNER" && (data.active === false || (data.role && data.role !== "OWNER"))) return json(res, 403, { error: "OWNER pasifleştirilemez veya yetkisi düşürülemez." });
    Object.assign(target, { ...(data.role ? { role: data.role } : {}), ...(typeof data.active === "boolean" ? { active: data.active } : {}), ...(data.permissions ? { permissions: data.permissions } : {}) });
    if (data.active === false) for (const [token, s] of sessions) if (s.userId === target.id) sessions.delete(token);
    audit(db, req, "USER_UPDATED", user.id, { entityType: "USER", entityId: target.id }); writeDb(db);
    return json(res, 200, { user: publicUser(target) });
  }
  if (url.pathname.endsWith("/reset-password") && url.pathname.startsWith("/api/users/") && req.method === "POST") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Şifre sıfırlama yetkisi gerekli." });
    const target = db.users.find(x => x.id === url.pathname.split("/")[3]), data = await body(req);
    if (!target) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    if (target.id === user.id) return json(res, 403, { error: "Kendi şifrenizi hesap güvenliği ekranından değiştirin." });
    if (target.role === "OWNER") return json(res, 403, { error: "OWNER şifresi başka kullanıcı tarafından değiştirilemez." });
    if (!passwordValid(data.password || "")) return json(res, 400, { error: "Şifre kurallara uymuyor." });
    target.passwordHash = await hashPassword(data.password);
    for (const [token, s] of sessions) if (s.userId === target.id) sessions.delete(token);
    audit(db, req, "USER_PASSWORD_RESET", user.id, { entityType: "USER", entityId: target.id }); writeDb(db);
    return json(res, 200, { ok: true });
  }
  if (url.pathname.startsWith("/api/users/") && req.method === "DELETE") {
    if (!["OWNER", "ADMIN"].includes(user.role)) return json(res, 403, { error: "Kullanıcı silme yetkisi için yönetici hesabı gerekli." });
    const targetId = url.pathname.split("/")[3], target = db.users.find(x => x.id === targetId);
    if (!target) return json(res, 404, { error: "Kullanıcı bulunamadı." });
    if (target.role === "OWNER") return json(res, 403, { error: "OWNER hesabı silinemez." });
    if (user.role === "ADMIN" && target.role === "ADMIN") return json(res, 403, { error: "Başka bir ADMIN hesabını yalnızca OWNER silebilir." });
    if (target.id === user.id) return json(res, 403, { error: "Kendi hesabınızı silemezsiniz." });
    db.users = db.users.filter(x => x.id !== targetId); audit(db, req, "USER_DELETED", user.id, { entityType: "USER", entityId: targetId }); writeDb(db);
    return json(res, 200, { ok: true });
  }
  if (url.pathname === "/api/state" && req.method === "GET") {
    return json(res, 200, { state: db.appState });
  }
  if (url.pathname === "/api/state" && req.method === "PUT") {
    const data = await body(req);
    if (!data.state || typeof data.state !== "object") return json(res, 400, { error: "Geçersiz uygulama verisi." });
    db.appState = data.state;
    db.appState.users = undefined;
    db.appState.currentUserId = undefined;
    writeDb(db);
    return json(res, 200, { ok: true, updatedAt: new Date().toISOString() });
  }
  return json(res, 404, { error: "İstenen işlem bulunamadı." });
}

const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const file = path.resolve(ROOT, requested);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404</h1><p>Aradığınız sayfa bulunamadı.</p><a href='/'>Panele dön</a>");
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY",
      "Referrer-Policy": "same-origin", "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; worker-src 'self'"
    });
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: "Beklenmeyen bir sunucu hatası oluştu." });
  }
});
const HOST = process.env.HOST || (PROD ? "0.0.0.0" : "127.0.0.1");
if (require.main === module) {
  server.on("error", error => {
    if (error && error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} kullanımda. Panel zaten açık olabilir veya başka bir uygulama bu portu kullanıyor.`);
    } else {
      console.error("Sunucu başlatılamadı:", error);
    }
    process.exitCode = 1;
  });
  server.listen(PORT, HOST, () => console.log(`Panel http://${HOST}:${PORT} adresinde çalışıyor.`));
}

module.exports = { server };
