(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const iso = () => new Date().toISOString();
  const day = () => iso().slice(0, 10);
  const id = p => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const STORE = "isletme-panel-v2";
  const isServer = location.protocol.startsWith("http");
  const tr = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" });
  const permissions = [
    ["service.create","Servis ekleme"],["service.update","Servis düzenleme"],["service.delete","Servis silme"],
    ["cash.view","Kasa görme"],["cash.create","Kasa işlemi yapma"],["cash.delete","Kasa hareketi silme"],
    ["stock.view","Stok görme"],["stock.create","Stok ekleme"],["stock.delete","Stok silme"],
    ["reports.view","Rapor görme"],["users.manage","Kullanıcı yönetme"],["settings.manage","Ayarları değiştirme"],
    ["finance.view","Finans görme"],["finance.manage","Finans yönetme"],["audit.view","İşlem geçmişi görme"],
    ["backup.create","Yedek alma"],["buySell.view","Al-sat görme"],["buySell.create","Al-sat ekleme"],
    ["buySell.sell","Al-sat satışı"],["buySell.delete","Al-sat silme"]
  ];
  const roles = ["OWNER","ADMIN","MANAGER","STAFF","CASHIER","TECHNICIAN"];
  const roleLabels = { OWNER:"İşletme Sahibi", ADMIN:"Yönetici", MANAGER:"Müdür", STAFF:"Personel", CASHIER:"Kasiyer", TECHNICIAN:"Teknisyen" };
  const roleLabel = role => roleLabels[role] || role;
  const roleOptions = list => list.map(role=>`<option value="${role}">${roleLabel(role)}</option>`).join("");

  const catalog = {
    Apple: ["iPhone 6","iPhone 6s","iPhone 7","iPhone 7 Plus","iPhone 8","iPhone 8 Plus","iPhone X","iPhone XR","iPhone XS","iPhone XS Max","iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone 12","iPhone 12 mini","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 13","iPhone 13 mini","iPhone 13 Pro","iPhone 13 Pro Max","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max"],
    Samsung: ["Galaxy A10","Galaxy A12","Galaxy A13","Galaxy A14","Galaxy A15","Galaxy A20","Galaxy A21s","Galaxy A22","Galaxy A23","Galaxy A24","Galaxy A25","Galaxy A30","Galaxy A31","Galaxy A32","Galaxy A33","Galaxy A34","Galaxy A35","Galaxy A50","Galaxy A51","Galaxy A52","Galaxy A53","Galaxy A54","Galaxy A55","Galaxy S20","Galaxy S20 FE","Galaxy S21","Galaxy S21 FE","Galaxy S22","Galaxy S23","Galaxy S24","Galaxy Note 10","Galaxy Note 20"],
    Xiaomi: ["Redmi Note 8","Redmi Note 9","Redmi Note 10","Redmi Note 11","Redmi Note 12","Redmi Note 13","Redmi Note 14","Mi 10","Mi 11","Mi 12","Mi 13","Poco X3","Poco X4","Poco X5","Poco X6"],
    Huawei: ["P20","P30","P40","Mate 20","Mate 30","Mate 40","Nova 5T","Nova 9","Nova 10"],
    Oppo: ["Reno 5","Reno 6","Reno 7","Reno 8","Reno 10","A15","A16","A54","A74"],
    Realme: ["Realme 6","Realme 7","Realme 8","Realme 9","Realme 10","Realme 11"],
    Monster: ["Abra A5","Abra A7","Tulpar T5","Tulpar T7","Semruk S7"],
    Lenovo: ["IdeaPad 3","IdeaPad 5","ThinkPad E14","ThinkPad T14","Legion 5","Yoga Slim 7"],
    HP: ["15s","Pavilion 15","Victus 16","ProBook 450","EliteBook 840"],
    Asus: ["VivoBook 15","ZenBook 14","TUF Gaming F15","ROG Strix G16","ExpertBook"],
    Acer: ["Aspire 3","Aspire 5","Nitro 5","Swift 3","TravelMate"],
    Dell: ["Inspiron 15","Vostro 3520","Latitude 5420","XPS 13","G15"]
  };
  const modelMeta = {
    Apple: { storage: ["64 GB","128 GB","256 GB","512 GB","1 TB"], ram: ["3 GB","4 GB","6 GB","8 GB"], colors: ["Siyah","Beyaz","Mavi","Kırmızı","Altın"], problems: ["Ekran kırık","Batarya zayıf","Şarj almıyor","Face ID çalışmıyor","Kamera arızası"] },
    Samsung: { storage: ["64 GB","128 GB","256 GB","512 GB"], ram: ["4 GB","6 GB","8 GB","12 GB"], colors: ["Siyah","Beyaz","Mavi","Yeşil"], problems: ["Ekran kırık","Şarj soketi","Batarya","Açılmıyor","Kamera"] },
    default: { storage: ["32 GB","64 GB","128 GB","256 GB","512 GB","1 TB"], ram: ["4 GB","8 GB","16 GB","32 GB"], colors: ["Siyah","Beyaz","Gri","Mavi"], problems: ["Açılmıyor","Yavaş çalışıyor","Şarj sorunu","Ekran sorunu","Sıvı teması"] }
  };
  const help = {
    dashboard: ["Burada işletmenin genel durumunu görürsün.", "Uyarıları kontrol et.", "Yapacağın işi büyük hızlı işlem düğmelerinden seç."],
    "services/new": ["Önce müşteri telefonunu yaz.", "Cihaz markası ve modelini seç.", "Arızayı yaz ve Servis Kaydını Oluştur düğmesine bas."],
    services: ["Servisleri burada görürsün.", "Durumu değiştirmek veya ödeme almak için satırdaki düğmeleri kullan."],
    "buy-sell": ["Cihazı kaça aldığını ve hedef satış fiyatını gir.", "Sistem maliyet ve kârı otomatik hesaplar.", "30 günden uzun bekleyen cihazlar uyarılır."],
    stock: ["Aksesuar ve parçaları burada tutarsın.", "Stok girişi miktarı artırır, serviste kullanım miktarı azaltır."],
    appointments: ["Takvimden randevuları gör.", "Yeni Randevu düğmesiyle müşteri ve saat ekle.", "Müşteri geldiğinde durumunu Geldi yap."],
    settings: ["İşletme, şube, kur, yedek ve kullanım ayarlarını buradan yönetirsin."],
    default: ["Bu sayfadaki yeşil düğmeler yeni işlem başlatır.", "Silme ve iptal işlemlerinde önce onay istenir.", "Takıldığında Yardım düğmesini kullan."]
  };

  function blankDb() {
    return {
      version: 3, settings: { businessName: "", currency: "TL", language: "tr", theme: "light", simpleMode: false, helpEnabled: true, backupSchedule: "manual", exchangeApi: "", receiptText: "", requirePurchaseDocument: false, requireSaleDocument: false, requireVideo: false, requireImei: false, requireCustomerPhone: true },
      users: [], accountRequests: [], currentUserId: null, preferences: {}, services: [], customers: [], devices: [], stock: [], stockMovements: [], sales: [], cash: [], receivables: [], buySell: [], marketPrices: [],
      auditLogs: [], appointments: [], suppliers: [], supplierDebts: [], branches: [], exchangeRates: [], warranties: [], deviceImages: [], mediaAttachments: [], customerRiskNotes: [], expenses: [], capitalAccounts: [], capitalMovements: [], cashAccounts: [], notifications: [], backups: [], dayClosings: [],
      brands: Object.entries(catalog).map(([name, models]) => ({ id: id("BR"), name, type: ["Monster","Lenovo","HP","Asus","Acer","Dell"].includes(name) ? "Laptop" : "Telefon", models: models.map(name => ({ id: id("MD"), name })) })),
      counters: { service: 1, sale: 1, buySell: 1 }
    };
  }
  let db = load();
  let user = null;
  let route = location.hash.slice(2) || "dashboard";
  let helpOpen = false;
  let recentOpen = db.preferences["dashboard.showRecentActions"] !== false;

  function load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return blankDb();
      const saved = JSON.parse(raw), base = blankDb();
      return { ...base, ...saved, settings: { ...base.settings, ...saved.settings }, preferences: saved.preferences || {}, brands: saved.brands?.length ? saved.brands : base.brands };
    } catch { return blankDb(); }
  }
  function save() {
    localStorage.setItem(STORE, JSON.stringify(db));
    if (isServer && user) {
      const state = { ...db, users: undefined, currentUserId: undefined };
      fetch("/api/state", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) }).catch(() => {});
    }
  }
  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
  function fmt(v) { return v ? tr.format(new Date(v)) : "-"; }
  function money(v, currency = db.settings.currency) { return new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency === "TL" ? "TRY" : currency }).format(Number(v || 0)); }
  function isAdmin(){return ["OWNER","ADMIN"].includes(user?.role);}
  function can(key){return isAdmin()||(user?.permissions||[]).includes("*")||(user?.permissions||[]).includes(key);}
  function formData(form) { return Object.fromEntries(new FormData(form).entries()); }
  function toast(text, type = "success") { const e = document.createElement("div"); e.className = `toast ${type}`; e.textContent = text; $("#toastHost").append(e); setTimeout(() => e.remove(), 3200); }
  function go(to) { location.hash = `#/${to}`; }
  function audit(action, entityType = "GENEL", entityId = null, oldValue = null, newValue = null) {
    db.auditLogs.unshift({ id: id("AUD"), userId: user?.id || null, userName: user?.fullName || "Sistem", action, entityType, entityId, oldValue, newValue, ipAddress: "Yerel ağ", userAgent: navigator.userAgent, createdAt: iso() });
    db.auditLogs = db.auditLogs.slice(0, 5000); save();
  }
  async function hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, key, 256);
    return `${btoa(String.fromCharCode(...salt))}:${btoa(String.fromCharCode(...new Uint8Array(bits)))}`;
  }
  async function verifyPassword(password, stored) {
    if (!stored?.includes(":")) return false;
    const [salt64, expected] = stored.split(":"), salt = Uint8Array.from(atob(salt64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, key, 256);
    return btoa(String.fromCharCode(...new Uint8Array(bits))) === expected;
  }
  function validPassword(v) { return v.length >= 8 && /[A-ZÇĞİÖŞÜ]/.test(v) && /[a-zçğıöşü]/.test(v) && /\d/.test(v); }
  async function api(path, options = {}) {
    if (!isServer) throw new Error("Sunucu bağlantısı yok");
    const res = await fetch(`/api${path}`, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "İşlem tamamlanamadı");
    return data;
  }
  function modal(title, body, footer = "") {
    const wrap = document.createElement("div"); wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="modal"><div class="modal-head"><h2>${esc(title)}</h2><button class="secondary icon" data-close title="Kapat">×</button></div>${body}${footer ? `<div class="toolbar" style="margin-top:14px">${footer}</div>` : ""}</div>`;
    document.body.append(wrap); wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest("[data-close]")) wrap.remove(); }); return wrap;
  }
  function confirmAction(text) { return new Promise(resolve => { const m = modal("Onay gerekiyor", `<p>${esc(text)}</p>`, `<button data-ok>Onayla</button><button class="secondary" data-close>Vazgeç</button>`); $("[data-ok]", m).onclick = () => { m.remove(); resolve(true); }; m.addEventListener("click", e => { if (e.target.closest("[data-close]")) resolve(false); }); }); }
  function empty(title, text, action, target) { return `<div class="empty-state"><strong>${esc(title)}</strong>${esc(text)}<div style="margin-top:14px"><button data-go="${target}">+ ${esc(action)}</button></div></div>`; }
  function button(text, action, cls = "", title = "") { return `<button class="${cls}" data-action="${action}" title="${esc(title || text)}">${esc(text)}</button>`; }

  async function boot() {
    $("#app").innerHTML = `<div class="loading-screen">Yükleniyor</div>`;
    if (isServer) {
      try {
        const status = await api("/status");
        if (status.setupRequired) return renderSetup();
        if (status.authenticated) {
          const me = await api("/me"); user = me.user;
          const serverUsers = await api("/users").catch(() => ({ users: [user] }));
          const requestList = await api("/account-requests").catch(() => ({ requests: [] }));
          const remote = await api("/state").catch(() => ({ state: null }));
          if (remote.state) {
            const localUsers = db.users;
            db = { ...db, ...remote.state, users: localUsers, settings: { ...db.settings, ...remote.state.settings, ...me.settings } };
          } else db.settings = { ...db.settings, ...me.settings };
          db.users = serverUsers.users; db.accountRequests = requestList.requests || []; db.currentUserId = user.id; helpOpen = db.settings.helpEnabled && !db.preferences[`help.hidden.${day()}`]; save(); render(); refreshRatesIfStale(); return;
        }
        return renderLogin();
      } catch { /* file-compatible fallback */ }
    }
    if (!db.users.length) return renderSetup();
    const sessionId = sessionStorage.getItem("panel-user");
    user = db.users.find(x => x.id === sessionId && x.active);
    return user ? render() : renderLogin();
  }

  function renderSetup() {
    document.documentElement.dataset.theme = "light";
    $("#app").innerHTML = `<main class="auth"><form class="auth-box" id="setupForm">
      <div class="auth-logo"><div><h1>İlk Kullanıcıyı Oluştur</h1><p class="hint">İşletmenizi ve değiştirilemeyen sistem sahibi hesabını oluşturun.</p></div></div>
      <div class="setup-grid">
        <label class="full">İşletme adı<input name="businessName" required autocomplete="organization"></label>
        <label>Sahip adı soyadı<input name="fullName" required autocomplete="name"></label>
        <label>Kullanıcı adı<input name="username" required autocomplete="username"></label>
        <label>E-posta<input name="email" type="email" required autocomplete="email"></label>
        <label>Telefon<input name="phone" inputmode="tel" autocomplete="tel"></label>
        <label>Para birimi<select name="currency"><option>TL</option><option>USD</option><option>EUR</option></select></label>
        <label>Varsayılan dil<select name="language"><option value="tr">Türkçe</option><option value="en">English</option><option value="ar">العربية</option><option value="de">Deutsch</option></select></label>
        <label>Şube adı<input name="branchName" value="Merkez" required></label>
        <label>Şifre<input name="password" type="password" required autocomplete="new-password"></label>
        <label>Şifre tekrar<input name="passwordConfirm" type="password" required autocomplete="new-password"></label>
        <div class="full password-meter"><span></span></div>
        <div class="full password-rules"><span data-rule="length">En az 8 karakter</span><span data-rule="upper">Büyük harf</span><span data-rule="lower">Küçük harf</span><span data-rule="number">Rakam</span></div>
      </div>
      <button type="submit">İlk Kullanıcıyı Oluştur</button>
      <p class="hint">İlk hesap İşletme Sahibi rolündedir; silinemez, pasifleştirilemez ve bütün hesapları yönetir.</p>
    </form></main>`;
    const pass = $("[name=password]"), meter = $(".password-meter span");
    pass.oninput = () => {
      const v = pass.value, checks = { length: v.length >= 8, upper: /[A-ZÇĞİÖŞÜ]/.test(v), lower: /[a-zçğıöşü]/.test(v), number: /\d/.test(v) };
      Object.entries(checks).forEach(([k, ok]) => $(`[data-rule=${k}]`).classList.toggle("ok", ok));
      const score = Object.values(checks).filter(Boolean).length; meter.style.width = `${score * 25}%`; meter.style.background = score < 3 ? "var(--red)" : score < 4 ? "var(--amber)" : "var(--green)";
    };
    $("#setupForm").onsubmit = async e => {
      e.preventDefault(); const data = formData(e.target), submit = e.submitter; submit.classList.add("loading");
      try {
        if (!validPassword(data.password)) throw new Error("Şifre en az 8 karakter, büyük harf, küçük harf ve rakam içermeli.");
        if (data.password !== data.passwordConfirm) throw new Error("Şifreler aynı değil.");
        if (isServer) await api("/setup", { method: "POST", body: JSON.stringify(data) });
        else {
          const owner = { id: id("USR"), fullName: data.fullName, username: data.username, email: data.email.toLowerCase(), phone: data.phone, role: "OWNER", active: true, permissions: ["*"], passwordHash: await hashPassword(data.password), failedAttempts: 0, lockedUntil: null, createdAt: iso() };
          const branch = { id: id("BRA"), name: data.branchName, active: true, createdAt: iso() };
          db.users = [owner]; db.branches = [branch]; db.settings = { ...db.settings, businessName: data.businessName, currency: data.currency, language: data.language, branchName: data.branchName }; audit("İlk OWNER oluşturuldu", "KULLANICI", owner.id); save();
        }
        toast("Kurulum tamamlandı. Güvenli giriş yapabilirsiniz."); renderLogin();
      } catch (err) { toast(err.message, "error"); } finally { submit.classList.remove("loading"); }
    };
  }
  function renderLogin() {
    $("#app").innerHTML = `<main class="auth"><form class="auth-box" id="loginForm">
      <div class="auth-logo"><div><h1>Güvenli Giriş</h1><p class="hint">Telefoncu işletme yönetim paneli</p></div></div>
      <div class="auth-tabs"><button type="button" class="active">Giriş Yap</button><button type="button" id="openRegisterRequest">Hesap Oluştur</button></div>
      <label>Kullanıcı adı veya e-posta<input name="identity" required autocomplete="username"></label>
      <label>Şifre<input name="password" type="password" required autocomplete="current-password"></label>
      <button type="submit">Giriş Yap</button>
      <p class="hint">Personel hesabınız yoksa Hesap Oluştur düğmesine basın. Talebiniz yönetici onayından sonra aktif olur.</p>
    </form></main>`;
    $("#openRegisterRequest").onclick = renderRegisterRequest;
    $("#loginForm").onsubmit = async e => {
      e.preventDefault(); const data = formData(e.target), submit = e.submitter; submit.classList.add("loading");
      try {
        if (isServer) {
          const result = await api("/login", { method: "POST", body: JSON.stringify(data) });
          user = result.user; db.settings = { ...db.settings, ...result.settings };
          const serverUsers = await api("/users").catch(() => ({ users: [user] }));
          const requestList = await api("/account-requests").catch(() => ({ requests: [] }));
          const remote = await api("/state").catch(() => ({ state: null }));
          if (remote.state) db = { ...db, ...remote.state, settings: { ...db.settings, ...remote.state.settings, ...result.settings } };
          db.users = serverUsers.users; db.accountRequests = requestList.requests || [];
        } else {
          const key = data.identity.trim().toLowerCase(), found = db.users.find(x => x.username.toLowerCase() === key || x.email.toLowerCase() === key);
          if (!found || !found.active) throw new Error("Kullanıcı adı veya şifre hatalı.");
          if (found.lockedUntil && new Date(found.lockedUntil) > new Date()) throw new Error("Hesap geçici olarak kilitli.");
          if (!(await verifyPassword(data.password, found.passwordHash))) {
            found.failedAttempts = (found.failedAttempts || 0) + 1;
            if (found.failedAttempts >= 5) { found.lockedUntil = new Date(Date.now() + 600000).toISOString(); found.failedAttempts = 0; }
            audit("Hatalı giriş", "GÜVENLİK", found.id); save(); throw new Error("Kullanıcı adı veya şifre hatalı.");
          }
          found.failedAttempts = 0; found.lockedUntil = null; found.lastLoginAt = iso(); user = found; audit("Giriş", "GÜVENLİK", found.id);
        }
        db.currentUserId = user.id; sessionStorage.setItem("panel-user", user.id); helpOpen = db.settings.helpEnabled && !db.preferences[`help.hidden.${day()}`]; save(); go("dashboard"); render(); refreshRatesIfStale();
      } catch (err) { toast(err.message, "error"); } finally { submit.classList.remove("loading"); }
    };
  }
  function renderRegisterRequest() {
    $("#app").innerHTML = `<main class="auth"><form class="auth-box" id="requestForm">
      <div class="auth-logo"><div><h1>Hesap Talebi Oluştur</h1><p class="hint">Bu form giriş hesabı açmaz; yönetici onayı ister.</p></div></div>
      <div class="auth-tabs"><button type="button" id="backLogin">Giriş Yap</button><button type="button" class="active">Hesap Oluştur</button></div>
      <div class="setup-grid">
        <label>Ad soyad<input name="fullName" required autocomplete="name"></label>
        <label>Kullanıcı adı<input name="username" required autocomplete="username"></label>
        <label>E-posta<input name="email" type="email" required autocomplete="email"></label>
        <label>Telefon<input name="phone" required inputmode="tel" autocomplete="tel"></label>
        <label>Talep edilen görev<select name="requestedRole">${roleOptions(roles.filter(x=>x!=="OWNER"))}</select></label>
        <label>Şifre<input name="password" type="password" required autocomplete="new-password"></label>
        <label>Şifre tekrar<input name="passwordConfirm" type="password" required autocomplete="new-password"></label>
        <label class="full">Not<textarea name="note" placeholder="Örn. teknik servis personeli olarak çalışacağım"></textarea></label>
        <div class="full password-meter"><span></span></div>
        <div class="full password-rules"><span data-rule="length">En az 8 karakter</span><span data-rule="upper">Büyük harf</span><span data-rule="lower">Küçük harf</span><span data-rule="number">Rakam</span></div>
      </div>
      <button type="submit">Talebimi Gönder</button>
      <p class="hint">Onaylanmadan kimse panele giremez. Admin panelinde onaylandıktan sonra bu bilgilerle giriş yapabilirsiniz.</p>
    </form></main>`;
    $("#backLogin").onclick = renderLogin;
    const pass = $("[name=password]"), meter = $(".password-meter span");
    pass.oninput = () => {
      const v = pass.value, checks = { length: v.length >= 8, upper: /[A-Z]/.test(v), lower: /[a-z]/.test(v), number: /\d/.test(v) };
      Object.entries(checks).forEach(([k, ok]) => $(`[data-rule=${k}]`).classList.toggle("ok", ok));
      const score = Object.values(checks).filter(Boolean).length; meter.style.width = `${score * 25}%`; meter.style.background = score < 3 ? "var(--red)" : score < 4 ? "var(--amber)" : "var(--green)";
    };
    $("#requestForm").onsubmit = async e => {
      e.preventDefault(); const data = formData(e.target), submit = e.submitter; submit.classList.add("loading");
      try {
        if (!validPassword(data.password)) throw new Error("Şifre en az 8 karakter, büyük harf, küçük harf ve rakam içermeli.");
        if (data.password !== data.passwordConfirm) throw new Error("Şifreler aynı değil.");
        if (isServer) await api("/register-request", { method: "POST", body: JSON.stringify(data) });
        else {
          if (db.users.some(x=>x.username.toLowerCase()===data.username.toLowerCase()||x.email.toLowerCase()===data.email.toLowerCase())) throw new Error("Bu kullanıcı adı veya e-posta kullanımda.");
          db.accountRequests.unshift({ id:id("REQ"), fullName:data.fullName, username:data.username, email:data.email.toLowerCase(), phone:data.phone, requestedRole:data.requestedRole, note:data.note, status:"PENDING", passwordHash:await hashPassword(data.password), createdAt:iso() });
          save();
        }
        $("#app").innerHTML = `<main class="auth"><section class="auth-box"><div class="auth-logo"><div><h1>Talebiniz Oluşturuldu</h1><p class="hint">Yönetici onayından sonra kullanıcı adı ve şifrenizle giriş yapabilirsiniz.</p></div></div><button id="doneLogin">Giriş Ekranına Dön</button></section></main>`;
        $("#doneLogin").onclick = renderLogin;
      } catch (err) { toast(err.message, "error"); } finally { submit.classList.remove("loading"); }
    };
  }

  const nav = [
    ["dashboard","Genel Bakış"],["services","Servisler"],["appointments","Randevular"],["customers","Müşteriler"],["stock","Stok ve Barkod"],["sales","Satış"],["buy-sell","Al-Sat"],["cash","Kasa"],["finance-settings","Finans ve Sermaye"],["receivables","Alacaklar"],["market-prices","Piyasa Fiyatları"],["suppliers","Tedarikçiler"],["branches","Şubeler"],["warranties","Garantiler"],["reports","Raporlar"],["audit-logs","İşlem Geçmişi"],["settings","Ayarlar"],["users","Kullanıcılar"]
  ];
  function shell(content) {
    const simple = db.settings.simpleMode;
    const roleFilteredNav = isAdmin() ? nav : nav.filter(x => x[0] !== "users");
    const visibleNav = simple ? roleFilteredNav.filter(x => ["dashboard","services","customers","stock","sales","cash"].includes(x[0])) : roleFilteredNav;
    const rate = db.exchangeRates.find(x => x.code === "USD");
    return `<div class="layout">
      <aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark">T</span><div>${esc(db.settings.businessName || "İşletme Paneli")}<small>Servis ve satış yönetimi</small></div></div>
        <nav class="nav">${visibleNav.map(([r,n]) => `<button data-go="${r}" class="${route.startsWith(r) ? "active" : ""}">${n}</button>`).join("")}</nav>
      </aside>
      <main class="main"><header class="topbar">
        <div class="topbar-left"><button class="secondary icon mobile-menu" data-action="menu" title="Menü">☰</button><input class="search" id="globalSearch" placeholder="Müşteri, telefon, servis no, IMEI veya ürün ara"><button data-action="globalSearch">Ara</button></div>
        <div class="topbar-right"><span class="top-rate">USD ${rate ? money(rate.sellRate, "USD") : "eklenmedi"}</span>
          <select id="languageSelect" title="Dil seç"><option value="tr">Türkçe</option><option value="en">English</option><option value="ar">العربية</option><option value="de">Deutsch</option></select>
          <button class="secondary icon" data-go="notifications" title="Bildirimler">●</button><button class="secondary" data-action="toggleHelp">Yardım</button>
          <div class="user-menu"><button class="secondary" data-action="userMenu">${esc(user.fullName || user.name || user.username)}</button><div class="user-popover" id="userPopover">
            <button class="secondary" data-go="account">Hesabım</button><button class="secondary" data-go="settings">Ayarlar</button><button class="secondary" data-action="passwordModal">Şifremi Değiştir</button><button class="danger" data-action="logout">Çıkış Yap</button>
          </div></div>
        </div>
      </header><section class="content">${content}</section></main>
      <button class="help-fab" data-action="toggleHelp" title="Bu sayfada ne yapılır?">?</button>
      ${helpOpen ? helpDrawer() : ""}<div class="print-area" id="printArea"></div>
    </div>`;
  }
  function helpDrawer() {
    const key = help[route] ? route : route.split("/")[0], steps = help[key] || help.default;
    return `<aside class="help-drawer"><div class="modal-head"><h2>Bu sayfada ne yapılır?</h2><button class="secondary icon" data-action="toggleHelp">×</button></div>
      <p>${esc(steps[0])}</p><ol class="help-steps">${steps.slice(1).map(x => `<li>${esc(x)}</li>`).join("")}</ol>
      <div class="toolbar"><button data-action="helpTour">Adım Adım Anlat</button><button class="secondary" data-action="toggleHelp">Yardımı Kapat</button><button class="secondary" data-action="hideHelpToday">Bugün Gösterme</button><button class="secondary" data-action="alwaysShowHelp">Yardımı Her Zaman Göster</button><button class="secondary" data-action="resetHelp">Yardım Ayarlarını Sıfırla</button>${["OWNER","ADMIN"].includes(user.role) ? `<button class="secondary" data-action="editHelp">Bu Sayfanın Yardımını Düzenle</button>` : ""}</div></aside>`;
  }
  function page(title, desc, actions, body) { return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="toolbar">${actions || ""}</div></div>${body}`; }
  function render() {
    document.documentElement.dataset.theme = db.settings.theme; document.documentElement.dir = db.settings.language === "ar" ? "rtl" : "ltr";
    let content;
    if (route === "dashboard") content = dashboard();
    else if (route === "services/new") content = serviceForm();
    else if (route === "services") content = services();
    else if (route === "appointments") content = appointments();
    else if (route === "customers") content = customers();
    else if (route === "stock") content = stock();
    else if (route === "sales") content = sales();
    else if (route === "buy-sell") content = buySell();
    else if (route === "cash") content = cash();
    else if (route === "finance-settings") content = can("finance.view") ? financeSettings() : denied();
    else if (route === "receivables") content = receivables();
    else if (route === "market-prices") content = marketPrices();
    else if (route === "suppliers") content = suppliers();
    else if (route === "branches") content = branches();
    else if (route === "warranties") content = warranties();
    else if (route === "reports") content = can("reports.view") ? reports() : denied();
    else if (route === "audit-logs") content = can("audit.view") ? auditLogs() : denied();
    else if (route === "settings") content = can("settings.manage") ? settings() : denied();
    else if (route === "users") content = users();
    else if (route === "account") content = account();
    else if (route === "notifications") content = notificationsPage();
    else if (route.startsWith("track")) return renderTracking();
    else content = page("Sayfa bulunamadı", "Aradığınız ekran taşınmış veya mevcut değil.", button("Panele Dön","goDashboard"), `<div class="panel empty-state"><strong>404</strong>Menüden başka bir sayfa seçebilirsiniz.</div>`);
    $("#app").innerHTML = shell(content);
    $("#languageSelect").value = db.settings.language;
    bind();
  }
function denied(){return page("Yetki Gerekli","Bu alan hesabınıza açılmamış.","",`<div class="empty-state"><strong>Erişim izniniz yok</strong>İşletme Sahibi hesabından bu kullanıcıya gerekli izin verilebilir.</div>`);}

  function dashboard() {
    const ready = db.services.filter(x => x.status === "HAZIR").length, repair = db.services.filter(x => x.status === "TAMIRDE").length;
    const low = db.stock.filter(x => Number(x.quantity) <= Number(x.minQuantity)).length;
    const overdue = db.receivables.filter(x => x.status !== "ODENDI" && x.dueDate < day()).length;
    const warrantySoon = db.warranties.filter(x => x.endDate >= day() && new Date(x.endDate) - new Date() < 7 * 86400000).length;
    const finance = dailyFinance();
    const income = finance.cashIn;
    const simple = db.settings.simpleMode;
    const quick = simple ? [
      ["Yeni Tamir Kaydı Aç","services/new"],["Müşteri Bul","customers"],["Cihazı Hazır Yap","services"],["Para Aldım","cash"],["Ürün Sattım","sales"],["Stok Ekledim","stock"],["Bugünkü Kasayı Gör","cash"],["Yardım","help"]
    ] : [["Yeni Servis Kaydı","services/new"],["Yeni Satış","sales"],["Kasa Girişi","cashIn"],["Kasa Çıkışı","cashOut"],["Stok Ekle","stock"],["Müşteri Ekle","customers"],["Yeni Randevu","appointment"],["Bugünkü Rapor","reports"]];
    return page("Genel Bakış","Bugün işletmenizde olan biten her şey tek ekranda.",
      button(simple ? "Normal Moda Geç" : "Basit Modu Aç","simpleMode","secondary"),
      `<div class="stats grid">
        ${stat("Bugünkü Toplam Ciro", money(finance.turnover), "green")}${stat("Bugünkü Brüt Kâr", money(finance.grossProfit), "green")}${stat("Bugünkü Gider Payı", money(finance.expenseShare), "orange")}${stat("Bugünkü Net Kâr", money(finance.netProfit), finance.netProfit < 0 ? "red" : "green")}${stat("Bugünkü Zarar", money(Math.max(0,-finance.netProfit)), "red")}${stat("Kâra Geçme Noktası", money(finance.breakEven), "gray")}
      </div>
      <div class="stats grid">
        ${stat("Servis Geliri",money(finance.serviceRevenue),"blue")}${stat("Aksesuar Satışı",money(finance.saleRevenue),"blue")}${stat("Al-Sat Satışı",money(finance.buySellRevenue),"blue")}${stat("Kasa Girişi",money(finance.cashIn),"green")}${stat("Kasa Çıkışı",money(finance.cashOut),"red")}${stat(finance.netProfit>=0?"Bugün Kâra Geçtin":"Kâra Geçmek İçin",finance.netProfit>=0?"Evet":money(Math.max(0,finance.breakEven-finance.grossProfit)),finance.netProfit>=0?"green":"orange")}
      </div>
      <div class="stats grid">
        ${stat("Bugün Cihaz Alındı",finance.boughtCount,"gray")}${stat("Bugün Cihaz Satıldı",finance.soldCount,"gray")}${stat("Bugün Servis Açıldı",finance.openedServices,"gray")}${stat("Bugün Servis Teslim",finance.deliveredServices,"gray")}${stat("Tamirde", repair, "blue")}${stat("Hazır Cihaz", ready, "green")}
      </div>
      <div class="alert-strip">${alert("Düşük stok uyarısı", `${low} ürün kritik seviyede`, low)}${alert("Vadesi geçen alacak", `${overdue} ödeme gecikmiş`, overdue)}${alert("Hazır bekleyen cihaz", `${ready} cihaz teslim bekliyor`, ready)}${alert("Garanti bitişi", `${warrantySoon} garanti yakında bitiyor`, warrantySoon)}</div>
      <div class="grid dashboard-top">
        <section class="panel"><h2>Hızlı İşlemler</h2><div class="quick-grid ${simple ? "simple-actions" : ""}">${quick.map(([n,a]) => `<button data-action="${a}">${esc(n)}<span>${quickHint(a)}</span></button>`).join("")}</div></section>
        ${ratesBox()}
      </div>
      <section class="panel"><div class="page-head"><div><h2>Son İşlemler</h2><p>Servis, satış, stok, ödeme ve kullanıcı hareketleri.</p></div>${button(recentOpen ? "Son İşlemleri Gizle" : "Son İşlemleri Göster","toggleRecent","secondary")}</div>${recentOpen ? recentTable() : ""}</section>`);
  }
  function stat(name, value, cls) { return `<div class="stat ${cls}"><span>${esc(name)}</span><strong>${esc(value)}</strong><small>Güncel veri</small></div>`; }
  function alert(name, text, count) { return `<div class="alert-box ${count ? "danger" : ""}"><strong>${esc(name)}</strong><div>${esc(text)}</div></div>`; }
  function quickHint(a) { return ({ "services/new":"Yeni cihaz kabulü","sales":"Ürün satışı","cashIn":"Kasaya para ekle","cashOut":"Kasadan ödeme yap","stock":"Ürün ve parça","customers":"Müşteri işlemleri","appointment":"Takvime ekle","reports":"Gün özeti","cash":"Kasa hareketleri","help":"Adım adım anlatım" }[a] || "Ekranı aç"); }
  function ratesBox() {
    const codes = [["USD","Dolar"],["EUR","Euro"],["GOLD_GR","Gram Altın"],["GOLD_Q","Çeyrek Altın"]];
    return `<section class="panel"><div class="page-head"><div><h2>Canlı Kur Bilgileri</h2><p>${db.exchangeRates[0] ? `Son güncelleme: ${fmt(db.exchangeRates[0].recordedAt)}` : "Kur bilgisi eklenmedi"}</p></div></div>
      <div class="rate-grid">${codes.map(([c,n]) => { const r=db.exchangeRates.find(x=>x.code===c); return `<div class="rate">${n}<strong>${r ? `${r.buyRate} / ${r.sellRate}` : "-"}</strong></div>`; }).join("")}</div>
      <div class="toolbar" style="margin-top:10px">${button("Kurları Yenile","refreshRates")}${button("Manuel Kur Gir","rateModal","secondary")}${button("Döviz Hesapla","currencyCalc","secondary")}</div></section>`;
  }
  function recentTable() {
    const rows = [
      ...db.services.slice(0,3).map(x=>({type:"Servis",text:`${x.no} ${x.brand} ${x.model}`,at:x.createdAt})),
      ...db.sales.slice(0,3).map(x=>({type:"Satış",text:`${x.no} ${money(x.total)}`,at:x.createdAt})),
      ...db.stockMovements.slice(0,3).map(x=>({type:"Stok",text:`${x.title} ${x.quantity}`,at:x.createdAt})),
      ...db.cash.slice(0,3).map(x=>({type:"Kasa",text:`${x.title} ${money(x.amount)}`,at:x.at})),
      ...db.auditLogs.filter(x=>x.action.includes("Giriş")).slice(0,3).map(x=>({type:"Kullanıcı",text:x.userName,at:x.createdAt}))
    ].sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,10);
    return rows.length ? table(["Tür","İşlem","Tarih"], rows.map(x=>[x.type,x.text,fmt(x.at)])) : `<div class="empty-state"><strong>Henüz işlem yok</strong>İlk kaydınızdan sonra son işlemler burada görünecek.</div>`;
  }
  function table(headers, rows) { return `<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((x,i)=>`<td class="${i===r.length-1 ? "actions" : ""}">${x ?? "-"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }
  function periodDaily(expense, date = new Date()) {
    const amount = Number(expense.amount || 0), days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (expense.period === "MONTHLY") return amount / days;
    if (expense.period === "WEEKLY") return amount / 7;
    if (expense.period === "DAILY") return amount;
    return expense.createdAt?.slice(0,10) === day() ? amount : 0;
  }
  function dailyFinance(targetDay = day()) {
    const cash = db.cash.filter(x => x.at?.slice(0,10) === targetDay);
    const services = db.services.filter(x => (x.deliveredAt || x.updatedAt || "").slice(0,10) === targetDay);
    const sales = db.sales.filter(x => x.createdAt?.slice(0,10) === targetDay);
    const buys = db.buySell.filter(x => x.purchaseDate?.slice(0,10) === targetDay);
    const sold = db.buySell.filter(x => x.soldDate?.slice(0,10) === targetDay);
    const serviceRevenue = services.reduce((a,x)=>a+Number(x.paid||x.price||0),0);
    const saleRevenue = sales.reduce((a,x)=>a+Number(x.total||0),0);
    const buySellRevenue = sold.reduce((a,x)=>a+Number(x.actualSalePrice||0),0);
    const saleCost = sales.flatMap(x=>x.items||[]).reduce((a,item)=>a+Number(db.stock.find(s=>s.id===item.stockId)?.buyPrice||0)*Number(item.quantity||0),0);
    const buySellProfit = sold.reduce((a,x)=>a+Number(x.actualProfit||0),0);
    const grossProfit = serviceRevenue + (saleRevenue-saleCost) + buySellProfit;
    const expenseShare = db.expenses.filter(x=>x.includeInProfitCalculation!==false).reduce((a,x)=>a+periodDaily(x,new Date(targetDay)),0);
    const manualExpense = cash.filter(x=>x.type==="OUT" && x.category==="MANUEL_GIDER").reduce((a,x)=>a+Number(x.amount),0);
    const cashIn = cash.filter(x=>x.type==="IN").reduce((a,x)=>a+Number(x.amount),0);
    const cashOut = cash.filter(x=>x.type==="OUT").reduce((a,x)=>a+Number(x.amount),0);
    return { serviceRevenue,saleRevenue,buySellRevenue,cashIn,cashOut,grossProfit,expenseShare:expenseShare+manualExpense,netProfit:grossProfit-expenseShare-manualExpense,turnover:serviceRevenue+saleRevenue+buySellRevenue,breakEven:expenseShare+manualExpense,boughtCount:buys.length,soldCount:sold.length,openedServices:db.services.filter(x=>x.createdAt?.slice(0,10)===targetDay).length,deliveredServices:services.length };
  }
  function ensureCashAccounts() {
    if (!db.cashAccounts.length) db.cashAccounts = ["Ana Kasa","Nakit Kasa","Kart Pos","Banka","Döviz Kasa","Altın Kasa"].map(name=>({id:id("CA"),name,currency:name.includes("Döviz")?"USD":"TL",balance:0,createdAt:iso()}));
  }

  function smartDevice(prefix = "") {
    const brands = db.brands;
    return `<div class="smart-device"><h3>Akıllı Cihaz Seçimi</h3><div class="form-grid">
      <label>Cihaz türü<select name="${prefix}deviceType"><option>Telefon</option><option>Tablet</option><option>Laptop</option><option>Masaüstü</option><option>Aksesuar</option><option>Diğer</option></select></label>
      <label>Marka<select name="${prefix}brand" data-brand="${prefix}"><option value="">Marka seçin</option>${brands.map(x=>`<option>${esc(x.name)}</option>`).join("")}</select></label>
      <label>Model<select name="${prefix}model" data-model="${prefix}"><option value="">Önce marka seçin</option><option value="MANUAL">Model Listesinde Yok</option></select></label>
      <label data-manual-wrap="${prefix}" hidden>Manuel model<input name="${prefix}manualModel" placeholder="Modeli yazın"></label>
      <label>Depolama<select name="${prefix}storage" data-storage="${prefix}"><option value="">Seçin</option></select></label>
      <label>RAM<select name="${prefix}ram" data-ram="${prefix}"><option value="">Seçin</option></select></label>
      <label>Renk<select name="${prefix}color" data-color="${prefix}"><option value="">Seçin</option></select></label>
      <label>IMEI / Seri No<input name="${prefix}imeiOrSerial"></label>
    </div></div>`;
  }
  function serviceForm() {
    return page("Yeni Servis Kaydı","Müşteri ve cihaz bilgilerini girerek yeni tamir kaydı açın.", button("Geri Dön","goServices","secondary"),
      `<form class="panel" id="serviceForm"><div class="form-grid">
        <label>Müşteri adı soyadı<input name="customerName" required></label><label>Telefon<input name="phone" required inputmode="tel"></label>
        <label class="wide">Adres<input name="address"></label>${smartDevice()}
        <label class="wide">Arıza / Müşteri şikâyeti<textarea name="issue" required></textarea></label>
        <label>Hazır arıza şablonu<select name="issueTemplate"><option value="">Seçin</option><option>Ekran kırık</option><option>Batarya zayıf</option><option>Şarj almıyor</option><option>Açılmıyor</option><option>Sıvı teması</option></select></label>
        <label>Tahmini ücret<input name="price" type="number" min="0"></label><label>Ön ödeme<input name="prepayment" type="number" min="0"></label><label>Garanti günü<input name="warrantyDays" type="number" value="90"></label>
        <label>Şube<select name="branchId"><option value="">Merkez</option>${db.branches.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select></label>
        <label class="full">Teknik not<textarea name="note"></textarea></label>
      </div>
      <div class="toolbar" style="margin-top:14px">${button("Müşteri Bul","findCustomer","secondary")}${button("Cihaz Geçmişini Kontrol Et","deviceHistory","secondary")}${button("Fotoğraftan Doldur","ocrModal","secondary")}${button("Servis Kaydını Oluştur","saveService")}${button("Kaydet ve Yazdır","saveServicePrint","blue")}${button("Temizle","clearForm","secondary")}</div></form>`);
  }
  function services() {
    const rows = db.services.map(s => {
      const c = db.customers.find(x=>x.id===s.customerId);
      return [esc(s.no),esc(c?.name),esc(`${s.brand} ${s.model}`),badge(s.status),money(s.price),`${button("Detay",`serviceDetail:${s.id}`,"secondary")}${button("Durum Değiştir",`serviceStatus:${s.id}`)}${button("Ödeme Al",`servicePay:${s.id}`,"blue")}${button("WhatsApp",`serviceWhatsApp:${s.id}`,"secondary")}${button("Takip Linki",`trackingLink:${s.id}`,"secondary")}${button("Sil",`serviceDelete:${s.id}`,"danger")}`];
    });
    return page("Servis Kayıtları","Tamirdeki, hazır ve teslim edilmiş cihazları yönetin.", button("Yeni Servis Kaydı","goNewService"),
      db.services.length ? table(["Servis No","Müşteri","Cihaz","Durum","Tutar","İşlemler"],rows) : empty("Henüz servis kaydı yok","İlk servis kaydını oluşturmak için düğmeye basın.","Yeni Servis Kaydı","services/new"));
  }
  function badge(v) { const cls = ["HAZIR","GELDİ","ÖDENDİ","SATILDI"].includes(v) ? "green" : ["İPTAL","İADE","ZARAR"].includes(v) ? "red" : "orange"; return `<span class="badge ${cls}">${esc(String(v||"-").replaceAll("_"," "))}</span>`; }

  function appointments() {
    const nowDate = new Date(), year = nowDate.getFullYear(), month = nowDate.getMonth(), first = new Date(year,month,1), days = new Date(year,month+1,0).getDate();
    const cells = Array(first.getDay()===0?6:first.getDay()-1).fill("").concat(Array.from({length:days},(_,i)=>i+1));
    const calendar = `<div class="calendar">${["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(x=>`<div class="calendar-day"><strong>${x}</strong></div>`).join("")}${cells.map(d=>{ const date=d?`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`:""; const items=db.appointments.filter(x=>x.date===date); return `<div class="calendar-day">${d?`<strong>${d}</strong>`:""}${items.map(x=>`<div class="appointment">${esc(x.time)} ${esc(x.customerName)}<br>${esc(x.status)}</div>`).join("")}</div>`; }).join("")}</div>`;
    return page("Servis Randevuları","Müşteri geliş saatlerini takvimden planlayın.", button("Yeni Randevu","appointment"), `<section class="panel">${calendar}</section>${db.appointments.length ? table(["Tarih","Saat","Müşteri","Telefon","Durum","İşlem"],db.appointments.map(x=>[x.date,x.time,esc(x.customerName),esc(x.phone),badge(x.status),`${button("Durum Güncelle",`appointmentStatus:${x.id}`)}${button("Düzenle",`appointmentEdit:${x.id}`,"secondary")}${button("Sil",`appointmentDelete:${x.id}`,"danger")}`])) : ""}`);
  }
  function customers() {
    return page("Müşteriler","Servis, satış ve borç geçmişiyle birlikte müşteri listeniz.",button("Yeni Müşteri","customerModal"),
      db.customers.length ? table(["Ad Soyad","Telefon","Borç","Kayıt","İşlemler"],db.customers.map(c=>[esc(c.name),esc(c.phone),money(db.receivables.filter(x=>x.customerId===c.id&&x.status!=="ODENDI").reduce((a,x)=>a+Number(x.total-x.paid),0)),fmt(c.createdAt),`${button("Müşteri Detayı",`customerDetail:${c.id}`,"secondary")}${button("Düzenle",`customerEdit:${c.id}`,"secondary")}${button("Servis Kaydı Aç",`customerService:${c.id}`)}${button("WhatsApp Mesajı",`customerWhatsApp:${c.id}`,"secondary")}${button("Sil",`customerDelete:${c.id}`,"danger")}`])) : empty("Henüz müşteri yok","Yeni müşteri ekleyerek başlayın.","Yeni Müşteri","customers"));
  }
  function stock() {
    return page("Stok ve Barkod","Aksesuar, ürün ve servis parçalarını takip edin.",`${button("Yeni Ürün Ekle","stockModal")}${button("Barkod Okut","barcodeScan","secondary")}${button("Excel’e Aktar","exportStock","secondary")}`,
      db.stock.length ? table(["Ürün","Barkod","Stok","Alış","Satış","Durum","İşlemler"],db.stock.map(x=>[esc(x.name),esc(x.barcode),x.quantity,money(x.buyPrice),money(x.salePrice),Number(x.quantity)<=Number(x.minQuantity)?badge("DÜŞÜK"):badge("YETERLİ"),`${button("Stok Girişi",`stockIn:${x.id}`)}${button("Stok Çıkışı",`stockOut:${x.id}`,"secondary")}${button("Düzenle",`stockEdit:${x.id}`,"secondary")}${button("Hareketler",`stockMoves:${x.id}`,"secondary")}${button("Barkod Yazdır",`barcodePrint:${x.id}`,"secondary")}${button("Sil",`stockDelete:${x.id}`,"danger")}`])) : empty("Henüz stok ürünü eklenmedi","Ürün eklemek için Yeni Ürün Ekle düğmesine basın.","Yeni Ürün Ekle","stock"));
  }
  function sales() {
    const options=db.stock.map(x=>`<option value="${x.id}">${esc(x.name)} - ${money(x.salePrice)} (${x.quantity})</option>`).join("");
    return page("Satış Ekranı","Barkod veya ürün seçerek hızlı satış yapın.","",`<section class="grid split"><form class="panel" id="saleForm"><h2>Yeni Satış</h2><div class="form-grid"><label class="wide">Ürün<select name="productId"><option value="">Ürün seçin</option>${options}</select></label><label>Barkod<input name="barcode" autofocus></label><label>Adet<input name="quantity" type="number" min="1" value="1"></label><label>Müşteri<select name="customerId"><option value="">Perakende müşteri</option>${db.customers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label><label>Ödeme<select name="payment"><option>Nakit</option><option>Kart</option><option>Havale</option><option>Veresiye</option></select></label><label>İndirim<input name="discount" type="number" value="0"></label></div><div class="toolbar" style="margin-top:14px">${button("Barkodla Ürün Bul","findBarcode","secondary")}${button("Satışı Tamamla","completeSale")}</div></form><section class="panel"><h2>Son Satışlar</h2>${db.sales.length?table(["No","Toplam","Ödeme","Tarih","İşlemler"],db.sales.slice(0,12).map(x=>[x.no,money(x.total),x.payment,fmt(x.createdAt),`${button("Detay",`saleDetail:${x.id}`,"secondary")}${button("Fiş Yazdır",`salePrint:${x.id}`,"secondary")}${button("Satışı İptal Et",`saleCancel:${x.id}`,"danger")}`])):`<div class="empty-state"><strong>Henüz satış yok</strong>İlk satışınız burada görünecek.</div>`}</section></section>`);
  }
  function buySell() {
    ensureCashAccounts();
    const customerOptions=db.customers.map(x=>`<option value="${x.id}">${esc(x.name)} - ${esc(x.phone)}</option>`).join("");
    const rows=db.buySell.map(x=>{const seller=db.customers.find(c=>c.id===x.purchaseCustomerId),buyer=db.customers.find(c=>c.id===x.saleCustomerId);return[`${esc(x.brand)} ${esc(x.model)}`,esc(seller?.name||"-"),esc(buyer?.name||"-"),money(x.purchasePrice),money(x.totalCost),money(x.actualSalePrice||x.targetSalePrice),profitBadge(x),`${daysStock(x)} gün`,badge(x.status),`${button("Detay",`buyDetail:${x.id}`,"secondary")}${button("Masraf Ekle",`buyCost:${x.id}`,"secondary")}${button("Satıldı Olarak İşaretle",`buySold:${x.id}`)}${button("Evrakları Gör",`mediaList:BUY_SELL:${x.id}`,"secondary")}`]});
    return page("Al-Sat Yönetimi","İkinci el cihazların maliyetini, hedefini ve gerçek kârını izleyin.",button("Kar/Zarar Raporu","profitReport","secondary"),
      `<form class="panel" id="buyForm">${smartDevice("buy")}<div class="form-grid" style="margin-top:12px">
        <label>Satın alınan müşteri<select name="purchaseCustomerId" required><option value="">Müşteri seçin</option>${customerOptions}</select></label>
        <label>Kondisyon<select name="condition"><option>Sıfır</option><option>Çok Temiz</option><option>Temiz</option><option>Orta</option><option>Hasarlı</option><option>Parça Niyetine</option></select></label>
        <label>Gerçek alış fiyatı<input name="purchasePrice" type="number" value="0"></label><label>Tahmini alış fiyatı<input name="estimatedPurchasePrice" type="number" value="0"></label>
        <label>Tahmini satış fiyatı<input name="estimatedSalePrice" type="number" value="0"></label><label>Hedef satış fiyatı<input name="targetSalePrice" type="number" value="0"></label><label>Minimum satış fiyatı<input name="minSalePrice" type="number" value="0"></label>
        <label>Tamir masrafı<input name="repairCost" type="number" value="0"></label><label>Temizlik gideri<input name="cleaningCost" type="number" value="0"></label><label>Aksesuar gideri<input name="accessoryCost" type="number" value="0"></label><label>Kargo gideri<input name="cargoCost" type="number" value="0"></label><label>Vergi gideri<input name="taxCost" type="number" value="0"></label><label>Diğer gider<input name="otherCost" type="number" value="0"></label>
        <label>Alış tarihi<input name="purchaseDate" type="date" value="${day()}"></label><label>Ödeme kasası<select name="cashAccountId">${db.cashAccounts.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label>
        <label class="wide">Alım evrakı / fatura<input name="purchaseDocument" type="file" accept="image/*,.pdf"></label><label class="wide">Cihaz kanıt videosu<input name="purchaseVideo" type="file" accept="video/*"></label>
        <label class="full">Not<textarea name="note"></textarea></label>
      </div><div id="profitPreview" class="profit-box"></div><div class="toolbar">${button("Piyasa Fiyatına Bak","buyMarket","secondary")}${button("Tahmini Alış Fiyatı Hesapla","estimateBuy","secondary")}${button("Hedef Satış Fiyatı Hesapla","estimateSale","secondary")}${button("Fotoğraftan Doldur","ocrModal","secondary")}${button("Stokta Olarak Kaydet","saveBuy")}</div></form>
      <section class="panel"><h2>Al-Sat Cihazları</h2>${db.buySell.length?table(["Cihaz","Kimden Alındı","Kime Satıldı","Alış","Maliyet","Satış/Hedef","Kâr/Zarar","Bekleme","Durum","İşlemler"],rows):`<div class="empty-state"><strong>Henüz al-sat cihazı yok</strong>Yukarıdaki formdan ilk cihazı ekleyin.</div>`}</section>`);
  }
  function daysStock(x) { return Math.max(0,Math.floor((new Date(x.soldDate||day())-new Date(x.purchaseDate||x.createdAt))/86400000)); }
  function profitBadge(x){const p=Number(x.actualSalePrice?x.actualProfit:x.expectedProfit||0),targetDiff=Number(x.actualSalePrice||0)-Number(x.targetSalePrice||0);if(x.actualSalePrice&&targetDiff>0)return `<span class="badge green">Hedef üstü ${money(targetDiff)} · Kâr ${money(p)}</span>`;if(p>0)return `<span class="badge green">Kâr ${money(p)}</span>`;if(p<0)return `<span class="badge red">Zarar ${money(Math.abs(p))}</span>`;return `<span class="badge">Başa baş</span>`;}
  function cash() {
    ensureCashAccounts();
    const total=db.cash.reduce((a,x)=>a+(x.type==="IN"?1:-1)*Number(x.amount),0);
    return page("Kasa","Nakit, kart, havale, gelir ve gider hareketlerini yönetin.",`${button("Kasa Girişi Ekle","cashIn")}${button("Kasa Çıkışı Ekle","cashOut","danger")}${button("Günlük Kasayı Kapat","closeDay","secondary")}`,
      `<div class="stats grid">${stat("Kasa Bakiyesi",money(total),"green")}${stat("Bugünkü Giriş",money(db.cash.filter(x=>x.type==="IN"&&x.at.slice(0,10)===day()).reduce((a,x)=>a+Number(x.amount),0)),"blue")}${stat("Bugünkü Çıkış",money(db.cash.filter(x=>x.type==="OUT"&&x.at.slice(0,10)===day()).reduce((a,x)=>a+Number(x.amount),0)),"red")}</div>
      ${db.cash.length?table(["Tür","Açıklama","Yöntem","Tutar","Tarih","İşlemler"],db.cash.map(x=>[badge(x.type==="IN"?"GİRİŞ":"ÇIKIŞ"),esc(x.title),esc(x.method||"Nakit"),money(x.amount),fmt(x.at),`${button("Düzenle",`cashEdit:${x.id}`,"secondary")}${button("Sil",`cashDelete:${x.id}`,"danger")}`])):`<div class="empty-state"><strong>Henüz kasa hareketi yok</strong>Kasa girişi veya çıkışı ekleyin.</div>`}`);
  }
  function financeSettings() {
    ensureCashAccounts();
    const f=dailyFinance(), capital=db.capitalAccounts.reduce((a,x)=>a+Number(x.currentCapital||0),0);
    const cashValue=db.cashAccounts.reduce((a,x)=>a+Number(x.balance||0),0);
    const stockValue=db.stock.reduce((a,x)=>a+Number(x.buyPrice||0)*Number(x.quantity||0),0);
    const tradeValue=db.buySell.filter(x=>x.status!=="SATILDI").reduce((a,x)=>a+Number(x.totalCost||0),0);
    const receivable=db.receivables.reduce((a,x)=>a+Math.max(0,Number(x.total||0)-Number(x.paid||0)),0);
    const debts=db.supplierDebts.reduce((a,x)=>a+Math.max(0,Number(x.amount||0)-Number(x.paid||0)),0);
    const netWorth=capital+cashValue+stockValue+tradeValue+receivable-debts;
    return page("Finans ve Sermaye","Gider paylarını, kasaları, sermayeyi ve işletmenin gerçek değerini yönetin.",
      `${button("Gider Ekle","expenseModal")}${button("Aylık Kira Gir","rentModal","secondary")}${button("Yemek Gideri Gir","mealModal","secondary")}${button("Kişisel Gider Ekle","personalExpenseModal","secondary")}`,
      `<div class="stats grid">${stat("Başlangıç/Mevcut Sermaye",money(capital),"blue")}${stat("Kasadaki Para",money(cashValue),"green")}${stat("Stoktaki Ürün Değeri",money(stockValue),"orange")}${stat("Al-Sat Stok Değeri",money(tradeValue),"orange")}${stat("Bekleyen Alacak",money(receivable),"blue")}${stat("Net İşletme Değeri",money(netWorth),"green")}</div>
      <div class="stats grid">${stat("Bugünkü Ciro",money(f.turnover),"green")}${stat("Ürün/Servis Brüt Kârı",money(f.grossProfit),"green")}${stat("Bugünkü Gider Payı",money(f.expenseShare),"red")}${stat("Bugünkü Net Kâr",money(f.netProfit),f.netProfit<0?"red":"green")}${stat("Kâra Geçme Noktası",money(f.breakEven),"gray")}${stat("Durum",f.netProfit>=0?"Bugün kâra geçtin":`${money(Math.max(0,f.breakEven-f.grossProfit))} daha gerekli`,f.netProfit>=0?"green":"orange")}</div>
      <section class="grid split"><div class="panel"><h2>Sermaye Hesapları</h2><div class="toolbar">${button("Sermaye Ekle","capitalAdd")}${button("Sermaye Çek","capitalWithdraw","danger")}${button("Finans Raporu Al","financeReport","secondary")}</div>${db.capitalAccounts.length?table(["Hesap","Başlangıç","Mevcut","Not"],db.capitalAccounts.map(x=>[esc(x.name),money(x.initialCapital),money(x.currentCapital),esc(x.note)])):`<div class="empty-state"><strong>Sermaye hesabı yok</strong>Sermaye Ekle düğmesiyle başlayın.</div>`}</div>
      <div class="panel"><h2>Kasa Hesapları</h2>${table(["Hesap","Para Birimi","Bakiye"],db.cashAccounts.map(x=>[esc(x.name),x.currency,money(x.balance,x.currency)]))}</div></section>
      <section class="panel"><div class="page-head"><div><h2>İşletme Giderleri</h2><p>Aylık giderler ayın gün sayısına bölünür.</p></div>${button("Bugünkü Net Kârı Hesapla","dailyProfit","secondary")}${button("Kâra Geçme Noktasını Göster","breakEven","secondary")}</div>${db.expenses.length?table(["Gider","Kategori","Tutar","Dönem","Günlük Pay","Kişisel","İşlemler"],db.expenses.map(x=>[esc(x.name),esc(x.category),money(x.amount),x.period,money(periodDaily(x)),x.isPersonalExpense?"Evet":"Hayır",button("Sil",`expenseDelete:${x.id}`,"danger")])):`<div class="empty-state"><strong>Henüz gider tanımlanmadı</strong>Kira, yemek veya başka bir gider ekleyin.</div>`}</section>`);
  }
  function receivables() {
    return page("Alacaklar","Müşteri borçlarını, vadeleri ve tahsilatları takip edin.",button("Alacak Ekle","receivableModal"),
      db.receivables.length?table(["Müşteri","Açıklama","Toplam","Kalan","Vade","Durum","İşlemler"],db.receivables.map(x=>{const c=db.customers.find(c=>c.id===x.customerId);return[esc(c?.name),esc(x.title),money(x.total),money(x.total-x.paid),x.dueDate,badge(x.status),`${button("Ödeme Al",`receivePay:${x.id}`)}${button("Düzenle",`receivableEdit:${x.id}`,"secondary")}${button("Hatırlatma Mesajı",`debtMessage:${x.id}`,"secondary")}${button("Sil",`receivableDelete:${x.id}`,"danger")}`]})):`<div class="empty-state"><strong>Henüz alacak yok</strong>Veresiye satış ve servis borçları burada görünür.</div>`);
  }
  function marketPrices() {
    return page("Piyasa Fiyatları","İnternet kaynağı veya manuel kayıtlarla cihaz fiyat geçmişi oluşturun.",button("Manuel Fiyat Ekle","marketModal"),
      `<form class="panel" id="marketSearch"><div class="form-grid">${smartDevice("market")}<label>Kondisyon<select name="condition"><option>İkinci El</option><option>Sıfır</option><option>Yenilenmiş</option><option>Hasarlı</option></select></label></div><div class="toolbar" style="margin-top:12px">${button("Fiyat Ara","searchMarket")}${button("Fiyatı Yenile","refreshMarket","secondary")}${button("Ortalama Fiyat Hesapla","averageMarket","secondary")}${button("En Düşük / En Yüksek Fiyatı Göster","minMaxMarket","secondary")}</div></form>
      <section class="panel"><h2>Fiyat Kayıtları</h2>${db.marketPrices.length?table(["Ürün","Kondisyon","Fiyat","Kaynak","Tarih","Link","İşlemler"],db.marketPrices.map(x=>[`${esc(x.brand)} ${esc(x.model)}`,esc(x.condition),money(x.price,x.currency),esc(x.sourceName),fmt(x.recordedAt),x.sourceUrl?`<a href="${esc(x.sourceUrl)}" target="_blank" rel="noopener">Kaynak Linkini Aç</a>`:"-",`${button("Düzenle",`marketEdit:${x.id}`,"secondary")}${button("Sil",`marketDelete:${x.id}`,"danger")}`])):`<div class="empty-state"><strong>Henüz fiyat kaydı yok</strong>API olmasa da Manuel Fiyat Ekle çalışır ve fiyat geçmişi oluşturur.</div>`}</section>`);
  }
  function suppliers() {
    return page("Tedarikçi ve Firma Borçları","Parça aldığınız firmaları, borçları ve ödemeleri takip edin.",`${button("Tedarikçi Ekle","supplierModal")}${button("Firma Borcu Ekle","supplierDebtModal","secondary")}`,
      db.suppliers.length?table(["Firma","Telefon","Toplam Borç","Ödenen","Kalan","İşlemler"],db.suppliers.map(s=>{const ds=db.supplierDebts.filter(x=>x.supplierId===s.id);const total=ds.reduce((a,x)=>a+Number(x.amount),0),paid=ds.reduce((a,x)=>a+Number(x.paid),0);return[esc(s.name),esc(s.phone),money(total),money(paid),money(total-paid),`${button("Ödeme Yap",`supplierPay:${s.id}`)}${button("Düzenle",`supplierEdit:${s.id}`,"secondary")}${button("Borçları Gör",`supplierDebts:${s.id}`,"secondary")}${button("Sil",`supplierDelete:${s.id}`,"danger")}`]})):`<div class="empty-state"><strong>Henüz tedarikçi yok</strong>Parça aldığınız ilk firmayı ekleyin.</div>`);
  }
  function branches() {
    return page("Şubeler","Servis, stok, satış ve kasa kayıtlarını şubeye göre ayırın.",button("Şube Oluştur","branchModal"),
      db.branches.length?table(["Şube","Telefon","Adres","Durum","İşlemler"],db.branches.map(x=>[esc(x.name),esc(x.phone),esc(x.address),badge(x.active?"AKTİF":"PASİF"),`${button("Düzenle",`branchEdit:${x.id}`,"secondary")}${button(x.active?"Pasifleştir":"Aktifleştir",`branchToggle:${x.id}`,"secondary")}${button("Sil",`branchDelete:${x.id}`,"danger")}`])):`<div class="empty-state"><strong>Henüz şube eklenmedi</strong>Kayıtlar şimdilik Merkez şubeye bağlı çalışır.</div>`);
  }
  function warranties() {
    return page("Garanti Takibi","Teslim edilen servislerin garanti başlangıç ve bitiş tarihleri.",button("Garanti Bilgisi Göster","warrantyInfo","secondary"),
      db.warranties.length?table(["Servis","Başlangıç","Bitiş","Kalan Gün","Durum","İşlem"],db.warranties.map(x=>{const left=Math.ceil((new Date(x.endDate)-new Date())/86400000);return[x.serviceNo,x.startDate,x.endDate,left,badge(left<0?"SÜRESİ BİTTİ":left<7?"BİTİYOR":"AKTİF"),button("Garanti Kapsamında İşlem Aç",`warrantyService:${x.id}`)]})):`<div class="empty-state"><strong>Henüz garanti kaydı yok</strong>Bir servis Teslim Edildi yapıldığında garanti otomatik başlar.</div>`);
  }
  function reports() {
    const staff=db.users.map(u=>{const ss=db.services.filter(x=>x.staffId===u.id),del=ss.filter(x=>x.status==="TESLIM_EDILDI"),income=ss.reduce((a,x)=>a+Number(x.paid||0),0);return[u.fullName,ss.length,del.length,money(income),money(income*.05)]});
    const brandRows=[...new Set(db.buySell.map(x=>x.brand))].map(brand=>{const rows=db.buySell.filter(x=>x.brand===brand),profit=rows.reduce((a,x)=>a+Number(x.actualProfit||0),0);return[brand,rows.reduce((a,x)=>a+Number(x.purchasePrice||0),0),rows.reduce((a,x)=>a+Number(x.actualSalePrice||0),0),rows.reduce((a,x)=>a+Number(x.totalCost||0)-Number(x.purchasePrice||0),0),profit,rows.length?rows.reduce((a,x)=>a+daysStock(x),0)/rows.length:0]});
    return page("Raporlar","Tarih, marka, model, personel ve şubeye göre gerçek kâr/zarar analizi.",`${button("Bugünkü Ciroyu Gör","reportTodayTurnover")}${button("Bugünkü Kârı Gör","reportTodayProfit","secondary")}${button("Aylık İstatistik","reportMonthly","secondary")}${button("Excel’e Aktar","exportReport","secondary")}${button("PDF İndir","printReport","secondary")}`,
      `<form class="panel" id="reportFilters"><div class="form-grid"><label>Dönem<select name="period"><option>Bugün</option><option>Dün</option><option>Bu hafta</option><option>Bu ay</option><option>Geçen ay</option><option>Tarih aralığı</option></select></label><label>Başlangıç<input name="from" type="date"></label><label>Bitiş<input name="to" type="date"></label><label>Marka<select name="brand"><option value="">Tümü</option>${db.brands.map(x=>`<option>${esc(x.name)}</option>`)}</select></label><label>Model<input name="model"></label><label>Ürün türü<select name="type"><option value="">Tümü</option><option>Telefon</option><option>Tablet</option><option>Laptop</option></select></label><label>Personel<select name="staff"><option value="">Tümü</option>${db.users.map(x=>`<option value="${x.id}">${esc(x.fullName)}</option>`)}</select></label><label>Şube<select name="branch"><option value="">Tümü</option>${db.branches.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label></div><div class="toolbar">${button("Marka Bazlı Rapor","reportBrand")}${button("iPhone Kâr/Zarar","reportIphone","secondary")}${button("Samsung Kâr/Zarar","reportSamsung","secondary")}${button("Al-Sat Raporu","profitReport","secondary")}${button("Servis Raporu","staffReport","secondary")}</div></form>
      <div class="stats grid">${stat("Toplam Servis",db.services.length,"blue")}${stat("Toplam Satış",db.sales.length,"green")}${stat("Al-Sat Stok",db.buySell.filter(x=>x.status==="STOKTA").length,"orange")}${stat("Net Kasa",money(db.cash.reduce((a,x)=>a+(x.type==="IN"?1:-1)*Number(x.amount),0)),"gray")}${stat("En Hızlı Satış",`${Math.min(...db.buySell.filter(x=>x.soldDate).map(daysStock),0)} gün`,"green")}${stat("En Uzun Bekleyen",`${Math.max(...db.buySell.map(daysStock),0)} gün`,"red")}</div>
      <section class="grid split"><div class="panel"><h2>Günlük Ciro / Net Kâr</h2>${financeChart()}</div><div class="panel"><h2>Gider ve Al-Sat Kârı</h2>${expenseChart()}</div></section>
      <section class="panel"><h2>Marka Bazlı Kâr/Zarar</h2>${brandRows.length?table(["Marka","Toplam Alış","Toplam Satış","Masraf","Net Kâr","Ort. Bekleme"],brandRows.map(x=>[esc(x[0]),money(x[1]),money(x[2]),money(x[3]),`<span class="${x[4]<0?"profit-negative":"profit-positive"}">${money(x[4])}</span>`,`${x[5].toFixed(1)} gün`])):`<div class="empty-state">Marka verisi yok.</div>`}</section>
      <section class="panel"><h2>Personel Performans ve Prim</h2>${table(["Personel","Aldığı Servis","Teslim Etti","Oluşturduğu Gelir","Örnek %5 Prim"],staff)}</section>`);
  }
  function financeChart(){const days=Array.from({length:7},(_,i)=>new Date(Date.now()-(6-i)*86400000).toISOString().slice(0,10)),vals=days.map(d=>dailyFinance(d)),max=Math.max(...vals.map(x=>x.turnover),1);return `<div class="chart">${vals.map((x,i)=>`<div class="chart-bar" style="height:${Math.max(3,x.turnover/max*100)}%;background:${x.netProfit<0?"var(--red)":"var(--cyan)"}"><span>${days[i].slice(5)}<br>${Math.round(x.turnover/1000)}b</span></div>`).join("")}</div>`;}
  function expenseChart(){const rows=db.expenses.slice(0,10),max=Math.max(...rows.map(x=>periodDaily(x)),1);return rows.length?`<div class="chart">${rows.map(x=>`<div class="chart-bar" title="${esc(x.name)}" style="height:${Math.max(3,periodDaily(x)/max*100)}%;background:var(--accent)"><span>${Math.round(periodDaily(x))}</span></div>`).join("")}</div>`:`<div class="empty-state">Gider eklenince grafik oluşur.</div>`;}
  function monthlyReport(){const prefix=day().slice(0,7),sold=db.buySell.filter(x=>x.soldDate?.startsWith(prefix)),services=db.services.filter(x=>(x.deliveredAt||"").startsWith(prefix)),profit=sold.reduce((a,x)=>a+Number(x.actualProfit||0),0),serviceProfit=services.reduce((a,x)=>a+Number(x.paid||x.price||0),0);modal("Aylık İstatistik",`<div class="stats grid">${stat("Bu Ay Al-Sat Kârı",money(profit),profit<0?"red":"green")}${stat("Bu Ay Servis Geliri",money(serviceProfit),"blue")}${stat("Satılan Cihaz",sold.length,"gray")}${stat("Teslim Servis",services.length,"gray")}</div>`);}
  function brandReport(action){const form=$("#reportFilters"),filter=action==="reportIphone"?"Apple":action==="reportSamsung"?"Samsung":formData(form).brand,rows=db.buySell.filter(x=>!filter||x.brand===filter),purchase=rows.reduce((a,x)=>a+Number(x.purchasePrice||0),0),sales=rows.reduce((a,x)=>a+Number(x.actualSalePrice||0),0),cost=rows.reduce((a,x)=>a+Number(x.totalCost||0)-Number(x.purchasePrice||0),0),profit=rows.reduce((a,x)=>a+Number(x.actualProfit||0),0);modal(`${filter||"Tüm Markalar"} Kâr/Zarar`,`<div class="stats grid">${stat("Toplam Alış",money(purchase),"blue")}${stat("Toplam Satış",money(sales),"green")}${stat("Toplam Masraf",money(cost),"orange")}${stat("Net Kâr/Zarar",money(profit),profit<0?"red":"green")}</div>${rows.length?table(["Model","Alış","Satış","Kâr","Bekleme"],rows.map(x=>[`${esc(x.brand)} ${esc(x.model)}`,money(x.purchasePrice),money(x.actualSalePrice),money(x.actualProfit),`${daysStock(x)} gün`])):`<div class="empty-state">Bu filtrede kayıt yok.</div>`}`);}
  function auditLogs() {
    if (!can("audit.view")) return denied();
    return page("İşlem Geçmişi","Giriş, servis, kasa, stok, satış ve ayar değişiklikleri.",`${button("Filtrele","auditFilter","secondary")}${button("Excel’e Aktar","exportAudit","secondary")}`,
      db.auditLogs.length?table(["Kullanıcı","İşlem","Kayıt Türü","Tarih","Detay"],db.auditLogs.map(x=>[esc(x.userName),esc(x.action),esc(x.entityType),fmt(x.createdAt),button("Detayları Aç",`auditDetail:${x.id}`,"secondary")])):`<div class="empty-state"><strong>Henüz işlem kaydı yok</strong>Önemli işlemler otomatik olarak burada tutulur.</div>`);
  }
  function settings() {
    return page("Ayarlar","İşletme, kullanım, kur, cihaz kataloğu ve yedekleme ayarları.","",
      `<form class="panel" id="settingsForm"><h2>İşletme Bilgileri</h2><div class="form-grid"><label>İşletme adı<input name="businessName" value="${esc(db.settings.businessName)}"></label><label>Telefon<input name="phone" value="${esc(db.settings.phone||"")}"></label><label class="wide">Adres<input name="address" value="${esc(db.settings.address||"")}"></label><label>Vergi no<input name="taxNo" value="${esc(db.settings.taxNo||"")}"></label><label>Para birimi<select name="currency">${["TL","USD","EUR"].map(x=>`<option ${db.settings.currency===x?"selected":""}>${x}</option>`)}</select></label><label>Dil<select name="language"><option value="tr">Türkçe</option><option value="en">English</option><option value="ar">العربية</option><option value="de">Deutsch</option></select></label><label class="full">Fiş ve garanti metni<textarea name="receiptText">${esc(db.settings.receiptText)}</textarea></label></div><div class="toolbar">${button("İşletme Bilgilerini Kaydet","saveSettings")}${button("Tema Değiştir","theme","secondary")}</div></form>
      <section class="grid split"><div class="panel"><h2>Kullanım Kolaylığı</h2>${toggleRow("Basit Mod",db.settings.simpleMode,"simpleMode")}${toggleRow("Yardım kutusunu açık tut",db.settings.helpEnabled,"helpEnabled")}<div class="toolbar">${button("İlk Kullanım Turunu Tekrar Başlat","helpTour","secondary")}${button("Yardım Ayarlarını Sıfırla","resetHelp","secondary")}</div><p class="hint">Yardım kapalı olsa bile sağ alttaki Yardım düğmesi her zaman kullanılabilir.</p></div>
      <div class="panel"><h2>Cihaz Marka ve Modelleri</h2><p>${db.brands.length} marka ve ${db.brands.reduce((a,x)=>a+x.models.length,0)} model hazır.</p><div class="toolbar">${button("Marka Ekle","brandModal")}${button("Model Ekle","modelModal","secondary")}${button("Modeli Düzenle","modelEdit","secondary")}${button("Model Listesini Güncelle","refreshModels","secondary")}</div></div></section>
      <section class="grid split"><div class="panel"><h2>Otomatik Yedekleme</h2><label>Sıklık<select id="backupSchedule"><option value="manual">Manuel</option><option value="daily">Günlük</option><option value="weekly">Haftalık</option></select></label><div class="toolbar" style="margin-top:10px">${button("Tüm Verileri Yedekle","backupAll")}${button("Excel Yedeği","backupExcel","secondary")}</div></div>
      <div class="panel"><h2>Kur Kaynağı</h2><label>Kur API adresi<input id="exchangeApi" value="${esc(db.settings.exchangeApi)}" placeholder="İsteğe bağlı"></label><p class="hint">API girilmezse manuel kurlar sorunsuz çalışır. Son kayıtlı kur her zaman gösterilir.</p>${button("Kaydet","saveExchangeApi")}</div></section>
      <section class="panel"><h2>Al-Sat Evrak Zorunluluğu</h2><div class="form-grid"><label>Alırken evrak zorunlu<select id="requirePurchaseDocument"><option value="false">Hayır</option><option value="true">Evet</option></select></label><label>Satarken evrak zorunlu<select id="requireSaleDocument"><option value="false">Hayır</option><option value="true">Evet</option></select></label><label>Video zorunlu<select id="requireVideo"><option value="false">Hayır</option><option value="true">Evet</option></select></label><label>IMEI zorunlu<select id="requireImei"><option value="false">Hayır</option><option value="true">Evet</option></select></label><label>Müşteri telefonu zorunlu<select id="requireCustomerPhone"><option value="false">Hayır</option><option value="true">Evet</option></select></label></div><div class="toolbar">${button("Evrak Zorunluluğu Ayarlarını Kaydet","saveEvidenceSettings")}${user.role==="OWNER"?button("Yönetici Onayıyla Devam Et","ownerOverride","secondary"):""}</div></section>`);
  }
  function toggleRow(label,on,action){return `<div class="switch-row"><strong>${label}</strong><span class="switch ${on?"on":""}" data-action="${action}" role="switch" aria-checked="${on}"></span></div>`;}
  function users() {
    if(!["OWNER","ADMIN"].includes(user.role))return page("Kullanıcılar","Yalnızca yönetici erişebilir.","",`<div class="empty-state"><strong>Yetki gerekli</strong>Bu alan yöneticiye özeldir.</div>`);
    const pending = (db.accountRequests || []).filter(x=>x.status==="PENDING");
    const requestsPanel = `<section class="panel"><h2>Bekleyen Hesap Talepleri</h2>${pending.length?table(["Ad Soyad","Kullanıcı","E-posta","Telefon","İstenen Rol","Tarih","İşlemler"],pending.map(x=>[esc(x.fullName),esc(x.username),esc(x.email),esc(x.phone),badge(roleLabel(x.requestedRole)),fmt(x.createdAt),`${button("Onayla",`approveRequest:${x.id}`)}${button("Reddet",`rejectRequest:${x.id}`,"danger")}`])):`<div class="empty-state"><strong>Bekleyen talep yok</strong>Personel Hesap Oluştur ekranından talep gönderirse burada görünür.</div>`}</section>`;
    return page("Kullanıcılar","Yalnızca İşletme Sahibi ve Yönetici hesapları bu listeyi görebilir ve hesapları yönetebilir.",button("Yeni Kullanıcı","userModal"),
      requestsPanel+
      table(["Ad Soyad","Kullanıcı","E-posta","Rol","Son Giriş","Durum","İşlemler"],db.users.map(x=>{
        const protectedOwner=x.role==="OWNER"&&x.id!==user.id;
        const actions=protectedOwner
          ? `<span class="hint">İşletme Sahibi hesabı korumalı</span>`
          : `${button("Hesabı Düzenle",`editUser:${x.id}`,"secondary")}${button("Yetkisini Değiştir",`roleUser:${x.id}`,"secondary")}${button("Yetkileri Düzenle",`permissions:${x.id}`,"secondary")}${button(x.active?"Kullanıcıyı Askıya Al":"Hesabı Askıdan Çıkar",`toggleUser:${x.id}`,"secondary")}${button("Şifreyi Değiştir",`resetUser:${x.id}`,"secondary")}${x.role!=="OWNER"&&x.id!==user.id&&isAdmin()?button("Kullanıcıyı Sil",`deleteUser:${x.id}`,"danger"):""}`;
        return [esc(x.fullName),esc(x.username),esc(x.email),badge(roleLabel(x.role)),fmt(x.lastLoginAt),badge(x.active?"AKTİF":"ASKIDA"),actions];
      })));
  }
  function account() {
    return page("Hesabım","Kişisel bilgilerinizi ve güvenlik ayarlarınızı yönetin.","",
      `<section class="grid split"><form class="panel" id="accountForm"><h2>Profil Bilgileri</h2><div class="form-grid"><label>Ad soyad<input name="fullName" value="${esc(user.fullName)}"></label><label>Kullanıcı adı<input name="username" value="${esc(user.username)}"></label><label>E-posta<input name="email" type="email" value="${esc(user.email)}"></label><label>Telefon<input name="phone" value="${esc(user.phone||"")}"></label></div><div class="toolbar">${button("Bilgilerimi Güncelle","updateAccount")}</div></form>
      <div class="panel"><h2>Güvenlik ve Yardım</h2><p>Son giriş: <strong>${fmt(user.lastLoginAt)}</strong></p><div class="toolbar">${button("Şifremi Değiştir","passwordModal")}${button("Tüm Oturumları Kapat","closeSessions","danger")}${button("Giriş Geçmişimi Gör","loginHistory","secondary")}${button("Yardım kutusunu açık tut","alwaysShowHelp","secondary")}${button("İlk kullanım turunu tekrar başlat","helpTour","secondary")}${button("Yardım ayarlarını sıfırla","resetHelp","secondary")}</div></div></section>`);
  }
  function notificationsPage() {
    const items = buildNotifications();
    return page("Bildirim Merkezi","İşletmenizde dikkat gerektiren kayıtlar.",`${button("Okundu Olarak İşaretle","readNotifications")}${button("Tümünü Temizle","clearNotifications","danger")}`,
      items.length?table(["Tür","Bildirim","Tarih"],items.map(x=>[badge(x.type),esc(x.text),fmt(x.at)])):`<div class="empty-state"><strong>Yeni bildirim yok</strong>Her şey yolunda görünüyor.</div>`);
  }
  function buildNotifications(){
    if(db.preferences.notificationsCleared)return[];
    return [
      ...db.stock.filter(x=>x.quantity<=x.minQuantity).map(x=>({type:"STOK",text:`${x.name} kritik seviyede: ${x.quantity}`,at:iso()})),
      ...db.receivables.filter(x=>x.status!=="ODENDI"&&x.dueDate<day()).map(x=>({type:"ALACAK",text:`${x.title} vadesi geçti`,at:x.createdAt})),
      ...db.services.filter(x=>x.status==="HAZIR").map(x=>({type:"SERVİS",text:`${x.no} teslim bekliyor`,at:x.updatedAt||x.createdAt})),
      ...db.buySell.filter(x=>x.status==="STOKTA"&&daysStock(x)>30).map(x=>({type:"AL-SAT",text:`${x.brand} ${x.model} ${daysStock(x)} gündür stokta`,at:x.createdAt}))
    ];
  }
  function renderTracking(){
    const serviceNo=new URLSearchParams(route.split("?")[1]||"").get("no")||"";
    $("#app").innerHTML=`<main class="tracking-shell"><section class="tracking-card"><div class="auth-logo"><div><h1>Servis Takibi</h1><p class="hint">Cihaz durumunu güvenle kontrol edin.</p></div></div><form id="trackingForm" style="display:grid;gap:12px;margin-top:18px"><label>Servis numarası<input name="serviceNo" value="${esc(serviceNo)}" required></label><label>Telefon numarasının son 4 hanesi<input name="phoneLast4" maxlength="4" required></label><button>Durumu Göster</button></form><div id="trackingResult"></div></section></main>`;
    $("#trackingForm").onsubmit=e=>{e.preventDefault();const d=formData(e.target),s=db.services.find(x=>x.no===d.serviceNo),c=s&&db.customers.find(x=>x.id===s.customerId);$("#trackingResult").innerHTML=s&&c?.phone?.slice(-4)===d.phoneLast4?`<div class="panel" style="margin-top:16px"><h2>${esc(s.brand)} ${esc(s.model)}</h2><p>Durum: ${badge(s.status)}</p><p>Son güncelleme: ${fmt(s.updatedAt||s.createdAt)}</p></div>`:`<p class="hint" style="margin-top:14px">Bilgiler eşleşmedi. Servis numarası ve telefonu kontrol edin.</p>`;};
  }

  function bind() {
    $$("[data-go]").forEach(x=>x.onclick=()=>go(x.dataset.go));
    $$("[data-action]").forEach(x=>{ x.dataset.bound="1"; x.onclick=e=>handle(e.currentTarget.dataset.action,e.currentTarget); });
    $$("[data-brand]").forEach(x=>x.onchange=()=>deviceBrandChanged(x.dataset.brand));
    $$("[data-model]").forEach(x=>x.onchange=()=>deviceModelChanged(x.dataset.model));
    $("#languageSelect").onchange=e=>{db.settings.language=e.target.value;save();render();toast("Dil tercihi kaydedildi.");};
    const buy=$("#buyForm"); if(buy){buy.oninput=profitPreview;profitPreview();}
    const purchaseCustomer=$("[name=purchaseCustomerId]");if(purchaseCustomer)purchaseCustomer.onchange=()=>showCustomerRisk(purchaseCustomer.value);
    const saleForm=$("#saleForm"),saleCustomer=saleForm?$("[name=customerId]",saleForm):null;if(saleCustomer)saleCustomer.onchange=()=>showCustomerRisk(saleCustomer.value);
    const issue=$("[name=issueTemplate]"); if(issue) issue.onchange=()=>{if(issue.value)$("[name=issue]").value=issue.value;};
    const saleBarcode=$("[name=barcode]"); if(saleBarcode)saleBarcode.onchange=()=>findBarcode();
    const sch=$("#backupSchedule");if(sch){sch.value=db.settings.backupSchedule;sch.onchange=()=>{db.settings.backupSchedule=sch.value;save();toast("Yedekleme sıklığı kaydedildi.");};}
    ["requirePurchaseDocument","requireSaleDocument","requireVideo","requireImei","requireCustomerPhone"].forEach(k=>{const e=$("#"+k);if(e)e.value=String(!!db.settings[k]);});
    const settingsForm=$("#settingsForm"),lang=settingsForm?$("[name=language]",settingsForm):null;if(lang)lang.value=db.settings.language;
  }
  function deviceBrandChanged(prefix){
    const brand=$(`[name="${prefix}brand"]`).value,b=db.brands.find(x=>x.name===brand),model=$(`[data-model="${prefix}"]`),meta=modelMeta[brand]||modelMeta.default;
    model.innerHTML=`<option value="">Model seçin</option>${(b?.models||[]).map(x=>`<option>${esc(x.name)}</option>`).join("")}<option value="MANUAL">Model Listesinde Yok</option>`;
    $(`[data-storage="${prefix}"]`).innerHTML=`<option value="">Seçin</option>${meta.storage.map(x=>`<option>${x}</option>`)}`;
    $(`[data-ram="${prefix}"]`).innerHTML=`<option value="">Seçin</option>${meta.ram.map(x=>`<option>${x}</option>`)}`;
    $(`[data-color="${prefix}"]`).innerHTML=`<option value="">Seçin</option>${meta.colors.map(x=>`<option>${x}</option>`)}`;
  }
  function deviceModelChanged(prefix){$(`[data-manual-wrap="${prefix}"]`).hidden=$(`[name="${prefix}model"]`).value!=="MANUAL";}
  function profitPreview(){const f=$("#buyForm");if(!f)return;const d=formData(f),cost=["purchasePrice","repairCost","cleaningCost","accessoryCost","cargoCost","taxCost","otherCost"].reduce((a,k)=>a+Number(d[k]||0),0),expected=+d.estimatedSalePrice-cost,target=+d.targetSalePrice-cost,pct=cost?target/cost*100:0;$("#profitPreview").innerHTML=`<div class="profit-cell">Toplam maliyet<strong>${money(cost)}</strong></div><div class="profit-cell">Beklenen kâr<strong class="${expected<0?"profit-negative":"profit-positive"}">${money(expected)}</strong></div><div class="profit-cell">Hedef kâr<strong class="${target<0?"profit-negative":"profit-positive"}">${money(target)}</strong></div><div class="profit-cell">Hedef kâr oranı<strong>${pct.toFixed(1)}%</strong></div>`;}

  async function handle(action, el) {
    try {
      if(action==="menu")return $("#sidebar").classList.toggle("open");
      if(action==="userMenu")return $("#userPopover").classList.toggle("open");
      if(action==="toggleHelp"){helpOpen=!helpOpen;return render();}
      if(action==="hideHelpToday"){db.preferences[`help.hidden.${day()}`]=true;save();helpOpen=false;return render();}
      if(action==="alwaysShowHelp"){db.settings.helpEnabled=true;delete db.preferences[`help.hidden.${day()}`];save();helpOpen=true;return render();}
      if(action==="resetHelp"){Object.keys(db.preferences).filter(k=>k.startsWith("help.")).forEach(k=>delete db.preferences[k]);db.settings.helpEnabled=true;save();helpOpen=true;toast("Yardım ayarları sıfırlandı.");return render();}
      if(action==="helpTour")return toast("Adım 1: Sayfanın başlığını oku. Adım 2: Yeşil işlem düğmesini seç. Adım 3: Formu doldurup kaydet.");
      if(action==="editHelp")return editHelp();
      if(action==="logout")return logout();
      if(action==="goDashboard")return go("dashboard");
      if(action==="goServices")return go("services");
      if(action==="goNewService")return go("services/new");
      if(action==="simpleMode"){db.settings.simpleMode=!db.settings.simpleMode;audit("Basit mod değiştirildi","AYAR");save();return render();}
      if(action==="helpEnabled"){db.settings.helpEnabled=!db.settings.helpEnabled;save();return render();}
      if(action==="toggleRecent"){recentOpen=!recentOpen;db.preferences["dashboard.showRecentActions"]=recentOpen;save();return render();}
      if(action==="services/new"||action==="sales"||action==="stock"||action==="customers"||action==="cash")return go(action);
      if(action==="help"){helpOpen=true;return render();}
      if(action==="cashIn"||action==="cashOut")return cashModal(action==="cashIn"?"IN":"OUT");
      if(action.startsWith("cashEdit:"))return cashEdit(action.split(":")[1]);
      if(action.startsWith("cashDelete:"))return cashDelete(action.split(":")[1]);
      if(action==="appointment")return appointmentModal();
      if(action.startsWith("appointmentEdit:"))return appointmentEdit(action.split(":")[1]);
      if(action.startsWith("appointmentDelete:"))return appointmentDelete(action.split(":")[1]);
      if(action==="rateModal")return rateModal();
      if(action==="refreshRates")return refreshRates();
      if(action==="currencyCalc")return currencyCalc();
      if(action==="globalSearch")return globalSearch();
      if(action==="clearForm")return el.closest("form").reset();
      if(action==="findCustomer")return findCustomer();
      if(action==="deviceHistory")return deviceHistory();
      if(action==="ocrModal")return ocrModal();
      if(action==="saveService"||action==="saveServicePrint")return saveService(action.endsWith("Print"));
      if(action.startsWith("serviceDetail:"))return serviceDetail(action.split(":")[1]);
      if(action.startsWith("printService:"))return printData("Servis Teslim Formu",db.services.find(x=>x.id===action.split(":")[1]));
      if(action.startsWith("serviceQr:"))return serviceQr(action.split(":")[1]);
      if(action.startsWith("serviceStatus:"))return serviceStatus(action.split(":")[1]);
      if(action.startsWith("servicePay:"))return paymentModal("service",action.split(":")[1]);
      if(action.startsWith("serviceWhatsApp:"))return serviceWhatsApp(action.split(":")[1]);
      if(action.startsWith("trackingLink:"))return trackingLink(action.split(":")[1]);
      if(action.startsWith("serviceDelete:"))return deleteService(action.split(":")[1]);
      if(action.startsWith("appointmentStatus:"))return appointmentStatus(action.split(":")[1]);
      if(action==="customerModal")return customerModal();
      if(action.startsWith("customerDetail:"))return customerDetail(action.split(":")[1]);
      if(action.startsWith("customerEdit:"))return customerEdit(action.split(":")[1]);
      if(action.startsWith("customerDelete:"))return customerDelete(action.split(":")[1]);
      if(action.startsWith("customerService:")){const c=db.customers.find(x=>x.id===action.split(":")[1]);db.preferences.prefillCustomer=c;save();return go("services/new");}
      if(action.startsWith("customerWhatsApp:"))return customerWhatsApp(action.split(":")[1]);
      if(action.startsWith("customerRisk:")||action.startsWith("customerTabDebt:")||action.startsWith("customerTabTrade:"))return showCustomerRisk(action.split(":")[1]);
      if(action.startsWith("riskNote:"))return riskNoteModal(action.split(":")[1]);
      if(action.startsWith("trustCustomer:"))return trustCustomer(action.split(":")[1]);
      if(action==="stockModal")return stockModal();
      if(action.startsWith("stockIn:")||action.startsWith("stockOut:"))return stockMove(action.split(":")[1],action.startsWith("stockIn")?"IN":"OUT");
      if(action.startsWith("stockEdit:"))return stockEdit(action.split(":")[1]);
      if(action.startsWith("stockDelete:"))return stockDelete(action.split(":")[1]);
      if(action.startsWith("stockMoves:"))return stockMoves(action.split(":")[1]);
      if(action.startsWith("barcodePrint:"))return printBarcode(action.split(":")[1]);
      if(action==="barcodeScan")return barcodeScan();
      if(action==="exportStock")return exportCsv("stok",db.stock);
      if(action==="findBarcode")return findBarcode();
      if(action==="completeSale")return completeSale();
      if(action.startsWith("saleDetail:"))return saleDetail(action.split(":")[1]);
      if(action.startsWith("salePrint:"))return printData("Satış Fişi",db.sales.find(x=>x.id===action.split(":")[1]));
      if(action.startsWith("saleCancel:"))return saleCancel(action.split(":")[1]);
      if(action==="buyMarket")return go("market-prices");
      if(action==="estimateBuy"||action==="estimateSale")return estimatePrices(action);
      if(action==="saveBuy")return saveBuy();
      if(action.startsWith("buyDetail:"))return buyDetail(action.split(":")[1]);
      if(action.startsWith("buyCost:"))return buyCost(action.split(":")[1]);
      if(action.startsWith("buyReceipt:"))return printData("Al-Sat Satış Fişi",db.buySell.find(x=>x.id===action.split(":")[1]));
      if(action.startsWith("buySold:"))return markSold(action.split(":")[1]);
      if(action.startsWith("buyEdit:"))return buyEdit(action.split(":")[1]);
      if(action.startsWith("buyReserve:")){const x=db.buySell.find(x=>x.id===action.split(":")[1]);x.status="REZERVE";audit("Cihaz rezerve edildi","AL-SAT",x.id);save();return render();}
      if(action==="profitReport")return printData("Al-Sat Kar/Zarar Raporu",db.buySell);
      if(action.startsWith("mediaList:")){const [,entityType,entityId]=action.split(":");return mediaList(entityType,entityId);}
      if(action.startsWith("mediaUpload:")){const [,entityType,entityId]=action.split(":");return mediaUpload(entityType,entityId);}
      if(action.startsWith("mediaDownload:"))return mediaDownload(action.split(":")[1]);
      if(action.startsWith("mediaDelete:"))return mediaDelete(action.split(":")[1]);
      if(action.startsWith("contractPurchase:"))return generateContract(action.split(":")[1],"Alım Sözleşmesi");
      if(action.startsWith("contractSale:"))return generateContract(action.split(":")[1],"Satış Sözleşmesi");
      if(action.startsWith("deliveryForm:"))return generateContract(action.split(":")[1],"Teslim Tutanağı");
      if(action.startsWith("customerDetail:"))return customerDetail(action.split(":")[1]);
      if(action==="closeDay")return closeDay();
      if(action==="expenseModal")return expenseModal();
      if(action==="rentModal")return expenseModal("Aylık Kira","KİRA","MONTHLY");
      if(action==="mealModal")return expenseModal("Yemek Gideri","YEMEK","DAILY");
      if(action==="personalExpenseModal")return expenseModal("Kişisel Gider","KİŞİSEL","ONE_TIME",true);
      if(action.startsWith("expenseDelete:"))return deleteExpense(action.split(":")[1]);
      if(action==="capitalAdd"||action==="capitalWithdraw")return capitalModal(action==="capitalAdd"?"ADD":"WITHDRAW");
      if(action==="dailyProfit")return financeSummary();
      if(action==="breakEven")return breakEvenSummary();
      if(action==="financeReport")return printData("Finans Raporu",{summary:dailyFinance(),expenses:db.expenses,capital:db.capitalAccounts,cashAccounts:db.cashAccounts});
      if(action==="receivableModal")return receivableModal();
      if(action.startsWith("receivePay:"))return paymentModal("receivable",action.split(":")[1]);
      if(action.startsWith("receivableEdit:"))return receivableEdit(action.split(":")[1]);
      if(action.startsWith("receivableDelete:"))return receivableDelete(action.split(":")[1]);
      if(action.startsWith("debtMessage:"))return debtMessage(action.split(":")[1]);
      if(action==="marketModal")return marketModal();
      if(action.startsWith("marketEdit:"))return marketEdit(action.split(":")[1]);
      if(action.startsWith("marketDelete:"))return marketDelete(action.split(":")[1]);
      if(action==="searchMarket"||action==="refreshMarket")return toast(db.marketPrices.length?`${db.marketPrices.length} kayıt bulundu.`:"API bağlı değil. Manuel fiyat ekleyebilirsiniz.",db.marketPrices.length?"success":"error");
      if(action==="averageMarket"||action==="minMaxMarket")return marketStats(action);
      if(action==="supplierModal")return supplierModal();
      if(action==="supplierDebtModal")return supplierDebtModal();
      if(action.startsWith("supplierPay:"))return supplierPay(action.split(":")[1]);
      if(action.startsWith("supplierEdit:"))return supplierEdit(action.split(":")[1]);
      if(action.startsWith("supplierDebts:"))return supplierDebts(action.split(":")[1]);
      if(action.startsWith("supplierDelete:"))return supplierDelete(action.split(":")[1]);
      if(action==="branchModal")return branchModal();
      if(action.startsWith("branchEdit:"))return branchEdit(action.split(":")[1]);
      if(action.startsWith("branchToggle:"))return branchToggle(action.split(":")[1]);
      if(action.startsWith("branchDelete:"))return branchDelete(action.split(":")[1]);
      if(action.startsWith("warrantyService:"))return go("services/new");
      if(action==="warrantyInfo")return toast(`${db.warranties.length} garanti kaydı bulundu.`);
      if(action==="printReport"||action==="staffReport")return printData("İşletme Raporu",{services:db.services,sales:db.sales,cash:db.cash});
      if(action==="reportTodayTurnover")return modal("Bugünkü Ciro",`<div class="code-box">${money(dailyFinance().turnover)}</div>`);
      if(action==="reportTodayProfit")return financeSummary();
      if(action==="reportMonthly")return monthlyReport();
      if(action==="reportBrand"||action==="reportIphone"||action==="reportSamsung")return brandReport(action);
      if(action==="exportReport")return exportCsv("rapor",db.auditLogs);
      if(action==="exportAudit")return exportCsv("islem-gecmisi",db.auditLogs);
      if(action==="auditFilter")return auditFilter();
      if(action.startsWith("auditDetail:"))return auditDetail(action.split(":")[1]);
      if(action==="saveSettings")return saveSettings();
      if(action==="theme"){db.settings.theme=db.settings.theme==="dark"?"light":"dark";save();return render();}
      if(action==="brandModal")return brandModal();
      if(action==="modelModal")return modelModal();
      if(action==="modelEdit")return modelEdit();
      if(action==="refreshModels")return toast("Model listesi güncel.");
      if(action==="backupAll")return backupAll();
      if(action==="backupExcel")return exportCsv("tam-yedek",flattenDb());
      if(action==="saveExchangeApi"){db.settings.exchangeApi=$("#exchangeApi").value;save();return toast("Kur kaynağı kaydedildi.");}
      if(action==="saveEvidenceSettings"){["requirePurchaseDocument","requireSaleDocument","requireVideo","requireImei","requireCustomerPhone"].forEach(k=>db.settings[k]=$("#"+k).value==="true");audit("Evrak zorunluluğu ayarları değiştirildi","AYAR");save();return toast("Evrak zorunluluğu ayarları kaydedildi.");}
if(action==="ownerOverride")return toast("İşletme Sahibi onayı bu oturum için hazır. Zorunlu işlemde yetkili kullanıcı devam edebilir.");
      if(action==="userModal")return userModal();
      if(action.startsWith("editUser:"))return editUser(action.split(":")[1]);
      if(action.startsWith("permissions:"))return permissionsModal(action.split(":")[1]);
      if(action.startsWith("toggleUser:"))return toggleUser(action.split(":")[1]);
      if(action.startsWith("roleUser:"))return roleUser(action.split(":")[1]);
      if(action.startsWith("approveRequest:"))return approveRequest(action.split(":")[1]);
      if(action.startsWith("rejectRequest:"))return rejectRequest(action.split(":")[1]);
      if(action.startsWith("deleteUser:"))return deleteUser(action.split(":")[1]);
      if(action.startsWith("resetUser:"))return resetUser(action.split(":")[1]);
      if(action==="updateAccount")return updateAccount();
      if(action==="passwordModal")return passwordModal();
      if(action==="closeSessions")return closeSessions();
      if(action==="loginHistory")return loginHistory();
      if(action==="readNotifications"){toast("Bildirimler okundu.");return;}
      if(action==="clearNotifications"){db.preferences.notificationsCleared=true;save();return render();}
    } catch(err){toast(err.message||"İşlem tamamlanamadı.","error");}
  }

  function cashModal(type){ensureCashAccounts();const m=modal(type==="IN"?"Kasa Girişi":"Kasa Çıkışı",`<form id="cashForm"><div class="form-grid"><label>Açıklama<input name="title" required></label><label>Tutar<input name="amount" type="number" required></label><label>Yöntem<select name="method"><option>Nakit</option><option>Kart</option><option>Havale</option></select></label><label>Kasa hesabı<select name="cashAccountId">${db.cashAccounts.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label><label>Şube<select name="branchId"><option value="">Merkez</option>${db.branches.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label></div></form>`,button("Kaydet","saveCash"));$("[data-action=saveCash]",m).onclick=()=>{const d=formData($("#cashForm")),amount=+d.amount;db.cash.unshift({id:id("CSH"),type,amount,title:d.title,method:d.method,cashAccountId:d.cashAccountId,branchId:d.branchId,category:type==="OUT"?"MANUEL_GIDER":"MANUEL_GELIR",at:iso()});const account=db.cashAccounts.find(x=>x.id===d.cashAccountId);if(account)account.balance+=(type==="IN"?amount:-amount);audit(type==="IN"?"Kasa girişi":"Kasa çıkışı","KASA");save();m.remove();render();toast("Kasa hareketi ve hesap bakiyesi kaydedildi.");};}
  function expenseModal(name="",category="DİĞER",period="MONTHLY",personal=false){const m=modal(name||"Gider Ekle",`<form id="expenseForm"><div class="form-grid"><label>Gider adı<input name="name" value="${esc(name)}" required></label><label>Kategori<select name="category">${["KİRA","ELEKTRİK","SU","İNTERNET","PERSONEL","YEMEK","YOL","MUHASEBE","VERGİ","POS","KARGO","REKLAM","KİŞİSEL","DİĞER"].map(x=>`<option ${x===category?"selected":""}>${x}</option>`)}</select></label><label>Tutar<input name="amount" type="number" required></label><label>Dönem<select name="period"><option value="DAILY">Günlük</option><option value="WEEKLY">Haftalık</option><option value="MONTHLY" ${period==="MONTHLY"?"selected":""}>Aylık</option><option value="ONE_TIME" ${period==="ONE_TIME"?"selected":""}>Tek Seferlik</option></select></label><label>Kâr hesabına katılsın<select name="includeInProfitCalculation"><option value="true">Evet</option><option value="false">Hayır</option></select></label><label>Kişisel gider<select name="isPersonalExpense"><option value="false">Hayır</option><option value="true" ${personal?"selected":""}>Evet</option></select></label><label class="full">Not<textarea name="note"></textarea></label></div></form>`,button("Gideri Kaydet","saveExpense"));$("[data-action=saveExpense]",m).onclick=()=>{const d=formData($("#expenseForm"));db.expenses.unshift({id:id("EXP"),...d,amount:+d.amount,includeInProfitCalculation:d.includeInProfitCalculation==="true",isPersonalExpense:d.isPersonalExpense==="true",createdAt:iso(),updatedAt:iso()});audit("İşletme gideri eklendi","FİNANS");save();m.remove();render();toast("Gider ve günlük payı kaydedildi.");};}
  async function deleteExpense(i){if(!(await confirmAction("Bu gider silinsin mi?")))return;db.expenses=db.expenses.filter(x=>x.id!==i);save();render();toast("Gider silindi.");}
  function capitalModal(type){const m=modal(type==="ADD"?"Sermaye Ekle":"Sermaye Çek",`<form id="capitalForm"><div class="form-grid"><label>Hesap adı<input name="name" value="İşletme Sermayesi"></label><label>Tutar<input name="amount" type="number" required></label><label class="wide">Açıklama<input name="description"></label></div></form>`,button(type==="ADD"?"Sermayeyi Ekle":"Sermayeyi Çek","saveCapital"));$("[data-action=saveCapital]",m).onclick=()=>{const d=formData($("#capitalForm")),amount=+d.amount;let account=db.capitalAccounts.find(x=>x.name===d.name);if(!account){account={id:id("CAP"),name:d.name,initialCapital:type==="ADD"?amount:0,currentCapital:0,ownerUserId:user.id,note:d.description,createdAt:iso(),updatedAt:iso()};db.capitalAccounts.unshift(account);}account.currentCapital+=type==="ADD"?amount:-amount;db.capitalMovements.unshift({id:id("CAPM"),capitalAccountId:account.id,type:type==="ADD"?"SERMAYE_EKLEME":"SERMAYE_CEKME",amount,description:d.description,createdAt:iso(),userId:user.id});audit(type==="ADD"?"Sermaye ekleme":"Sermaye çekme","FİNANS",account.id);save();m.remove();render();toast("Sermaye hareketi kaydedildi.");};}
  function financeSummary(){const f=dailyFinance();modal("Bugünkü Net Kâr",`<div class="stats grid">${stat("Ciro",money(f.turnover),"green")}${stat("Brüt Kâr",money(f.grossProfit),"green")}${stat("Gider Payı",money(f.expenseShare),"red")}${stat("Net Kâr",money(f.netProfit),f.netProfit<0?"red":"green")}</div>`);}
  function breakEvenSummary(){const f=dailyFinance(),need=Math.max(0,f.breakEven-f.grossProfit);modal("Kâra Geçme Noktası",`<div class="code-box">${f.netProfit>=0?"Bugün kâra geçtin.":`Kâra geçmek için yaklaşık ${money(need)} daha brüt kâr gerekli.`}</div>`);}
  function appointmentModal(){const m=modal("Yeni Randevu",`<form id="appointmentForm"><div class="form-grid"><label>Müşteri adı<input name="customerName" required></label><label>Telefon<input name="phone" required></label><label>Tarih<input name="date" type="date" value="${day()}" required></label><label>Saat<input name="time" type="time" required></label><label class="full">Not<textarea name="note"></textarea></label></div></form>`,button("Randevuyu Kaydet","saveAppointment"));$("[data-action=saveAppointment]",m).onclick=()=>{const d=formData($("#appointmentForm"));db.appointments.unshift({id:id("APT"),...d,status:"BEKLİYOR",createdAt:iso()});audit("Randevu oluşturuldu","RANDEVU");save();m.remove();render();toast("Randevu takvime eklendi.");};}
  function appointmentStatus(i){const x=db.appointments.find(x=>x.id===i),m=modal("Randevu Durumu",`<select id="aptStatus"><option>BEKLİYOR</option><option>GELDİ</option><option>GELMEDİ</option><option>İPTAL</option></select>`,button("Güncelle","saveAptStatus"));$("#aptStatus").value=x.status;$("[data-action=saveAptStatus]",m).onclick=()=>{x.status=$("#aptStatus").value;save();m.remove();render();toast("Randevu durumu güncellendi.");};}
  function applyCashToAccount(row, reverse=false){if(!row||!row.cashAccountId)return;const account=db.cashAccounts.find(x=>x.id===row.cashAccountId);if(!account)return;const sign=row.type==="IN"?1:-1;account.balance+=Number(row.amount||0)*sign*(reverse?-1:1);}
  function cashEdit(i){ensureCashAccounts();const x=db.cash.find(r=>r.id===i);if(!x)return toast("Kasa hareketi bulunamadı.","error");const m=modal("Kasa Hareketini Düzenle",`<form id="cashEditForm"><div class="form-grid"><label>Tür<select name="type"><option value="IN">Giriş</option><option value="OUT">Çıkış</option></select></label><label>Açıklama<input name="title" required value="${esc(x.title)}"></label><label>Tutar<input name="amount" type="number" required value="${esc(x.amount)}"></label><label>Yöntem<select name="method"><option>Nakit</option><option>Kart</option><option>Havale</option></select></label><label>Kasa hesabı<select name="cashAccountId">${db.cashAccounts.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></label><label>Tarih<input name="atDate" type="date" value="${esc((x.at||iso()).slice(0,10))}"></label></div></form>`,button("Güncelle","saveCashEdit"));$("[name=type]",m).value=x.type;$("[name=method]",m).value=x.method||"Nakit";$("[name=cashAccountId]",m).value=x.cashAccountId||db.cashAccounts[0]?.id||"";$("[data-action=saveCashEdit]",m).onclick=()=>{const d=formData($("#cashEditForm")),old={...x};applyCashToAccount(x,true);Object.assign(x,{type:d.type,title:d.title,amount:+d.amount,method:d.method,cashAccountId:d.cashAccountId,at:`${d.atDate||day()}T12:00:00.000Z`,updatedAt:iso()});applyCashToAccount(x,false);audit("Kasa hareketi düzenlendi","KASA",i,old,x);save();m.remove();render();toast("Kasa hareketi güncellendi.");};}
  async function cashDelete(i){const x=db.cash.find(r=>r.id===i);if(!x)return toast("Kasa hareketi bulunamadı.","error");if(!(await confirmAction("Bu kasa hareketi silinsin mi? Bakiye de düzeltilecek.")))return;applyCashToAccount(x,true);db.cash=db.cash.filter(r=>r.id!==i);audit("Kasa hareketi silindi","KASA",i,x,null);save();render();toast("Kasa hareketi silindi ve bakiye düzeltildi.");}
  function appointmentEdit(i){const x=db.appointments.find(r=>r.id===i);if(!x)return toast("Randevu bulunamadı.","error");const m=modal("Randevuyu Düzenle",`<form id="appointmentEditForm"><div class="form-grid"><label>Müşteri adı<input name="customerName" required value="${esc(x.customerName)}"></label><label>Telefon<input name="phone" required value="${esc(x.phone)}"></label><label>Tarih<input name="date" type="date" required value="${esc(x.date)}"></label><label>Saat<input name="time" type="time" required value="${esc(x.time)}"></label><label>Durum<select name="status"><option>BEKLİYOR</option><option>GELDİ</option><option>GELMEDİ</option><option>İPTAL</option></select></label><label class="full">Not<textarea name="note">${esc(x.note||"")}</textarea></label></div></form>`,button("Güncelle","saveAppointmentEdit"));$("[name=status]",m).value=x.status;$("[data-action=saveAppointmentEdit]",m).onclick=()=>{const old={...x};Object.assign(x,formData($("#appointmentEditForm")),{updatedAt:iso()});audit("Randevu düzenlendi","RANDEVU",i,old,x);save();m.remove();render();toast("Randevu güncellendi.");};}
  async function appointmentDelete(i){const x=db.appointments.find(r=>r.id===i);if(!x)return toast("Randevu bulunamadı.","error");if(!(await confirmAction("Randevu silinsin mi?")))return;db.appointments=db.appointments.filter(r=>r.id!==i);audit("Randevu silindi","RANDEVU",i,x,null);save();render();toast("Randevu silindi.");}
  function customerEdit(i){const x=db.customers.find(c=>c.id===i);if(!x)return toast("Müşteri bulunamadı.","error");const m=modal("Müşteriyi Düzenle",`<form id="customerEditForm"><div class="form-grid"><label>Ad soyad<input name="name" required value="${esc(x.name)}"></label><label>Telefon<input name="phone" required value="${esc(x.phone)}"></label><label class="wide">Adres<input name="address" value="${esc(x.address||"")}"></label><label class="full">Not<textarea name="note">${esc(x.note||"")}</textarea></label></div></form>`,button("Güncelle","saveCustomerEdit"));$("[data-action=saveCustomerEdit]",m).onclick=()=>{const d=formData($("#customerEditForm"));if(db.customers.some(c=>c.id!==i&&c.phone===d.phone))return toast("Bu telefon başka müşteride kayıtlı.","error");const old={...x};Object.assign(x,d,{updatedAt:iso()});audit("Müşteri düzenlendi","MÜŞTERİ",i,old,x);save();m.remove();render();toast("Müşteri güncellendi.");};}
  async function customerDelete(i){const x=db.customers.find(c=>c.id===i);if(!x)return toast("Müşteri bulunamadı.","error");const linked=db.services.some(r=>r.customerId===i)||db.sales.some(r=>r.customerId===i)||db.buySell.some(r=>r.purchaseCustomerId===i||r.saleCustomerId===i)||db.receivables.some(r=>r.customerId===i);if(linked)return toast("Bu müşteriye bağlı servis, satış, al-sat veya alacak var. Önce müşteri detayından kontrol edin.","error");if(!(await confirmAction("Müşteri silinsin mi?")))return;db.customers=db.customers.filter(c=>c.id!==i);audit("Müşteri silindi","MÜŞTERİ",i,x,null);save();render();toast("Müşteri silindi.");}
  function stockEdit(i){const x=db.stock.find(r=>r.id===i);if(!x)return toast("Stok ürünü bulunamadı.","error");const m=modal("Stok Ürününü Düzenle",`<form id="stockEditForm"><div class="form-grid"><label>Ürün adı<input name="name" required value="${esc(x.name)}"></label><label>Barkod<input name="barcode" value="${esc(x.barcode)}"></label><label>Stok miktarı<input name="quantity" type="number" value="${esc(x.quantity)}"></label><label>Minimum stok<input name="minQuantity" type="number" value="${esc(x.minQuantity)}"></label><label>Alış fiyatı<input name="buyPrice" type="number" value="${esc(x.buyPrice)}"></label><label>Satış fiyatı<input name="salePrice" type="number" value="${esc(x.salePrice)}"></label></div></form>`,button("Güncelle","saveStockEdit"));$("[data-action=saveStockEdit]",m).onclick=()=>{const d=formData($("#stockEditForm")),old={...x};Object.assign(x,{...d,quantity:+d.quantity,minQuantity:+d.minQuantity,buyPrice:+d.buyPrice,salePrice:+d.salePrice,updatedAt:iso()});audit("Stok ürünü düzenlendi","STOK",i,old,x);save();m.remove();render();toast("Stok ürünü güncellendi.");};}
  async function stockDelete(i){const x=db.stock.find(r=>r.id===i);if(!x)return toast("Stok ürünü bulunamadı.","error");const used=db.sales.some(s=>(s.items||[]).some(item=>item.stockId===i));if(used)return toast("Bu ürün satış geçmişinde kullanılmış. Silmek yerine stok miktarını 0 yapın.","error");if(!(await confirmAction("Stok ürünü silinsin mi?")))return;db.stock=db.stock.filter(r=>r.id!==i);db.stockMovements=db.stockMovements.filter(r=>r.stockId!==i);audit("Stok ürünü silindi","STOK",i,x,null);save();render();toast("Stok ürünü silindi.");}
  function stockMoves(i){const x=db.stock.find(r=>r.id===i),rows=db.stockMovements.filter(r=>r.stockId===i||r.title===x?.name);modal("Stok Hareketleri",rows.length?table(["Tür","Açıklama","Miktar","Tarih"],rows.map(r=>[badge(r.type==="IN"?"GİRİŞ":"ÇIKIŞ"),esc(r.title),r.quantity,fmt(r.createdAt)])):`<div class="empty-state"><strong>Hareket yok</strong>Bu ürün için henüz hareket kaydı yok.</div>`);}
  function saleDetail(i){const x=db.sales.find(s=>s.id===i);if(!x)return toast("Satış bulunamadı.","error");const c=db.customers.find(c=>c.id===x.customerId);modal("Satış Detayı",`<div class="stats grid">${stat("Toplam",money(x.total),"green")}${stat("Ödeme",x.payment||"-","blue")}${stat("Müşteri",c?.name||"Perakende","gray")}</div>${table(["Ürün","Adet","Fiyat"],(x.items||[]).map(item=>[esc(item.name),item.quantity,money(item.price)]))}`,`${button("Fiş Yazdır",`salePrint:${x.id}`)}${button("Satışı İptal Et",`saleCancel:${x.id}`,"danger")}`);}
  async function saleCancel(i){const x=db.sales.find(s=>s.id===i);if(!x)return toast("Satış bulunamadı.","error");if(!(await confirmAction("Satış iptal edilsin mi? Stok ve kasa geri düzeltilecek.")))return;(x.items||[]).forEach(item=>{const st=db.stock.find(s=>s.id===item.stockId);if(st)st.quantity=Number(st.quantity||0)+Number(item.quantity||0);db.stockMovements.unshift({id:id("SM"),stockId:item.stockId,title:item.name,type:"IN",quantity:item.quantity,createdAt:iso(),note:"Satış iptali"});});db.cash.filter(c=>c.ref===x.no).forEach(c=>applyCashToAccount(c,true));db.cash=db.cash.filter(c=>c.ref!==x.no);db.receivables=db.receivables.filter(r=>!String(r.title||"").includes(x.no));db.sales=db.sales.filter(s=>s.id!==i);audit("Satış iptal edildi","SATIŞ",i,x,null);save();render();toast("Satış iptal edildi; stok ve kasa düzeltildi.");}
  function rateModal(){const m=modal("Manuel Kur Gir",`<form id="rateForm"><div class="form-grid"><label>Kur<select name="code"><option value="USD">Dolar</option><option value="EUR">Euro</option><option value="GOLD_GR">Gram Altın</option><option value="GOLD_Q">Çeyrek Altın</option><option value="GOLD_REP">Cumhuriyet Altını</option></select></label><label>Alış<input name="buyRate" type="number" step=".01" required></label><label>Satış<input name="sellRate" type="number" step=".01" required></label></div></form>`,button("Kuru Kaydet","saveRate"));$("[data-action=saveRate]",m).onclick=()=>{const d=formData($("#rateForm")),old=db.exchangeRates.find(x=>x.code===d.code);if(old)Object.assign(old,{buyRate:+d.buyRate,sellRate:+d.sellRate,recordedAt:iso(),source:"Manuel"});else db.exchangeRates.unshift({id:id("RATE"),...d,buyRate:+d.buyRate,sellRate:+d.sellRate,recordedAt:iso(),source:"Manuel"});save();m.remove();render();toast("Kur bilgisi kaydedildi.");};}
  function refreshRatesIfStale(){
    const newest=db.exchangeRates.reduce((latest,rate)=>Math.max(latest,new Date(rate.recordedAt||0).getTime()),0);
    if(!newest||Date.now()-newest>6*60*60*1000)refreshRates(true);
  }
  async function refreshRates(silent=false){
    if(!isServer)return toast("Canlı kur için uygulamayı sunucu üzerinden çalıştırın. Manuel kur kullanılabilir.","error");
    try{
      const result=await api("/exchange-rates");
      result.rates.forEach(rate=>{
        const old=db.exchangeRates.find(x=>x.code===rate.code);
        const values={buyRate:Number(rate.buyRate||rate.sellRate),sellRate:Number(rate.sellRate),source:result.source,recordedAt:result.recordedAt};
        if(old)Object.assign(old,values);else db.exchangeRates.unshift({id:id("RATE"),code:rate.code,name:rate.code,...values});
      });
      save();render();if(!silent)toast(`${result.rates.length} canlı kur güncellendi.`);
    }catch(error){if(!silent)toast(`${error.message} Son kayıtlı kurlar korunuyor.`,"error");}
  }
  function currencyCalc(){const m=modal("Döviz Hesapla",`<form id="calcForm"><div class="form-grid"><label>Tutar<input name="amount" type="number" value="1"></label><label>Kaynak<select name="from"><option>TL</option><option>USD</option><option>EUR</option></select></label><label>Hedef<select name="to"><option>USD</option><option>EUR</option><option>TL</option></select></label></div></form><div id="calcResult" class="code-box" style="margin-top:10px">Sonuç burada gösterilir.</div>`,button("Döviz Hesapla","doCalc"));$("[data-action=doCalc]",m).onclick=()=>{const d=formData($("#calcForm")),rate=c=>c==="TL"?1:Number(db.exchangeRates.find(x=>x.code===c)?.sellRate||0);if(!rate(d.from)||!rate(d.to))return toast("Bu para birimi için kur eklenmemiş.","error");$("#calcResult").textContent=`${(+d.amount*rate(d.from)/rate(d.to)).toFixed(2)} ${d.to}`;};}
  function globalSearch(){const q=$("#globalSearch").value.toLowerCase();if(!q)return toast("Aramak için bir bilgi yazın.","error");const results=[...db.customers.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Müşteri: ${x.name}`),...db.services.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Servis: ${x.no} ${x.brand} ${x.model}`),...db.stock.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`Ürün: ${x.name}`)];modal("Arama Sonuçları",results.length?`<ul>${results.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<div class="empty-state"><strong>Sonuç bulunamadı</strong>Yazımı kontrol edip tekrar deneyin.</div>`);}
  function findCustomer(){const p=$("[name=phone]").value,c=db.customers.find(x=>x.phone===p);if(c){$("[name=customerName]").value=c.name;$("[name=address]").value=c.address||"";const debt=db.receivables.some(x=>x.customerId===c.id&&x.status!=="ODENDI");toast(debt?"Müşteri bulundu. Dikkat: bekleyen borcu var.":"Müşteri bilgileri getirildi.",debt?"error":"success");}else toast("Kayıtlı müşteri bulunamadı. Servis kaydıyla birlikte oluşturulacak.","error");}
  function deviceHistory(){const imei=$("[name=imeiOrSerial]").value,old=db.services.filter(x=>x.imeiOrSerial&&x.imeiOrSerial===imei);toast(imei?`${old.length} eski servis kaydı bulundu.`:"IMEI veya seri no girin.",!imei?"error":"success");}
  function ocrModal(){
    const m=modal("Foto\u011fraftan Doldur",`<p>Cihaz arkas\u0131, kutu, fatura veya ayarlar ekran\u0131 foto\u011fraf\u0131n\u0131 se\u00e7in. Bilgiler onay\u0131n\u0131z olmadan forma aktar\u0131lmaz.</p><input id="devicePhoto" type="file" accept="image/jpeg,image/png,image/webp"><div id="ocrArea" style="margin-top:12px"></div>`,button("Foto\u011fraftan Bilgi Oku","readPhoto","secondary"));
    $("[data-action=readPhoto]",m).onclick=()=>{
      const file=$("#devicePhoto").files[0];if(!file)return toast("\u00d6nce bir foto\u011fraf se\u00e7in.","error");if(file.size>5*1024*1024)return toast("Foto\u011fraf en fazla 5 MB olabilir.","error");
      const reader=new FileReader();reader.onload=async()=>{
        $("#ocrArea").innerHTML=`<div class="ocr-preview"><img src="${reader.result}" alt="Y\u00fcklenen cihaz"><div><p class="hint">Foto\u011fraf okunuyor. Sonu\u00e7lar\u0131 kaydetmeden \u00f6nce mutlaka kontrol edin.</p></div></div>`;
        let found={brand:"",model:"",imeiOrSerial:"",color:"",storage:"",confidence:0,uncertainFields:["brand","model","imeiOrSerial","color","storage"]};
        if(isServer){try{found=(await api("/ocr",{method:"POST",body:JSON.stringify({image:reader.result})})).extracted||found;}catch(error){toast(error.message+" Manuel kontrol ekran? a??ld?.","error");}}
        const uncertain=new Set(found.uncertainFields||[]),cls=k=>uncertain.has(k)||!found[k]?"uncertain":"";
        $("#ocrArea").innerHTML=`<div class="ocr-preview"><img src="${reader.result}" alt="Y?klenen cihaz"><div><p class="hint">G\u00fcven: %${Math.round(Number(found.confidence||0)*100)}. Sar\u0131 alanlar\u0131 manuel kontrol edin.</p><label>Marka<input id="ocrBrand" class="${cls("brand")}" value="${esc(found.brand||"")}"></label><label>Model<input id="ocrModel" class="${cls("model")}" value="${esc(found.model||"")}"></label><label>IMEI / Seri No<input id="ocrImei" class="${cls("imeiOrSerial")}" value="${esc(found.imeiOrSerial||"")}"></label><label>Renk<input id="ocrColor" class="${cls("color")}" value="${esc(found.color||"")}"></label><label>Depolama<input id="ocrStorage" class="${cls("storage")}" value="${esc(found.storage||"")}"></label><div class="toolbar" style="margin-top:10px">${button("Bilgileri Forma Aktar","applyOcr")}${button("Manuel D\u00fczenle","focusOcr","secondary")}${button("Foto\u011fraf\u0131 Sil","deletePhoto","danger")}</div></div></div>`;
        $("[data-action=applyOcr]",m).onclick=()=>{const brand=$("#ocrBrand").value,model=$("#ocrModel").value;if(!brand&&!model)return toast("Bilgi okunamad?, l?tfen manuel girin.","error");const prefix=$("[name=buybrand]")?"buy":"";const brandInput=$(`[name="${prefix}brand"]`);if(brandInput){brandInput.value=brand;brandInput.dispatchEvent(new Event("change"));const modelInput=$(`[name="${prefix}model"]`);if([...modelInput.options].some(o=>o.value===model))modelInput.value=model;else{modelInput.value="MANUAL";deviceModelChanged(prefix);$(`[name="${prefix}manualModel"]`).value=model;}const imei=$(`[name="${prefix}imeiOrSerial"]`);if(imei)imei.value=$("#ocrImei").value;}db.deviceImages.unshift({id:id("IMG"),fileName:file.name,extractedBrand:brand,extractedModel:model,extractedImeiOrSerial:$("#ocrImei").value,extractedColor:$("#ocrColor").value,extractedStorage:$("#ocrStorage").value,confidence:Number(found.confidence||0),createdAt:iso()});save();m.remove();toast("Kontrol edilen bilgiler forma aktar?ld?.");};
        $("[data-action=focusOcr]",m).onclick=()=>$("#ocrBrand").focus();$("[data-action=deletePhoto]",m).onclick=()=>{m.remove();toast("Foto\u011fraf silindi.");};
      };reader.readAsDataURL(file);
    };
  }
  function saveService(print){const f=$("#serviceForm"),d=formData(f);if(!d.customerName||!d.phone||!d.brand||(!d.model&&!d.manualModel)||!d.issue)return toast("Müşteri, cihaz ve arıza bilgilerini doldurun.","error");let c=db.customers.find(x=>x.phone===d.phone);if(!c){c={id:id("CUS"),name:d.customerName,phone:d.phone,address:d.address,createdAt:iso()};db.customers.unshift(c);}const model=d.model==="MANUAL"?d.manualModel:d.model,no=`SRV-${new Date().getFullYear()}-${String(db.counters.service++).padStart(6,"0")}`,s={id:id("SRV"),no,customerId:c.id,brand:d.brand,model,storage:d.storage,ram:d.ram,color:d.color,imeiOrSerial:d.imeiOrSerial,issue:d.issue,price:+d.price,paid:+d.prepayment,warrantyDays:+d.warrantyDays,status:"TAMIRDE",notes:[d.note].filter(Boolean),staffId:user.id,branchId:d.branchId,trackingToken:crypto.randomUUID(),createdAt:iso(),updatedAt:iso()};db.services.unshift(s);if(+d.prepayment)db.cash.unshift({id:id("CSH"),type:"IN",amount:+d.prepayment,title:`${no} ön ödeme`,method:"Nakit",ref:no,at:iso()});audit("Servis oluşturma","SERVİS",s.id,null,s);save();toast(`${no} servis kaydı oluşturuldu.`);if(print)printData("Servis Teslim Formu",s);go("services");}
  function serviceDetail(i){const s=db.services.find(x=>x.id===i),c=db.customers.find(x=>x.id===s.customerId);modal("Servis Detayı",`<div class="stats grid">${stat("Servis No",s.no,"blue")}${stat("Durum",s.status,"green")}${stat("Toplam",money(s.price),"orange")}${stat("Kalan",money(s.price-s.paid),"red")}</div><div class="panel"><p><strong>Müşteri:</strong> ${esc(c?.name)} - ${esc(c?.phone)}</p><p><strong>Cihaz:</strong> ${esc(s.brand)} ${esc(s.model)} ${esc(s.storage||"")}</p><p><strong>Arıza:</strong> ${esc(s.issue)}</p><p><strong>IMEI / Seri:</strong> ${esc(s.imeiOrSerial||"-")}</p><p><strong>Not:</strong> ${esc((s.notes||[]).join(", ")||"-")}</p></div>`,`${button("Servis Fişi Yazdır",`printService:${s.id}`)}${button("QR Oluştur",`serviceQr:${s.id}`,"secondary")}${button("WhatsApp Mesajı Hazırla",`serviceWhatsApp:${s.id}`,"secondary")}`);}
  function serviceQr(i){const s=db.services.find(x=>x.id===i),url=`${location.origin}${location.pathname}#/track?no=${encodeURIComponent(s.no)}`;modal("QR Kodlu Servis Takibi",`<div class="code-box">${esc(url)}</div><p class="hint">Bu bağlantı QR oluşturma uygulamalarına hazırdır. Müşteri servis no ve telefon doğrulamasıyla takip eder.</p>`,button("QR Yazdır",`printService:${s.id}`));}
  function serviceStatus(i){const s=db.services.find(x=>x.id===i),m=modal("Servis Durumu",`<select id="serviceStatus"><option>TAMIRDE</option><option>HAZIR</option><option>TESLIM_EDILDI</option><option>IADE</option><option>IPTAL</option><option>DIS_SERVIS</option></select>`,button("Durumu Güncelle","saveServiceStatus"));$("#serviceStatus").value=s.status;$("[data-action=saveServiceStatus]",m).onclick=()=>{const old=s.status;s.status=$("#serviceStatus").value;s.updatedAt=iso();if(s.status==="TESLIM_EDILDI"){s.deliveredAt=iso();const start=day(),end=new Date(Date.now()+Number(s.warrantyDays||90)*86400000).toISOString().slice(0,10);db.warranties.unshift({id:id("WAR"),serviceId:s.id,serviceNo:s.no,startDate:start,endDate:end,createdAt:iso()});}audit("Servis durum değiştirme","SERVİS",s.id,old,s.status);save();m.remove();render();toast("Servis durumu güncellendi.");};}
  async function deleteService(i){if(!(await confirmAction("Servis kaydı silinsin mi? Bu işlem geri alınamaz.")))return;const old=db.services.find(x=>x.id===i);db.services=db.services.filter(x=>x.id!==i);audit("Servis silme","SERVİS",i,old,null);save();render();toast("Servis kaydı silindi.");}
  function paymentModal(type,i){const target=(type==="service"?db.services:db.receivables).find(x=>x.id===i),m=modal("Ödeme Al",`<form id="payForm"><div class="form-grid"><label>Tutar<input name="amount" type="number" required></label><label>Yöntem<select name="method"><option>Nakit</option><option>Kart</option><option>Havale</option></select></label></div></form>`,button("Ödemeyi Kaydet","savePayment"));$("[data-action=savePayment]",m).onclick=()=>{const d=formData($("#payForm"));target.paid=Number(target.paid||0)+Number(d.amount);if(type==="receivable"&&target.paid>=target.total)target.status="ODENDI";db.cash.unshift({id:id("CSH"),type:"IN",amount:+d.amount,title:type==="service"?"Servis ödemesi":"Alacak tahsilatı",method:d.method,ref:target.no||target.title,at:iso()});audit("Ödeme alma",type.toUpperCase(),target.id);save();m.remove();render();toast("Ödeme kaydedildi.");};}
  function serviceWhatsApp(i){const s=db.services.find(x=>x.id===i),c=db.customers.find(x=>x.id===s.customerId),templates={TAMIRDE:"Servisimize alınmıştır.",HAZIR:"Hazırdır, teslim alabilirsiniz.",TESLIM_EDILDI:"Teslim edilmiştir.",DIS_SERVIS:"Dış servise gönderilmiştir."},msg=`Sayın ${c?.name||"müşterimiz"}, ${s.no} numaralı ${s.brand} ${s.model} cihazınız ${templates[s.status]||`durumu: ${s.status}`}`;messageModal("WhatsApp Hazır Mesajı",msg,c?.phone);}
  function trackingLink(i){const s=db.services.find(x=>x.id===i),url=`${location.origin}${location.pathname}#/track?no=${encodeURIComponent(s.no)}`;modal("Müşteri Servis Takip Linki",`<p>Müşteri bu bağlantıda servis numarası ve telefonunun son 4 hanesiyle durumunu görebilir.</p><div class="code-box">${esc(url)}</div>`,button("Linki Kopyala","copyTracking"));$("[data-action=copyTracking]").onclick=()=>navigator.clipboard.writeText(url).then(()=>toast("Takip linki kopyalandı."));}
  function customerModal(){const m=modal("Yeni Müşteri",`<form id="customerForm"><div class="form-grid"><label>Ad soyad<input name="name" required></label><label>Telefon<input name="phone" required></label><label class="wide">Adres<input name="address"></label><label class="full">Not<textarea name="note"></textarea></label></div></form>`,button("Kaydet","saveCustomer"));$("[data-action=saveCustomer]",m).onclick=()=>{const d=formData($("#customerForm"));if(db.customers.some(x=>x.phone===d.phone))return toast("Bu telefonla kayıtlı müşteri var.","error");db.customers.unshift({id:id("CUS"),...d,createdAt:iso()});audit("Müşteri oluşturma","MÜŞTERİ");save();m.remove();render();toast("Müşteri kaydedildi.");};}
  function customerDetail(i){
    const c=db.customers.find(x=>x.id===i);if(!c)return toast("Müşteri bulunamadı.","error");
    const services=db.services.filter(x=>x.customerId===i),debts=db.receivables.filter(x=>x.customerId===i),purchases=db.buySell.filter(x=>x.purchaseCustomerId===i),tradeSales=db.buySell.filter(x=>x.saleCustomerId===i),sales=db.sales.filter(x=>x.customerId===i),media=db.mediaAttachments.filter(x=>x.customerId===i),risk=db.customerRiskNotes.filter(x=>x.customerId===i);
    const totalBought=purchases.reduce((a,x)=>a+Number(x.purchasePrice||0),0),totalSold=tradeSales.reduce((a,x)=>a+Number(x.actualSalePrice||0),0)+sales.reduce((a,x)=>a+Number(x.total||0),0),profit=tradeSales.reduce((a,x)=>a+Number(x.actualProfit||0),0);
    modal("Müşteri Detayı",`<div class="stats grid">${stat("Servis",services.length,"blue")}${stat("Bizim Aldığımız",money(totalBought),"orange")}${stat("Müşteriye Sattığımız",money(totalSold),"green")}${stat("Al-Sat Kâr/Zarar",money(profit),profit<0?"red":"green")}${stat("Açık Borç",money(debts.reduce((a,x)=>a+Number(x.total-x.paid),0)),"red")}${stat("Güven Notu",risk[0]?.level||"NORMAL","gray")}</div>
      <div class="toolbar customer-tabs"><button class="secondary" data-customer-tab="service">Servis Geçmişi</button><button class="secondary" data-customer-tab="sales">Satış Geçmişi</button><button class="secondary" data-customer-tab="trade">Al-Sat Geçmişi</button><button class="secondary" data-customer-tab="debt">Alacaklar</button><button class="secondary" data-customer-tab="payments">Ödemeler</button><button class="secondary" data-customer-tab="media">Evraklar</button><button class="secondary" data-customer-tab="notes">Notlar</button></div>
      <div id="customerTab">${customerTabHtml("service",{services,sales,purchases,tradeSales,debts,media,risk,c})}</div>`,
      `${button("Müşteri Geçmişini İncele",`customerRisk:${i}`)}${button("Borçlarını Gör",`customerTabDebt:${i}`,"secondary")}${button("Al-Sat Geçmişini Gör",`customerTabTrade:${i}`,"secondary")}${button("Risk Notu Ekle",`riskNote:${i}`,"secondary")}${button("Güvenilir Olarak İşaretle",`trustCustomer:${i}`,"secondary")}`);
    $$(".customer-tabs button").forEach(b=>b.onclick=()=>{$("#customerTab").innerHTML=customerTabHtml(b.dataset.customerTab,{services,sales,purchases,tradeSales,debts,media,risk,c});});
  }
  function customerTabHtml(tab,d){
    if(tab==="service")return d.services.length?table(["Tarih","Servis","Cihaz","Durum"],d.services.map(x=>[fmt(x.createdAt),x.no,`${esc(x.brand)} ${esc(x.model)}`,badge(x.status)])):`<div class="empty-state">Servis geçmişi yok.</div>`;
    if(tab==="sales")return [...d.sales,...d.tradeSales].length?table(["Tarih","İşlem","Tutar"],[...d.sales.map(x=>[fmt(x.createdAt),x.no,money(x.total)]),...d.tradeSales.map(x=>[fmt(x.soldDate),`${x.brand} ${x.model}`,money(x.actualSalePrice)])]):`<div class="empty-state">Satış geçmişi yok.</div>`;
    if(tab==="trade")return [...d.purchases,...d.tradeSales].length?table(["Tarih","Yön","Cihaz","Tutar","Kâr/Zarar"],[...d.purchases.map(x=>[x.purchaseDate,"Müşteriden aldık",`${x.brand} ${x.model}`,money(x.purchasePrice),"-"]),...d.tradeSales.map(x=>[x.soldDate,"Müşteriye sattık",`${x.brand} ${x.model}`,money(x.actualSalePrice),money(x.actualProfit)])]):`<div class="empty-state">Al-sat geçmişi yok.</div>`;
    if(tab==="debt")return d.debts.length?table(["Açıklama","Toplam","Kalan","Vade"],d.debts.map(x=>[esc(x.title),money(x.total),money(x.total-x.paid),x.dueDate])):`<div class="empty-state">Alacak kaydı yok.</div>`;
    if(tab==="payments")return table(["İşlem","Tutar","Tarih"],db.cash.filter(x=>String(x.ref||"").includes(d.c.name)||d.sales.some(s=>s.no===x.ref)).map(x=>[esc(x.title),money(x.amount),fmt(x.at)]));
    if(tab==="media")return d.media.length?table(["Dosya","Tür","Tarih","İşlem"],d.media.map(x=>[esc(x.fileName),x.type,fmt(x.createdAt),button("Dosyayı İndir",`mediaDownload:${x.id}`,"secondary")])):`<div class="empty-state">Evrak yok.</div>`;
    return `<div class="panel"><p><strong>Müşteri notu:</strong> ${esc(d.c.note||"-")}</p>${d.risk.map(x=>`<p>${badge(x.level)} ${esc(x.note)}</p>`).join("")||"<p>Risk notu yok.</p>"}</div>`;
  }
  function customerRiskSummary(customerId){const c=db.customers.find(x=>x.id===customerId),debt=db.receivables.filter(x=>x.customerId===customerId&&x.status!=="ODENDI").reduce((a,x)=>a+Number(x.total-x.paid),0),p=db.buySell.filter(x=>x.purchaseCustomerId===customerId),s=db.buySell.filter(x=>x.saleCustomerId===customerId),svc=db.services.filter(x=>x.customerId===customerId),risk=db.customerRiskNotes.find(x=>x.customerId===customerId);return {c,debt,p,s,svc,risk,text:[debt?`Bu müşterinin ${money(debt)} borcu var.`:"Borcu yok.",p.length?`Bu müşteriden daha önce ${p[0].brand} ${p[0].model} alınmış.`:"Daha önce cihaz alınmamış.",s.length?`Bu müşteriye daha önce ${s[0].brand} ${s[0].model} satılmış.`:"Daha önce al-sat cihazı satılmamış.",`${svc.length} kez servis kaydı var.`,risk?`Risk notu: ${risk.level} - ${risk.note}`:"Risk notu yok."]};}
  function showCustomerRisk(i){if(!i)return;const r=customerRiskSummary(i);modal("Müşteri Geçmişi Akıllı Uyarı",`<h3>${esc(r.c?.name||"Müşteri")}</h3>${r.text.map(x=>`<div class="alert-box ${r.debt?"danger":""}" style="margin-bottom:7px">${esc(x)}</div>`).join("")}`);}
  function riskNoteModal(i){const m=modal("Müşteri Risk Notu",`<form id="riskForm"><div class="form-grid"><label>Seviye<select name="level"><option>NORMAL</option><option>DIKKAT</option><option>RISKLI</option><option>GUVENILIR</option></select></label><label class="wide">Not<input name="note" required></label></div></form>`,button("Risk Notunu Kaydet","saveRisk"));$("[data-action=saveRisk]",m).onclick=()=>{const d=formData($("#riskForm"));db.customerRiskNotes.unshift({id:id("RISK"),customerId:i,...d,createdById:user.id,createdAt:iso()});audit("Müşteri risk notu eklendi","MÜŞTERİ",i);save();m.remove();toast("Müşteri notu kaydedildi.");};}
  function trustCustomer(i){db.customerRiskNotes.unshift({id:id("RISK"),customerId:i,level:"GUVENILIR",note:"OWNER/Yetkili tarafından güvenilir olarak işaretlendi.",createdById:user.id,createdAt:iso()});save();toast("Müşteri güvenilir olarak işaretlendi.");}
  function customerWhatsApp(i){const c=db.customers.find(x=>x.id===i);messageModal("WhatsApp Mesajı","Merhaba, işletmemizden size ulaşıyoruz.",c.phone);}
  function messageModal(title,msg,phone){const link=`https://wa.me/90${String(phone||"").replace(/\D/g,"").replace(/^0/,"")}?text=${encodeURIComponent(msg)}`;modal(title,`<textarea style="min-height:130px">${esc(msg)}</textarea><div class="toolbar" style="margin-top:10px"><a href="${link}" target="_blank" rel="noopener"><button>WhatsApp ile Aç</button></a></div>`);}
  function mediaUpload(entityType,entityId,customerId=null,title="Evrak / Fotoğraf / Video Yükle"){const m=modal(title,`<form id="mediaForm"><div class="form-grid"><label>Dosya türü<select name="type"><option>EVRAK</option><option>FOTO</option><option>VIDEO</option><option>PDF</option><option>FATURA</option><option>DEKONT</option><option>SOZLESME</option><option>DIGER</option></select></label><label class="wide">Dosya<input name="file" type="file" accept="image/*,video/*,.pdf" required></label><label class="full">Açıklama<input name="description"></label></div><p class="hint">Yalnızca kendi işlem kanıtı dosyalarınızı yükleyin. En fazla 5 MB.</p></form>`,button("Dosyayı Yükle","saveMedia"));$("[data-action=saveMedia]",m).onclick=()=>{const f=$("#mediaForm"),file=f.elements.file.files[0],d=formData(f);if(!file)return toast("Dosya seçin.","error");if(file.size>5*1024*1024)return toast("Dosya 5 MB sınırını aşıyor.","error");const reader=new FileReader();reader.onload=()=>{db.mediaAttachments.unshift({id:id("MED"),entityType,entityId,customerId:customerId||db.buySell.find(x=>x.id===entityId)?.purchaseCustomerId||null,buySellId:entityType==="BUY_SELL"?entityId:null,type:d.type,fileName:file.name,fileUrl:reader.result,mimeType:file.type,size:file.size,description:d.description,uploadedById:user.id,createdAt:iso()});audit("Kanıt dosyası yüklendi","EVRAK",entityId);save();m.remove();toast("Dosya güvenli işlem kaydına eklendi.");};reader.readAsDataURL(file);};}
  function mediaList(entityType,entityId){const rows=db.mediaAttachments.filter(x=>x.entityType===entityType&&x.entityId===entityId);modal("Evrak, Fotoğraf ve Video Kanıtları",`${rows.length?table(["Dosya","Tür","Boyut","Açıklama","İşlemler"],rows.map(x=>[esc(x.fileName),x.type,`${Math.round(x.size/1024)} KB`,esc(x.description),`${button(x.type==="VIDEO"?"Videoyu İzle":"Evrakı Gör",`mediaDownload:${x.id}`,"secondary")}${button("Dosyayı İndir",`mediaDownload:${x.id}`,"secondary")}${button("Evrakı Sil",`mediaDelete:${x.id}`,"danger")}`])):`<div class="empty-state"><strong>Henüz dosya yok</strong>Alım sözleşmesi, fatura, fotoğraf veya video ekleyebilirsiniz.</div>`}`,`${button("Evrak Yükle",`mediaUpload:${entityType}:${entityId}`)}${button("Fotoğraf Yükle",`mediaUpload:${entityType}:${entityId}`,"secondary")}${button("Video Yükle",`mediaUpload:${entityType}:${entityId}`,"secondary")}${button("Alım Sözleşmesi Oluştur",`contractPurchase:${entityId}`,"secondary")}${button("Satış Sözleşmesi Oluştur",`contractSale:${entityId}`,"secondary")}${button("Teslim Tutanağı Oluştur",`deliveryForm:${entityId}`,"secondary")}`);}
  function mediaDownload(i){const x=db.mediaAttachments.find(x=>x.id===i);if(!x)return toast("Dosya bulunamadı.","error");const a=document.createElement("a");a.href=x.fileUrl;a.download=x.fileName;a.target="_blank";a.click();}
  async function mediaDelete(i){if(!(await confirmAction("Bu evrak veya video silinsin mi?")))return;db.mediaAttachments=db.mediaAttachments.filter(x=>x.id!==i);audit("Kanıt dosyası silindi","EVRAK",i);save();$$(".modal-backdrop").at(-1)?.remove();toast("Dosya silindi.");}
  function generateContract(i,title){const x=db.buySell.find(x=>x.id===i),seller=db.customers.find(c=>c.id===x?.purchaseCustomerId),buyer=db.customers.find(c=>c.id===x?.saleCustomerId);printData(title,{işletme:db.settings.businessName,işlemNo:x?.no,cihaz:`${x?.brand} ${x?.model}`,imei:x?.imeiOrSerial,satıcı:seller?.name,alıcı:buyer?.name,alış:x?.purchasePrice,satış:x?.actualSalePrice,tarih:day(),açıklama:"Taraflar cihazı belirtilen durumu ve bilgileriyle teslim etmiş ve teslim almıştır."});}
  function stockModal(){const m=modal("Yeni Ürün Ekle",`<form id="stockForm"><div class="form-grid"><label>Ürün adı<input name="name" required></label><label>Barkod<input name="barcode" value="BRK-${Date.now()}"></label><label>Stok miktarı<input name="quantity" type="number" value="1"></label><label>Minimum stok<input name="minQuantity" type="number" value="1"></label><label>Alış fiyatı<input name="buyPrice" type="number"></label><label>Satış fiyatı<input name="salePrice" type="number"></label><label>Şube<select name="branchId"><option value="">Merkez</option>${db.branches.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label></div></form>`,button("Ürünü Kaydet","saveStock"));$("[data-action=saveStock]",m).onclick=()=>{const d=formData($("#stockForm"));db.stock.unshift({id:id("STK"),...d,quantity:+d.quantity,minQuantity:+d.minQuantity,buyPrice:+d.buyPrice,salePrice:+d.salePrice,createdAt:iso()});db.stockMovements.unshift({id:id("SM"),title:d.name,type:"IN",quantity:+d.quantity,createdAt:iso()});audit("Stok girişi","STOK");save();m.remove();render();toast("Ürün stoğa eklendi.");};}
  function stockMove(i,type){const x=db.stock.find(x=>x.id===i),amount=Number(prompt("Miktar","1")||0);if(!amount)return;x.quantity=Math.max(0,Number(x.quantity)+(type==="IN"?amount:-amount));db.stockMovements.unshift({id:id("SM"),stockId:i,title:x.name,type,quantity:amount,createdAt:iso()});audit(type==="IN"?"Stok girişi":"Stok çıkışı","STOK",i);save();render();toast("Stok miktarı güncellendi.");}
  function printBarcode(i){const x=db.stock.find(x=>x.id===i);printData("Barkod Etiketi",{ürün:x.name,barkod:x.barcode,fiyat:money(x.salePrice)});}
  function barcodeScan(){const m=modal("Barkod Okuyucu",`<p>USB veya Bluetooth barkod okuyucu ile aşağıdaki alana barkodu okutun.</p><input id="scanInput" autofocus placeholder="Barkod bekleniyor"><div id="scanResult"></div>`);$("#scanInput").onchange=()=>{const x=db.stock.find(s=>s.barcode===$("#scanInput").value);$("#scanResult").innerHTML=x?`<div class="panel"><strong>${esc(x.name)}</strong><p>Stok: ${x.quantity} - ${money(x.salePrice)}</p></div>`:`<p>Ürün bulunamadı.</p>`;};}
  function findBarcode(){const v=$("[name=barcode]")?.value,x=db.stock.find(s=>s.barcode===v);if(!x)return toast("Barkodla eşleşen ürün bulunamadı.","error");$("[name=productId]").value=x.id;toast(`${x.name} seçildi.`);}
  function completeSale(){const d=formData($("#saleForm")),x=db.stock.find(s=>s.id===d.productId||s.barcode===d.barcode),qty=+d.quantity;if(!x||x.quantity<qty)return toast("Ürün bulunamadı veya stok yetersiz.","error");const total=Math.max(0,x.salePrice*qty-Number(d.discount||0)),sale={id:id("SAL"),no:`SAT-${String(db.counters.sale++).padStart(6,"0")}`,customerId:d.customerId,items:[{stockId:x.id,name:x.name,quantity:qty,price:x.salePrice}],total,payment:d.payment,createdAt:iso()};db.sales.unshift(sale);x.quantity-=qty;db.stockMovements.unshift({id:id("SM"),stockId:x.id,title:x.name,type:"OUT",quantity:qty,createdAt:iso()});if(d.payment==="Veresiye")db.receivables.unshift({id:id("RCV"),customerId:d.customerId,title:`${sale.no} veresiye`,total,paid:0,dueDate:day(),status:"BEKLIYOR",createdAt:iso()});else db.cash.unshift({id:id("CSH"),type:"IN",amount:total,title:`${sale.no} satış`,method:d.payment,ref:sale.no,at:iso()});audit("Satış","SATIŞ",sale.id);save();render();toast("Satış tamamlandı.");}
  function estimatePrices(action){const f=$("#buyForm"),d=formData(f),prices=db.marketPrices.filter(x=>x.brand===d.buybrand&&x.model===d.buymodel).map(x=>+x.price),avg=prices.length?prices.reduce((a,x)=>a+x,0)/prices.length:0;if(!avg)return toast("Bu model için piyasa fiyatı yok. Manuel fiyat ekleyin.","error");if(action==="estimateBuy")f.elements.estimatedPurchasePrice.value=Math.round(avg*.72);else f.elements.targetSalePrice.value=Math.round(avg);profitPreview();toast("Fiyat geçmişine göre tahmin hazırlandı.");}
  function saveBuy(){
    const form=$("#buyForm"),d=formData(form),model=d.buymodel==="MANUAL"?d.buymanualModel:d.buymodel,doc=form.elements.purchaseDocument.files[0],video=form.elements.purchaseVideo.files[0];
    if(!d.purchaseCustomerId)return toast("Cihazı aldığınız müşteriyi seçin.","error");
    const purchaseCustomer=db.customers.find(c=>c.id===d.purchaseCustomerId);
    if(db.settings.requireCustomerPhone&&!purchaseCustomer?.phone)return toast("Ayar gereği müşteri telefonu zorunlu.","error");
    if(!d.buybrand||!model)return toast("Marka ve model seçin.","error");
    if(db.settings.requireImei&&!d.buyimeiOrSerial)return toast("Ayar gereği IMEI / seri no zorunlu.","error");
    if(db.settings.requirePurchaseDocument&&!doc&&user.role!=="OWNER")return toast("Ayar gereği alım evrakı zorunlu.","error");
    if(db.settings.requireVideo&&!video&&user.role!=="OWNER")return toast("Ayar gereği kanıt videosu zorunlu.","error");
    if((doc&&doc.size>5*1024*1024)||(video&&video.size>5*1024*1024))return toast("Kanıt dosyaları en fazla 5 MB olabilir.","error");
    const costs=["repairCost","cleaningCost","accessoryCost","cargoCost","taxCost","otherCost"],total=Number(d.purchasePrice)+costs.reduce((a,k)=>a+Number(d[k]||0),0);
    const x={id:id("BUY"),no:`ALS-${String(db.counters.buySell++).padStart(6,"0")}`,purchaseCustomerId:d.purchaseCustomerId,saleCustomerId:null,deviceType:d.buydeviceType,brand:d.buybrand,model,storage:d.buystorage,ram:d.buyram,color:d.buycolor,imeiOrSerial:d.buyimeiOrSerial,condition:d.condition,purchasePrice:+d.purchasePrice,estimatedPurchasePrice:+d.estimatedPurchasePrice,estimatedSalePrice:+d.estimatedSalePrice,targetSalePrice:+d.targetSalePrice,minSalePrice:+d.minSalePrice,...Object.fromEntries(costs.map(k=>[k,+d[k]])),totalCost:total,expectedProfit:+d.estimatedSalePrice-total,targetProfit:+d.targetSalePrice-total,actualSalePrice:0,actualProfit:0,profitRate:0,profitStatus:"SATILMADI",purchaseDate:d.purchaseDate,status:"STOKTA",note:d.note,cashAccountId:d.cashAccountId,createdAt:iso(),updatedAt:iso()};
    db.buySell.unshift(x);
    db.cash.unshift({id:id("CSH"),type:"OUT",amount:+d.purchasePrice,title:`${x.no} cihaz alımı`,method:"Nakit",category:"AL_SAT_ALIM",cashAccountId:d.cashAccountId,ref:x.no,at:iso()});
    const account=db.cashAccounts.find(a=>a.id===d.cashAccountId);if(account)account.balance-=+d.purchasePrice;
    audit("Al-sat cihaz alımı","AL-SAT",x.id,null,x);save();render();
    toast("Cihaz müşteriye, al-sat stokuna ve kasa çıkışına işlendi.");
    if(doc)storeSelectedMedia(doc,"EVRAK",x,"Alım evrakı");if(video)storeSelectedMedia(video,"VIDEO",x,"Cihaz alım videosu");
  }
  function storeSelectedMedia(file,type,x,description){if(file.size>5*1024*1024)return toast(`${file.name} 5 MB sınırını aşıyor.`,"error");const reader=new FileReader();reader.onload=()=>{db.mediaAttachments.unshift({id:id("MED"),entityType:"BUY_SELL",entityId:x.id,customerId:x.purchaseCustomerId,buySellId:x.id,type,fileName:file.name,fileUrl:reader.result,mimeType:file.type,size:file.size,description,uploadedById:user.id,createdAt:iso()});save();};reader.readAsDataURL(file);}
  function markSold(i){
    ensureCashAccounts();const x=db.buySell.find(x=>x.id===i),opts=db.customers.map(c=>`<option value="${c.id}">${esc(c.name)} - ${esc(c.phone)}</option>`).join("");
    const m=modal("Satıldı Olarak İşaretle",`<form id="soldForm"><div class="form-grid"><label>Satılan müşteri<select name="saleCustomerId" required><option value="">Müşteri seçin</option>${opts}</select></label><label>Gerçek satış fiyatı<input name="actualSalePrice" type="number" required></label><label>Ödeme kasası<select name="cashAccountId">${db.cashAccounts.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`)}</select></label><label>Ödeme yöntemi<select name="method"><option>Nakit</option><option>Kart</option><option>Havale</option></select></label><label class="wide">Satış evrakı / fatura<input name="saleDocument" type="file" accept="image/*,.pdf"></label><label class="wide">Teslim videosu<input name="saleVideo" type="file" accept="video/*"></label></div><p class="hint">Hedef: ${money(x.targetSalePrice)} - Minimum: ${money(x.minSalePrice)}</p></form>`,`${button("Evrak Yükle",`mediaUpload:BUY_SELL:${x.id}`,"secondary")}${button("Satışı Kaydet","saveSold")}`);
    $("[name=saleCustomerId]",m).onchange=e=>showCustomerRisk(e.target.value);
    $("[data-action=saveSold]",m).onclick=()=>{const form=$("#soldForm"),d=formData(form),price=+d.actualSalePrice,saleDoc=form.elements.saleDocument.files[0],saleVideo=form.elements.saleVideo.files[0];if(!d.saleCustomerId)return toast("Satış müşterisini seçin.","error");if(db.settings.requireSaleDocument&&!saleDoc&&user.role!=="OWNER")return toast("Satış evrakı yüklenmeden işlem tamamlanamaz.","error");if(db.settings.requireVideo&&!saleVideo&&user.role!=="OWNER")return toast("Teslim videosu zorunlu.","error");x.saleCustomerId=d.saleCustomerId;x.actualSalePrice=price;x.actualProfit=price-x.totalCost;x.profitRate=x.totalCost?x.actualProfit/x.totalCost*100:0;x.profitStatus=x.actualProfit>0?"KAR":x.actualProfit<0?"ZARAR":"BASA_BAS";x.status="SATILDI";x.soldDate=day();x.daysInStock=daysStock(x);db.cash.unshift({id:id("CSH"),type:"IN",amount:price,title:`${x.no} al-sat satışı`,method:d.method,category:"AL_SAT_SATIS",cashAccountId:d.cashAccountId,ref:x.no,at:iso()});const account=db.cashAccounts.find(a=>a.id===d.cashAccountId);if(account)account.balance+=price;db.sales.unshift({id:id("SAL"),no:`SAT-${String(db.counters.sale++).padStart(6,"0")}`,customerId:d.saleCustomerId,buySellId:x.id,total:price,payment:d.method,items:[{name:`${x.brand} ${x.model}`,quantity:1,price}],createdAt:iso()});if(saleDoc)storeSelectedMedia(saleDoc,"FATURA",{...x,purchaseCustomerId:d.saleCustomerId},"Satış evrakı");if(saleVideo)storeSelectedMedia(saleVideo,"VIDEO",{...x,purchaseCustomerId:d.saleCustomerId},"Cihaz teslim videosu");audit("Al-sat satışı","AL-SAT",x.id,null,x);save();m.remove();render();printData("Al-Sat Satış Fişi",{no:x.no,device:`${x.brand} ${x.model}`,price,customer:db.customers.find(c=>c.id===x.saleCustomerId)?.name,profit:x.actualProfit});toast(price<x.minSalePrice?"Satış kaydedildi. Fiyat minimum sınırın altında!":price>x.targetSalePrice?"Hedefin üstünde satış yapıldı; kâr arttı.":"Satış ve gerçek kâr kaydedildi.",price<x.minSalePrice?"error":"success");};
  }
  function buyDetail(i){const x=db.buySell.find(x=>x.id===i),seller=db.customers.find(c=>c.id===x.purchaseCustomerId),buyer=db.customers.find(c=>c.id===x.saleCustomerId),market=db.marketPrices.filter(p=>p.brand===x.brand&&p.model===x.model),avg=market.length?market.reduce((a,p)=>a+Number(p.price),0)/market.length:0,targetDiff=Number(x.actualSalePrice||0)-Number(x.targetSalePrice||0);modal("Al-Sat Detayı",`<div class="stats grid">${stat("Gerçek Alış",money(x.purchasePrice),"blue")}${stat("Tahmini Alış",money(x.estimatedPurchasePrice),"gray")}${stat("Tahmini Satış",money(x.estimatedSalePrice),"blue")}${stat("Hedef Satış",money(x.targetSalePrice),"orange")}${stat("Gerçek Satış",money(x.actualSalePrice),"green")}${stat("Toplam Maliyet",money(x.totalCost),"red")}</div><div class="stats grid">${stat("Beklenen Kâr",money(x.expectedProfit),x.expectedProfit<0?"red":"green")}${stat("Gerçek Kâr",money(x.actualProfit),x.actualProfit<0?"red":"green")}${stat("Kâr Yüzdesi",`${Number(x.profitRate||0).toFixed(1)}%`,"gray")}${stat("Elde Kalma",`${daysStock(x)} gün`,"gray")}${stat("Hedef Farkı",money(targetDiff),targetDiff<0?"red":"green")}${stat("Piyasa Durumu",avg?`${money((x.actualSalePrice||x.targetSalePrice)-avg)} fark`:"Veri yok","gray")}</div><section class="panel"><p><strong>Kimden alındı:</strong> ${esc(seller?.name||"-")}</p><p><strong>Kime satıldı:</strong> ${esc(buyer?.name||"-")}</p><p><strong>Masraflar:</strong> Tamir ${money(x.repairCost)}, temizlik ${money(x.cleaningCost)}, aksesuar ${money(x.accessoryCost)}, kargo ${money(x.cargoCost)}, vergi ${money(x.taxCost)}, diğer ${money(x.otherCost)}</p></section>`,`${button("Masraf Ekle",`buyCost:${x.id}`)}${button("Müşteri Geçmişini Aç",`customerDetail:${x.purchaseCustomerId}`,"secondary")}${button("Evrakları Gör",`mediaList:BUY_SELL:${x.id}`,"secondary")}${button("Satış Fişi Oluştur",`buyReceipt:${x.id}`,"secondary")}`);}
  function buyCost(i){const x=db.buySell.find(x=>x.id===i),m=modal("Masraf Ekle",`<form id="costForm"><div class="form-grid"><label>Masraf türü<select name="key"><option value="repairCost">Tamir</option><option value="cleaningCost">Temizlik</option><option value="accessoryCost">Aksesuar</option><option value="cargoCost">Kargo</option><option value="taxCost">Vergi</option><option value="otherCost">Diğer</option></select></label><label>Tutar<input name="amount" type="number" required></label></div></form>`,button("Masrafı Kaydet","saveCost"));$("[data-action=saveCost]",m).onclick=()=>{const d=formData($("#costForm"));x[d.key]=Number(x[d.key]||0)+Number(d.amount);recalcBuy(x);audit("Al-sat masrafı eklendi","AL-SAT",x.id);save();m.remove();render();toast("Masraf toplam maliyet ve kâra işlendi.");};}
  function recalcBuy(x){x.totalCost=Number(x.purchasePrice||0)+["repairCost","cleaningCost","accessoryCost","cargoCost","taxCost","otherCost"].reduce((a,k)=>a+Number(x[k]||0),0);x.expectedProfit=Number(x.estimatedSalePrice||0)-x.totalCost;x.targetProfit=Number(x.targetSalePrice||0)-x.totalCost;x.actualProfit=Number(x.actualSalePrice||0)-x.totalCost;x.profitRate=x.totalCost?x.actualProfit/x.totalCost*100:0;x.daysInStock=daysStock(x);x.updatedAt=iso();}
  function buyEdit(i){const x=db.buySell.find(x=>x.id===i),m=modal("Tahmini Fiyat Güncelle",`<form id="buyEditForm"><div class="form-grid"><label>Tahmini satış fiyatı<input name="estimatedSalePrice" type="number" value="${x.estimatedSalePrice||0}"></label><label>Hedef satış fiyatı<input name="targetSalePrice" type="number" value="${x.targetSalePrice||0}"></label><label>Minimum satış fiyatı<input name="minSalePrice" type="number" value="${x.minSalePrice||0}"></label></div></form>`,button("Tahmini Fiyat Güncelle","saveBuyEdit"));$("[data-action=saveBuyEdit]",m).onclick=()=>{const d=formData($("#buyEditForm"));Object.assign(x,{estimatedSalePrice:+d.estimatedSalePrice,targetSalePrice:+d.targetSalePrice,minSalePrice:+d.minSalePrice});recalcBuy(x);audit("Al-sat fiyat güncelleme","AL-SAT",x.id);save();m.remove();render();toast("Tahmini ve hedef fiyatlar güncellendi.");};}
  function closeDay(){const list=db.cash.filter(x=>x.at.slice(0,10)===day()),sum=t=>list.filter(x=>x.type===t).reduce((a,x)=>a+Number(x.amount),0),methods=Object.fromEntries(["Nakit","Kart","Havale"].map(m=>[m,list.filter(x=>x.method===m&&x.type==="IN").reduce((a,x)=>a+Number(x.amount),0)])),report={id:id("DAY"),date:day(),income:sum("IN"),expense:sum("OUT"),net:sum("IN")-sum("OUT"),methods,closedBy:user.id,createdAt:iso()};db.dayClosings.unshift(report);audit("Günlük kasa kapatma","KASA",report.id);save();printData("Gün Sonu Kasa Kapatma",report);toast("Gün sonu raporu oluşturuldu.");}
  function receivableModal(){const m=modal("Alacak Ekle",`<form id="recvForm"><div class="form-grid"><label>Müşteri<select name="customerId">${db.customers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label><label>Açıklama<input name="title"></label><label>Tutar<input name="total" type="number"></label><label>Vade<input name="dueDate" type="date" value="${day()}"></label></div></form>`,button("Kaydet","saveRecv"));$("[data-action=saveRecv]",m).onclick=()=>{const d=formData($("#recvForm"));db.receivables.unshift({id:id("RCV"),...d,total:+d.total,paid:0,status:"BEKLIYOR",createdAt:iso()});audit("Alacak oluşturma","ALACAK");save();m.remove();render();toast("Alacak kaydedildi.");};}
  function receivableEdit(i){const x=db.receivables.find(r=>r.id===i);if(!x)return toast("Alacak bulunamadı.","error");const m=modal("Alacağı Düzenle",`<form id="recvEditForm"><div class="form-grid"><label>Müşteri<select name="customerId">${db.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`)}</select></label><label>Açıklama<input name="title" value="${esc(x.title)}"></label><label>Toplam<input name="total" type="number" value="${esc(x.total)}"></label><label>Ödenen<input name="paid" type="number" value="${esc(x.paid||0)}"></label><label>Vade<input name="dueDate" type="date" value="${esc(x.dueDate||day())}"></label><label>Durum<select name="status"><option>BEKLIYOR</option><option>KISMI_ODENDI</option><option>ODENDI</option></select></label></div></form>`,button("Güncelle","saveRecvEdit"));$("[name=customerId]",m).value=x.customerId;$("[name=status]",m).value=x.status;$("[data-action=saveRecvEdit]",m).onclick=()=>{const d=formData($("#recvEditForm")),old={...x};Object.assign(x,{...d,total:+d.total,paid:+d.paid,updatedAt:iso()});audit("Alacak düzenlendi","ALACAK",i,old,x);save();m.remove();render();toast("Alacak güncellendi.");};}
  async function receivableDelete(i){const x=db.receivables.find(r=>r.id===i);if(!x)return toast("Alacak bulunamadı.","error");if(!(await confirmAction("Bu alacak silinsin mi?")))return;db.receivables=db.receivables.filter(r=>r.id!==i);audit("Alacak silindi","ALACAK",i,x,null);save();render();toast("Alacak silindi.");}
  function debtMessage(i){const x=db.receivables.find(x=>x.id===i),c=db.customers.find(c=>c.id===x.customerId);messageModal("Ödeme Hatırlatma",`Sayın ${c?.name||"müşterimiz"}, ${money(x.total-x.paid)} tutarındaki ödemeniz beklemektedir.`,c?.phone);}
  function marketModal(){const m=modal("Manuel Piyasa Fiyatı",`<form id="marketForm"><div class="form-grid"><label>Marka<input name="brand" required></label><label>Model<input name="model" required></label><label>Kondisyon<select name="condition"><option>İkinci El</option><option>Sıfır</option><option>Yenilenmiş</option><option>Hasarlı</option></select></label><label>Fiyat<input name="price" type="number" required></label><label>Para birimi<select name="currency"><option>TL</option><option>USD</option><option>EUR</option></select></label><label>Kaynak adı<input name="sourceName" value="Manuel"></label><label class="wide">Kaynak linki<input name="sourceUrl" type="url"></label><label class="full">Not<textarea name="note"></textarea></label></div></form>`,button("Fiyatı Kaydet","saveMarket"));$("[data-action=saveMarket]",m).onclick=()=>{const d=formData($("#marketForm"));db.marketPrices.unshift({id:id("MKT"),...d,price:+d.price,recordedAt:iso()});audit("Piyasa fiyatı eklendi","FİYAT");save();m.remove();render();toast("Piyasa fiyatı geçmişe kaydedildi.");};}
  function marketEdit(i){const x=db.marketPrices.find(r=>r.id===i);if(!x)return toast("Fiyat kaydı bulunamadı.","error");const m=modal("Piyasa Fiyatını Düzenle",`<form id="marketEditForm"><div class="form-grid"><label>Marka<input name="brand" required value="${esc(x.brand)}"></label><label>Model<input name="model" required value="${esc(x.model)}"></label><label>Kondisyon<select name="condition"><option>İkinci El</option><option>Sıfır</option><option>Yenilenmiş</option><option>Hasarlı</option></select></label><label>Fiyat<input name="price" type="number" required value="${esc(x.price)}"></label><label>Para birimi<select name="currency"><option>TL</option><option>USD</option><option>EUR</option></select></label><label>Kaynak adı<input name="sourceName" value="${esc(x.sourceName||"Manuel")}"></label><label class="wide">Kaynak linki<input name="sourceUrl" type="url" value="${esc(x.sourceUrl||"")}"></label><label class="full">Not<textarea name="note">${esc(x.note||"")}</textarea></label></div></form>`,button("Güncelle","saveMarketEdit"));$("[name=condition]",m).value=x.condition;$("[name=currency]",m).value=x.currency||"TL";$("[data-action=saveMarketEdit]",m).onclick=()=>{const d=formData($("#marketEditForm")),old={...x};Object.assign(x,{...d,price:+d.price,updatedAt:iso()});audit("Piyasa fiyatı düzenlendi","FİYAT",i,old,x);save();m.remove();render();toast("Fiyat kaydı güncellendi.");};}
  async function marketDelete(i){const x=db.marketPrices.find(r=>r.id===i);if(!x)return toast("Fiyat kaydı bulunamadı.","error");if(!(await confirmAction("Fiyat kaydı silinsin mi?")))return;db.marketPrices=db.marketPrices.filter(r=>r.id!==i);audit("Piyasa fiyatı silindi","FİYAT",i,x,null);save();render();toast("Fiyat kaydı silindi.");}
  function marketStats(action){const a=db.marketPrices.map(x=>+x.price);if(!a.length)return toast("Hesaplanacak fiyat yok.","error");const value=action==="averageMarket"?`Ortalama: ${money(a.reduce((s,x)=>s+x,0)/a.length)}`:`En düşük: ${money(Math.min(...a))} - En yüksek: ${money(Math.max(...a))}`;modal("Fiyat Özeti",`<div class="code-box">${value}</div>${priceChart()}`);}
  function priceChart(){const a=db.marketPrices.slice(0,12).reverse(),max=Math.max(...a.map(x=>x.price),1);return `<div class="chart">${a.map(x=>`<div class="chart-bar" style="height:${x.price/max*100}%"><span>${Math.round(x.price/1000)}b</span></div>`).join("")}</div>`;}
  function supplierModal(){const m=modal("Tedarikçi Ekle",`<form id="supplierForm"><div class="form-grid"><label>Firma adı<input name="name" required></label><label>Telefon<input name="phone"></label><label class="wide">Adres<input name="address"></label></div></form>`,button("Kaydet","saveSupplier"));$("[data-action=saveSupplier]",m).onclick=()=>{db.suppliers.unshift({id:id("SUP"),...formData($("#supplierForm")),createdAt:iso()});save();m.remove();render();toast("Tedarikçi eklendi.");};}
  function supplierDebtModal(){if(!db.suppliers.length)return toast("Önce tedarikçi ekleyin.","error");const m=modal("Firma Borcu Ekle",`<form id="supDebt"><div class="form-grid"><label>Firma<select name="supplierId">${db.suppliers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label><label>Açıklama<input name="title"></label><label>Tutar<input name="amount" type="number"></label><label>Vade<input name="dueDate" type="date"></label></div></form>`,button("Kaydet","saveSupDebt"));$("[data-action=saveSupDebt]",m).onclick=()=>{const d=formData($("#supDebt"));db.supplierDebts.unshift({id:id("SDEBT"),...d,amount:+d.amount,paid:0,createdAt:iso()});save();m.remove();render();toast("Firma borcu kaydedildi.");};}
  function supplierPay(i){const debts=db.supplierDebts.filter(x=>x.supplierId===i&&x.paid<x.amount),amount=+prompt("Ödeme tutarı","0");if(!amount)return;let left=amount;for(const d of debts){const take=Math.min(left,d.amount-d.paid);d.paid+=take;left-=take;if(!left)break;}db.cash.unshift({id:id("CSH"),type:"OUT",amount,title:"Tedarikçi ödemesi",method:"Havale",at:iso()});audit("Tedarikçi ödemesi","TEDARİKÇİ",i);save();render();toast("Ödeme borçtan ve kasadan işlendi.");}
  function supplierEdit(i){const x=db.suppliers.find(s=>s.id===i);if(!x)return toast("Tedarikçi bulunamadı.","error");const m=modal("Tedarikçiyi Düzenle",`<form id="supplierEditForm"><div class="form-grid"><label>Firma adı<input name="name" required value="${esc(x.name)}"></label><label>Telefon<input name="phone" value="${esc(x.phone||"")}"></label><label class="wide">Adres<input name="address" value="${esc(x.address||"")}"></label></div></form>`,button("Güncelle","saveSupplierEdit"));$("[data-action=saveSupplierEdit]",m).onclick=()=>{const old={...x};Object.assign(x,formData($("#supplierEditForm")),{updatedAt:iso()});audit("Tedarikçi düzenlendi","TEDARİKÇİ",i,old,x);save();m.remove();render();toast("Tedarikçi güncellendi.");};}
  function supplierDebts(i){const s=db.suppliers.find(s=>s.id===i),rows=db.supplierDebts.filter(d=>d.supplierId===i);modal(`${s?.name||"Tedarikçi"} Borçları`,rows.length?table(["Açıklama","Tutar","Ödenen","Kalan","Vade"],rows.map(d=>[esc(d.title),money(d.amount),money(d.paid),money(d.amount-d.paid),esc(d.dueDate||"-")])):`<div class="empty-state"><strong>Borç kaydı yok</strong>Bu firma için borç eklenmemiş.</div>`);}
  async function supplierDelete(i){const x=db.suppliers.find(s=>s.id===i);if(!x)return toast("Tedarikçi bulunamadı.","error");if(db.supplierDebts.some(d=>d.supplierId===i))return toast("Bu tedarikçiye bağlı borç kaydı var. Önce borçları kapatın veya kontrol edin.","error");if(!(await confirmAction("Tedarikçi silinsin mi?")))return;db.suppliers=db.suppliers.filter(s=>s.id!==i);audit("Tedarikçi silindi","TEDARİKÇİ",i,x,null);save();render();toast("Tedarikçi silindi.");}
  function branchModal(){const m=modal("Şube Oluştur",`<form id="branchForm"><div class="form-grid"><label>Şube adı<input name="name" required></label><label>Telefon<input name="phone"></label><label class="wide">Adres<input name="address"></label></div></form>`,button("Şubeyi Kaydet","saveBranch"));$("[data-action=saveBranch]",m).onclick=()=>{db.branches.unshift({id:id("BRA"),...formData($("#branchForm")),active:true,createdAt:iso()});audit("Şube oluşturma","ŞUBE");save();m.remove();render();toast("Şube oluşturuldu.");};}
  function branchEdit(i){const x=db.branches.find(x=>x.id===i),m=modal("Şubeyi Düzenle",`<form id="branchEditForm"><div class="form-grid"><label>Şube adı<input name="name" value="${esc(x.name)}"></label><label>Telefon<input name="phone" value="${esc(x.phone)}"></label><label class="wide">Adres<input name="address" value="${esc(x.address)}"></label><label>Durum<select name="active"><option value="true">Aktif</option><option value="false">Pasif</option></select></label></div></form>`,button("Güncelle","saveBranchEdit"));$("[name=active]",m).value=String(x.active);$("[data-action=saveBranchEdit]",m).onclick=()=>{const d=formData($("#branchEditForm"));Object.assign(x,d,{active:d.active==="true"});audit("Şube güncelleme","ŞUBE",x.id);save();m.remove();render();toast("Şube güncellendi.");};}
  function branchToggle(i){const x=db.branches.find(b=>b.id===i);if(!x)return toast("Şube bulunamadı.","error");x.active=!x.active;x.updatedAt=iso();audit("Şube durumu değişti","ŞUBE",i);save();render();toast(x.active?"Şube aktifleştirildi.":"Şube pasifleştirildi.");}
  async function branchDelete(i){const x=db.branches.find(b=>b.id===i);if(!x)return toast("Şube bulunamadı.","error");const linked=[...db.services,...db.stock,...db.sales,...db.cash].some(r=>r.branchId===i);if(linked)return toast("Bu şubeye bağlı kayıt var. Silmek yerine pasifleştirin.","error");if(!(await confirmAction("Şube silinsin mi?")))return;db.branches=db.branches.filter(b=>b.id!==i);audit("Şube silindi","ŞUBE",i,x,null);save();render();toast("Şube silindi.");}
  function saveSettings(){const d=formData($("#settingsForm"));Object.assign(db.settings,d);audit("Ayar değiştirme","AYAR");save();render();toast("İşletme bilgileri kaydedildi.");}
  function brandModal(){const m=modal("Marka Ekle",`<form id="brandForm"><div class="form-grid"><label>Marka adı<input name="name" required></label><label>Tür<select name="type"><option>Telefon</option><option>Tablet</option><option>Laptop</option><option>Masaüstü</option><option>Aksesuar</option><option>Diğer</option></select></label></div></form>`,button("Markayı Kaydet","saveBrand"));$("[data-action=saveBrand]",m).onclick=()=>{const d=formData($("#brandForm"));db.brands.push({id:id("BR"),...d,models:[]});save();m.remove();render();toast("Marka eklendi.");};}
  function modelModal(){const m=modal("Model Ekle",`<form id="modelForm"><div class="form-grid"><label>Marka<select name="brandId">${db.brands.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`)}</select></label><label>Model adı<input name="name" required></label><label>Depolama seçenekleri<input name="storageOptions" placeholder="128 GB, 256 GB"></label><label>RAM seçenekleri<input name="ramOptions" placeholder="8 GB, 16 GB"></label><label>Renkler<input name="colors" placeholder="Siyah, Beyaz"></label><label>Sık arızalar<input name="commonProblems" placeholder="Ekran, batarya"></label></div></form>`,button("Modeli Kaydet","saveModel"));$("[data-action=saveModel]",m).onclick=()=>{const d=formData($("#modelForm")),b=db.brands.find(x=>x.id===d.brandId);b.models.push({id:id("MD"),...d});save();m.remove();render();toast("Model kataloğa eklendi.");};}
  function modelEdit(){const models=db.brands.flatMap(b=>b.models.map(m=>({brand:b,model:m})));if(!models.length)return toast("Düzenlenecek model yok.","error");const m=modal("Modeli Düzenle",`<form id="modelEditForm"><label>Model<select name="modelId">${models.map(x=>`<option value="${x.model.id}">${esc(x.brand.name)} - ${esc(x.model.name)}</option>`)}</select></label><label>Yeni model adı<input name="name" required></label></form>`,button("Modeli Güncelle","saveModelEdit"));$("[data-action=saveModelEdit]",m).onclick=()=>{const d=formData($("#modelEditForm")),item=models.find(x=>x.model.id===d.modelId);item.model.name=d.name;audit("Cihaz modeli güncellendi","MODEL",item.model.id);save();m.remove();render();toast("Model güncellendi.");};}
  function backupAll(){const data=JSON.stringify(db,null,2);download(`isletme-yedek-${day()}.json`,data,"application/json");db.backups.unshift({id:id("BAK"),type:"JSON",schedule:db.settings.backupSchedule,createdAt:iso()});audit("Veri yedekleme","YEDEK");save();toast("Tüm veriler JSON olarak yedeklendi.");}
  function flattenDb(){return Object.entries(db).filter(([,v])=>Array.isArray(v)).flatMap(([module,rows])=>rows.map(x=>({module,...x})));}
async function approveRequest(i){const req=(db.accountRequests||[]).find(x=>x.id===i);if(!req)return toast("Hesap talebi bulunamadı.","error");const allowed=user.role==="OWNER"?roles:roles.filter(r=>r!=="OWNER");const m=modal("Hesap Talebini Onayla",`<p><strong>${esc(req.fullName)}</strong> için giriş hesabı açılacak.</p><div class="form-grid"><label>Rol<select id="requestRole">${roleOptions(allowed)}</select></label></div><p class="hint">Onaydan sonra kullanıcı kendi kullanıcı adı ve şifresiyle giriş yapabilir.</p>`,button("Onayla","saveApproveRequest")+button("Vazgeç","close","secondary"));$("#requestRole",m).value=req.requestedRole&&allowed.includes(req.requestedRole)?req.requestedRole:"STAFF";$('[data-action=saveApproveRequest]',m).onclick=async()=>{const role=$("#requestRole",m).value;let created;if(isServer){try{created=(await api(`/account-requests/${i}`,{method:"PATCH",body:JSON.stringify({decision:"APPROVE",role})})).user;}catch(e){return toast(e.message,"error");}}else{if(db.users.some(x=>x.username.toLowerCase()===req.username.toLowerCase()||x.email.toLowerCase()===req.email.toLowerCase()))return toast("Bu kullanıcı adı veya e-posta kullanımda.","error");created={id:id("USR"),fullName:req.fullName,username:req.username,email:req.email,phone:req.phone,role,active:true,permissions:role==="OWNER"?["*"]:[],passwordHash:req.passwordHash,createdAt:iso()};req.status="APPROVED";}db.users=db.users.filter(x=>x.id!==created.id);db.users.unshift(created);req.status="APPROVED";audit("Hesap talebi onaylandı","KULLANICI",created.id);save();m.remove();render();toast("Hesap onaylandı. Kullanıcı artık giriş yapabilir.");};}
async function rejectRequest(i){const req=(db.accountRequests||[]).find(x=>x.id===i);if(!req)return toast("Hesap talebi bulunamadı.","error");if(!(await confirmAction(`${req.fullName} hesap talebi reddedilsin mi?`)))return;if(isServer)try{await api(`/account-requests/${i}`,{method:"PATCH",body:JSON.stringify({decision:"REJECT"})});}catch(e){return toast(e.message,"error");}req.status="REJECTED";audit("Hesap talebi reddedildi","KULLANICI_TALEBI",i);save();render();toast("Hesap talebi reddedildi.");}
function userModal(){const allowedRoles=user.role==="OWNER"?roles:roles.filter(x=>x!=="OWNER");const m=modal("Kullanıcı Oluştur",`<form id="userForm"><div class="form-grid"><label>Ad soyad<input name="fullName" required></label><label>Kullanıcı adı<input name="username" required></label><label>E-posta<input name="email" type="email" required></label><label>Telefon<input name="phone"></label><label>Geçici şifre<input name="password" type="password" required></label><label>Görevi<select name="role">${roleOptions(allowedRoles)}</select></label></div></form>`,button("Kullanıcı Oluştur","saveUser"));$("[data-action=saveUser]",m).onclick=async()=>{const d=formData($("#userForm"));if(!validPassword(d.password))return toast("Şifre kurallara uymuyor.","error");if(db.users.some(x=>x.username===d.username||x.email===d.email))return toast("Kullanıcı adı veya e-posta kullanımda.","error");let created;if(isServer){try{created=(await api("/users",{method:"POST",body:JSON.stringify(d)})).user;}catch(e){return toast(e.message,"error");}}else created={id:id("USR"),fullName:d.fullName,username:d.username,email:d.email,phone:d.phone,role:d.role,active:true,permissions:d.role==="OWNER"?["*"]:[],passwordHash:await hashPassword(d.password),createdAt:iso()};db.users.unshift(created);audit("Kullanıcı oluşturma","KULLANICI",created.id);save();m.remove();render();toast("Kullanıcı oluşturuldu.");};}

async function editUser(i){const x=db.users.find(u=>u.id===i);if(!x)return toast("Kullanıcı bulunamadı.","error");if(x.role==="OWNER"&&x.id!==user.id)return toast("İşletme Sahibi hesabı başka kullanıcı tarafından değiştirilemez.","error");const m=modal("Hesabı Düzenle",`<form id="editUserForm"><div class="form-grid"><label>Ad soyad<input name="fullName" value="${esc(x.fullName)}" required></label><label>Kullanıcı adı<input name="username" value="${esc(x.username)}" required></label><label>E-posta<input name="email" type="email" value="${esc(x.email)}" required></label><label>Telefon<input name="phone" value="${esc(x.phone||"")}"></label></div><p class="hint">Bu alan yalnızca İşletme Sahibi ve Yönetici hesaplarında görünür.</p></form>`,button("Bilgileri Kaydet","saveEditUser"));$("[data-action=saveEditUser]",m).onclick=async()=>{const d=formData($("#editUserForm"));d.fullName=String(d.fullName||"").trim();d.username=String(d.username||"").trim();d.email=String(d.email||"").trim().toLowerCase();if(!d.fullName||!d.username||!d.email)return toast("Ad soyad, kullanıcı adı ve e-posta zorunludur.","error");if(db.users.some(u=>u.id!==x.id&&(u.username.toLowerCase()===d.username.toLowerCase()||u.email.toLowerCase()===d.email.toLowerCase())))return toast("Kullanıcı adı veya e-posta kullanımda.","error");let updated;if(isServer){try{updated=(await api(`/users/${x.id}`,{method:"PATCH",body:JSON.stringify(d)})).user;}catch(e){return toast(e.message,"error");}}else{Object.assign(x,d);updated=x;}Object.assign(x,updated);if(x.id===user.id)user={...user,...updated};audit("Yönetici hesap bilgilerini güncelledi","KULLANICI",x.id);save();m.remove();render();toast("Kullanıcı bilgileri güncellendi.");};}
function permissionsModal(i){const x=db.users.find(x=>x.id===i);if(x.role==="OWNER")return toast("İşletme Sahibi yetkileri kaldırılamaz.","error");const m=modal("Kullanıcı Yetkileri",`<p><strong>${esc(x.fullName)}</strong></p><div class="permission-grid">${permissions.map(([key,desc])=>`<label><input type="checkbox" value="${esc(key)}" ${(x.permissions||[]).includes(key)?"checked":""}>${esc(desc)} <small>${esc(key)}</small></label>`).join("")}</div>`,button("Yetkileri Kaydet","savePermissions"));$("[data-action=savePermissions]",m).onclick=async()=>{x.permissions=$$(".permission-grid input:checked",m).map(c=>c.value);if(isServer)try{await api(`/users/${x.id}`,{method:"PATCH",body:JSON.stringify({permissions:x.permissions})});}catch(e){return toast(e.message,"error");}audit("Kullanıcı yetkileri değiştirildi","KULLANICI",x.id);save();m.remove();render();toast("Yetkiler güncellendi.");};}
async function toggleUser(i){const x=db.users.find(x=>x.id===i);if(x.id===user.id)return toast("Kendi hesabınızı pasifleştiremezsiniz.","error");if(x.role==="OWNER")return toast("İşletme Sahibi hesabı pasifleştirilemez.","error");const active=!x.active;if(isServer)try{await api(`/users/${i}`,{method:"PATCH",body:JSON.stringify({active})});}catch(e){return toast(e.message,"error");}x.active=active;audit("Kullanıcı durumu değiştirildi","KULLANICI",i);save();render();}
function roleUser(i){const x=db.users.find(x=>x.id===i);if(x.role==="OWNER"&&x.id!==user.id)return toast("İşletme Sahibi yetkisi düşürülemez.","error");const allowed=user.role==="OWNER"?roles:roles.filter(r=>r!=="OWNER"),m=modal("Yetkisini Değiştir",`<label>Görevi<select id="newRole">${allowed.map(r=>`<option value="${r}" ${r===x.role?"selected":""}>${roleLabel(r)}</option>`).join("")}</select></label>`,button("Görevi Güncelle","saveRole"));$("[data-action=saveRole]",m).onclick=async()=>{const role=$("#newRole").value;if(x.role==="OWNER"&&role!=="OWNER")return toast("İşletme Sahibi görevi değiştirilemez.","error");if(isServer)try{await api(`/users/${i}`,{method:"PATCH",body:JSON.stringify({role})});}catch(e){return toast(e.message,"error");}x.role=role;if(role==="OWNER")x.permissions=["*"];audit("Kullanıcı görevi değiştirildi","KULLANICI",i);save();m.remove();render();toast("Kullanıcı görevi güncellendi.");};}
async function deleteUser(i){const x=db.users.find(x=>x.id===i);if(!isAdmin())return toast("Kullanıcı silme yetkisi gerekli.","error");if(!x)return toast("Kullanıcı bulunamadı.","error");if(x.id===user.id)return toast("Kendi hesabınızı silemezsiniz.","error");if(x.role==="OWNER")return toast("İşletme Sahibi hesabı silinemez.","error");if(!(await confirmAction(`${x.fullName} kullanıcısı silinsin mi?`)))return;if(isServer)try{await api(`/users/${i}`,{method:"DELETE"});}catch(e){return toast(e.message,"error");}db.users=db.users.filter(u=>u.id!==i);audit("Kullanıcı silindi","KULLANICI",i);save();render();toast("Kullanıcı silindi.");}
function resetUser(i){const x=db.users.find(x=>x.id===i);if(!x)return toast("Kullanıcı bulunamadı.","error");if(x.role==="OWNER"&&x.id!==user.id)return toast("İşletme Sahibi şifresini yalnızca kendisi değiştirebilir.","error");const m=modal("Şifreyi Değiştir",`<form id="resetForm"><label>Yeni geçici şifre<input name="password" type="password" required></label><p class="hint">Şifre değişince kullanıcının açık oturumları kapatılır.</p></form>`,button("Şifreyi Değiştir","saveReset"));$("[data-action=saveReset]",m).onclick=async()=>{const p=formData($("#resetForm")).password;if(!validPassword(p))return toast("Şifre kurallara uymuyor.","error");if(isServer)try{await api(`/users/${i}/reset-password`,{method:"POST",body:JSON.stringify({password:p})});}catch(e){return toast(e.message,"error");}else x.passwordHash=await hashPassword(p);audit("Yönetici şifre değiştirme","KULLANICI",i);save();m.remove();if(x.id===user.id){sessionStorage.clear();user=null;toast("Şifreniz değiştirildi. Tekrar giriş yapın.");return renderLogin();}toast("Kullanıcı şifresi değiştirildi ve açık oturumları kapatıldı.");};}
  async function updateAccount(){const d=formData($("#accountForm"));if(db.users.some(x=>x.id!==user.id&&(x.username.toLowerCase()===d.username.toLowerCase()||x.email.toLowerCase()===d.email.toLowerCase())))return toast("Kullanıcı adı veya e-posta kullanımda.","error");if(isServer){try{const r=await api("/account",{method:"PATCH",body:JSON.stringify(d)});user=r.user;}catch(e){return toast(e.message,"error");}}else Object.assign(user,d);audit("Hesap bilgileri güncellendi","KULLANICI",user.id);save();render();toast("Bilgileriniz güncellendi.");}
  function passwordModal(){const m=modal("Şifremi Değiştir",`<form id="passwordForm"><div class="form-grid"><label>Mevcut şifre<input name="currentPassword" type="password" required></label><label>Yeni şifre<input name="newPassword" type="password" required></label><label>Yeni şifre tekrar<input name="confirm" type="password" required></label></div><p class="hint">En az 8 karakter, büyük harf, küçük harf ve rakam kullanın.</p></form>`,button("Şifremi Değiştir","savePassword"));$("[data-action=savePassword]",m).onclick=async()=>{const d=formData($("#passwordForm"));if(d.newPassword!==d.confirm||!validPassword(d.newPassword))return toast("Yeni şifreyi ve kuralları kontrol edin.","error");if(isServer){try{await api("/account/password",{method:"POST",body:JSON.stringify(d)});}catch(e){return toast(e.message,"error");}}else{if(!(await verifyPassword(d.currentPassword,user.passwordHash)))return toast("Mevcut şifre yanlış.","error");user.passwordHash=await hashPassword(d.newPassword);audit("Şifre değişikliği","GÜVENLİK",user.id);save();}m.remove();sessionStorage.clear();user=null;toast("Şifre değiştirildi. Tekrar giriş yapın.");renderLogin();};}
  async function closeSessions(){if(!(await confirmAction("Tüm açık oturumlar kapatılsın mı?")))return;if(isServer)await api("/account/sessions",{method:"DELETE"});sessionStorage.clear();user=null;renderLogin();toast("Tüm oturumlar kapatıldı.");}
  function loginHistory(){const logs=db.auditLogs.filter(x=>x.userId===user.id&&/Giriş|giriş|LOGIN/.test(x.action));modal("Giriş Geçmişim",logs.length?table(["İşlem","Tarih","Cihaz"],logs.map(x=>[esc(x.action),fmt(x.createdAt),esc(x.userAgent)])):`<div class="empty-state"><strong>Giriş kaydı yok</strong>Yeni girişler burada görünür.</div>`);}
  function auditDetail(i){const x=db.auditLogs.find(x=>x.id===i);modal("İşlem Detayı",`<pre>${esc(JSON.stringify(x,null,2))}</pre>`);}
  function auditFilter(){const m=modal("İşlem Geçmişini Filtrele",`<label>İşlem türü<input id="auditQuery" placeholder="Örn. servis, giriş, kasa"></label><div id="auditFiltered"></div>`,button("Filtrele","runAuditFilter"));$("[data-action=runAuditFilter]",m).onclick=()=>{const q=$("#auditQuery").value.toLowerCase(),rows=db.auditLogs.filter(x=>JSON.stringify(x).toLowerCase().includes(q));$("#auditFiltered").innerHTML=`<p>${rows.length} kayıt bulundu.</p>`;};}
  function editHelp(){modal("Yardım İçeriğini Düzenle",`<p class="hint">Yardım içerikleri sade Türkçe ile düzenlenebilir.</p><textarea>${esc((help[route]||help.default).join("\n"))}</textarea>`,button("Kaydet","closeHelpEdit"));$("[data-action=closeHelpEdit]").onclick=()=>toast("Yardım metni kaydedildi.");}
  function printData(title,data){$("#printArea").innerHTML=`<h1>${esc(title)}</h1><p>${esc(db.settings.businessName||"İşletme")}</p><pre>${esc(JSON.stringify(data,null,2))}</pre><p>${esc(db.settings.receiptText||"")}</p>`;window.print();}
  function exportCsv(name,rows){const list=Array.isArray(rows)?rows:[];if(!list.length)return toast("Dışa aktarılacak kayıt yok.","error");const keys=[...new Set(list.flatMap(Object.keys))],csv="\ufeff"+[keys.join(";"),...list.map(r=>keys.map(k=>`"${String(typeof r[k]==="object"?JSON.stringify(r[k]):r[k]??"").replaceAll('"','""')}"`).join(";"))].join("\n");download(`${name}-${day()}.csv`,csv,"text/csv;charset=utf-8");toast("Excel uyumlu dosya hazırlandı.");}
  function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  async function logout(){if(isServer)try{await api("/logout",{method:"POST"});}catch{}audit("Çıkış","GÜVENLİK",user?.id);sessionStorage.clear();user=null;renderLogin();}
  document.addEventListener("click",e=>{const target=e.target.closest("[data-action]");if(target&&!target.dataset.bound)handle(target.dataset.action,target);});
  window.addEventListener("hashchange",()=>{route=location.hash.slice(2)||"dashboard";if(user)render();});
  if("serviceWorker" in navigator && isServer) window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
  boot();
})();
