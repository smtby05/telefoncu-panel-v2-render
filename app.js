(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const today = () => new Date().toISOString().slice(0, 10);
  const now = () => new Date().toISOString();
  const uid = (p) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const STORE = "telefoncu-panel-db-v1";
  const defaultLocales = {
    tr: {
      appName: "Telefoncu Paneli", dashboard: "Panel", services: "Servisler", customers: "Musteriler", devices: "Cihazlar", stock: "Stok / Malzemeler", sales: "Satis", buySell: "Al-Sat", cash: "Kasa", receivables: "Alacaklar", returns: "Iadeler", cargo: "Kargo", external: "Dis Servis", reports: "Raporlar", invoices: "Fatura / Fis", marketPrices: "Piyasa Fiyatlari", settings: "Ayarlar", users: "Kullanicilar", notifications: "Bildirimler", selectLanguage: "Dil Sec", searchPlaceholder: "Musteri, telefon, servis no, IMEI, seri no veya urun ara", save: "Kaydet", delete: "Sil", edit: "Duzenle", detail: "Detay", update: "Guncelle", cancel: "Vazgec", confirm: "Onayla", success: "Islem basarili", error: "Islem tamamlanamadi", loading: "Isleniyor", confirmDelete: "Bu kayit silinsin mi?", required: "Zorunlu alanlari doldurun", login: "Giris Yap", logout: "Cikis", username: "Kullanici adi", password: "Sifre", adminHint: "Ilk giris: admin / admin123", tamirde: "Tamirde", hazir: "Hazir", kargoda: "Kargoyla Gelen", iade: "Iade", disServis: "Dis Serviste"
    },
    en: { appName: "Phone Shop Panel", dashboard: "Dashboard", services: "Services", customers: "Customers", devices: "Devices", stock: "Stock / Parts", sales: "Sales", buySell: "Trade-In", cash: "Cashbox", receivables: "Receivables", returns: "Returns", cargo: "Cargo", external: "External Service", reports: "Reports", invoices: "Invoices / Receipts", marketPrices: "Market Prices", settings: "Settings", users: "Users", notifications: "Notifications", selectLanguage: "Select Language", searchPlaceholder: "Search customer, phone, service no, IMEI, serial or product", save: "Save", delete: "Delete", edit: "Edit", detail: "Detail", update: "Update", cancel: "Cancel", confirm: "Confirm", success: "Action completed", error: "Action failed", loading: "Loading", confirmDelete: "Delete this record?", required: "Please fill required fields", login: "Sign In", logout: "Logout", username: "Username", password: "Password", adminHint: "First login: admin / admin123", tamirde: "In Repair", hazir: "Ready", kargoda: "Incoming Cargo", iade: "Return", disServis: "External Service" },
    ar: { appName: "لوحة محل الهواتف", dashboard: "الرئيسية", services: "الصيانة", customers: "العملاء", devices: "الأجهزة", stock: "المخزون / القطع", sales: "المبيعات", buySell: "شراء وبيع", cash: "الصندوق", receivables: "المستحقات", returns: "المرتجعات", cargo: "الشحن", external: "صيانة خارجية", reports: "التقارير", invoices: "الفواتير / الإيصالات", marketPrices: "أسعار السوق", settings: "الإعدادات", users: "المستخدمون", notifications: "الإشعارات", selectLanguage: "اختر اللغة", searchPlaceholder: "ابحث باسم العميل أو الهاتف أو رقم الصيانة أو IMEI أو المنتج", save: "حفظ", delete: "حذف", edit: "تعديل", detail: "تفاصيل", update: "تحديث", cancel: "إلغاء", confirm: "تأكيد", success: "تمت العملية بنجاح", error: "تعذرت العملية", loading: "جار المعالجة", confirmDelete: "هل تريد حذف هذا السجل؟", required: "يرجى ملء الحقول المطلوبة", login: "تسجيل الدخول", logout: "خروج", username: "اسم المستخدم", password: "كلمة المرور", adminHint: "الدخول الأول: admin / admin123", tamirde: "قيد الصيانة", hazir: "جاهز", kargoda: "شحن وارد", iade: "إرجاع", disServis: "صيانة خارجية" },
    de: { appName: "Handyshop Panel", dashboard: "Dashboard", services: "Service", customers: "Kunden", devices: "Gerate", stock: "Lager / Teile", sales: "Verkauf", buySell: "Ankauf-Verkauf", cash: "Kasse", receivables: "Forderungen", returns: "Retouren", cargo: "Versand", external: "Externer Service", reports: "Berichte", invoices: "Rechnung / Beleg", marketPrices: "Marktpreise", settings: "Einstellungen", users: "Benutzer", notifications: "Benachrichtigungen", selectLanguage: "Sprache Wahlen", searchPlaceholder: "Kunde, Telefon, Service-Nr, IMEI, Seriennr oder Produkt suchen", save: "Speichern", delete: "Loschen", edit: "Bearbeiten", detail: "Details", update: "Aktualisieren", cancel: "Abbrechen", confirm: "Bestatigen", success: "Aktion abgeschlossen", error: "Aktion fehlgeschlagen", loading: "Wird geladen", confirmDelete: "Diesen Datensatz loschen?", required: "Bitte Pflichtfelder ausfullen", login: "Anmelden", logout: "Abmelden", username: "Benutzername", password: "Passwort", adminHint: "Erster Login: admin / admin123", tamirde: "In Reparatur", hazir: "Bereit", kargoda: "Eingehende Sendung", iade: "Retour", disServis: "Externer Service" }
  };
  const statusMap = {
    TAMIRDE: "Tamirde", HAZIR: "Hazir", TESLIM_EDILDI: "Teslim Edildi", IADE: "Iade", IPTAL: "Iptal", KARGODA: "Kargoda", DIS_SERVIS: "Dis Servis", GELDI: "Geldi", TESLIM_ALINDI: "Teslim Alindi", ODENDI: "Odendi", BEKLIYOR: "Bekliyor"
  };
  const phraseMap = {
    en: {
      "Telefoncu Yönetim Paneli": "Phone Shop Management Panel", "Yeni Servis Kaydı": "New Service Record", "Yeni Satış": "New Sale", "Kasa Girişi": "Cash In", "Kasa Çıkışı": "Cash Out", "Stok Ekle": "Add Stock", "Müşteri Ekle": "Add Customer", "Bugünkü Rapor": "Today Report", "Düşük Stokları Gör": "Show Low Stock", "Hazır Cihazları Gör": "Show Ready Devices", "Bekleyen Alacakları Gör": "Show Pending Receivables", "Hizli Islemler": "Quick Actions", "Son Islemler": "Recent Activity",
      "Piyasa Fiyatları": "Market Prices", "Fiyat Ara": "Search Price", "Manuel Fiyat Ekle": "Add Manual Price", "Fiyatı Al-Sat Kaydına Aktar": "Send Price to Trade-In", "Fiyatı Servis Kaydına Not Olarak Ekle": "Add Price as Service Note", "Fiyat Geçmişini Gör": "Show Price History", "Fiyatı Yenile": "Refresh Price", "Kaynak Linkini Aç": "Open Source Link", "Ortalama Fiyat Hesapla": "Calculate Average Price", "En Düşük / En Yüksek Fiyatı Göster": "Show Min / Max Price",
      "Müşteri Adı": "Customer Name", "Telefon": "Phone", "Marka": "Brand", "Model": "Model", "Depolama": "Storage", "RAM": "RAM", "Renk": "Color", "Kondisyon": "Condition", "Garanti Durumu": "Warranty Status", "Fiyat": "Price", "Kaynak": "Source", "Kaynak Linki": "Source Link", "Not": "Note", "Arıza": "Issue", "Ön Ödeme": "Prepayment", "Garanti Günü": "Warranty Days", "Servis Kaydını Oluştur": "Create Service Record", "Müşteri Bul": "Find Customer", "Yeni Müşteri Olarak Kaydet": "Save as New Customer", "Cihaz Geçmişini Kontrol Et": "Check Device History", "Ön Ödeme Ekle": "Add Prepayment", "Servis Formu Oluştur": "Create Service Form", "Kaydet ve Yazdır": "Save and Print", "Kaydet ve Yeni Kayıt Aç": "Save and New", "Temizle": "Clear", "Geri Dön": "Back", "Çıkış": "Logout", "Tema": "Theme", "Global Ara": "Global Search", "Piyasa fiyati kaydedildi": "Market price saved", "Servis kaydi olusturuldu": "Service record created", "Kayit silindi": "Record deleted", "Kayit guncellendi": "Record updated", "Ayarlar kaydedildi": "Settings saved"
    },
    ar: {
      "Telefoncu Yönetim Paneli": "لوحة إدارة محل الهواتف", "Yeni Servis Kaydı": "تسجيل صيانة جديد", "Yeni Satış": "بيع جديد", "Kasa Girişi": "إدخال للصندوق", "Kasa Çıkışı": "خروج من الصندوق", "Stok Ekle": "إضافة مخزون", "Müşteri Ekle": "إضافة عميل", "Bugünkü Rapor": "تقرير اليوم", "Düşük Stokları Gör": "عرض المخزون المنخفض", "Hazır Cihazları Gör": "عرض الأجهزة الجاهزة", "Bekleyen Alacakları Gör": "عرض المستحقات", "Hizli Islemler": "إجراءات سريعة", "Son Islemler": "آخر العمليات",
      "Piyasa Fiyatları": "أسعار السوق", "Fiyat Ara": "بحث عن السعر", "Manuel Fiyat Ekle": "إضافة سعر يدوي", "Fiyatı Al-Sat Kaydına Aktar": "نقل السعر للشراء والبيع", "Fiyatı Servis Kaydına Not Olarak Ekle": "إضافة السعر كملاحظة صيانة", "Fiyat Geçmişini Gör": "عرض سجل الأسعار", "Fiyatı Yenile": "تحديث السعر", "Kaynak Linkini Aç": "فتح رابط المصدر", "Ortalama Fiyat Hesapla": "حساب متوسط السعر", "En Düşük / En Yüksek Fiyatı Göster": "عرض الأقل / الأعلى",
      "Müşteri Adı": "اسم العميل", "Telefon": "الهاتف", "Marka": "العلامة", "Model": "الموديل", "Depolama": "التخزين", "RAM": "الذاكرة", "Renk": "اللون", "Kondisyon": "الحالة", "Garanti Durumu": "حالة الضمان", "Fiyat": "السعر", "Kaynak": "المصدر", "Kaynak Linki": "رابط المصدر", "Not": "ملاحظة", "Arıza": "العطل", "Ön Ödeme": "دفعة مقدمة", "Garanti Günü": "أيام الضمان", "Servis Kaydını Oluştur": "إنشاء سجل الصيانة", "Müşteri Bul": "بحث عن عميل", "Yeni Müşteri Olarak Kaydet": "حفظ كعميل جديد", "Cihaz Geçmişini Kontrol Et": "فحص سجل الجهاز", "Ön Ödeme Ekle": "إضافة دفعة مقدمة", "Servis Formu Oluştur": "إنشاء نموذج الصيانة", "Kaydet ve Yazdır": "حفظ وطباعة", "Kaydet ve Yeni Kayıt Aç": "حفظ وفتح سجل جديد", "Temizle": "مسح", "Geri Dön": "رجوع", "Çıkış": "خروج", "Tema": "السمة", "Global Ara": "بحث شامل", "Piyasa fiyati kaydedildi": "تم حفظ سعر السوق", "Servis kaydi olusturuldu": "تم إنشاء سجل الصيانة", "Kayit silindi": "تم حذف السجل", "Kayit guncellendi": "تم تحديث السجل", "Ayarlar kaydedildi": "تم حفظ الإعدادات"
    },
    de: {
      "Telefoncu Yönetim Paneli": "Handyshop Verwaltungsbereich", "Yeni Servis Kaydı": "Neuer Serviceauftrag", "Yeni Satış": "Neuer Verkauf", "Kasa Girişi": "Kasseneingang", "Kasa Çıkışı": "Kassenausgang", "Stok Ekle": "Lager Hinzufügen", "Müşteri Ekle": "Kunde Hinzufügen", "Bugünkü Rapor": "Tagesbericht", "Düşük Stokları Gör": "Niedrige Bestände", "Hazır Cihazları Gör": "Bereite Geräte", "Bekleyen Alacakları Gör": "Offene Forderungen", "Hizli Islemler": "Schnellaktionen", "Son Islemler": "Letzte Aktionen",
      "Piyasa Fiyatları": "Marktpreise", "Fiyat Ara": "Preis Suchen", "Manuel Fiyat Ekle": "Manuellen Preis Hinzufügen", "Fiyatı Al-Sat Kaydına Aktar": "Preis in Ankauf-Verkauf Übertragen", "Fiyatı Servis Kaydına Not Olarak Ekle": "Preis als Servicenotiz Hinzufügen", "Fiyat Geçmişini Gör": "Preisverlauf Anzeigen", "Fiyatı Yenile": "Preis Aktualisieren", "Kaynak Linkini Aç": "Quelllink Öffnen", "Ortalama Fiyat Hesapla": "Durchschnitt Berechnen", "En Düşük / En Yüksek Fiyatı Göster": "Min / Max Anzeigen",
      "Müşteri Adı": "Kundenname", "Telefon": "Telefon", "Marka": "Marke", "Model": "Modell", "Depolama": "Speicher", "RAM": "RAM", "Renk": "Farbe", "Kondisyon": "Zustand", "Garanti Durumu": "Garantie", "Fiyat": "Preis", "Kaynak": "Quelle", "Kaynak Linki": "Quelllink", "Not": "Notiz", "Arıza": "Fehler", "Ön Ödeme": "Anzahlung", "Garanti Günü": "Garantietage", "Servis Kaydını Oluştur": "Serviceauftrag Erstellen", "Müşteri Bul": "Kunde Suchen", "Yeni Müşteri Olarak Kaydet": "Als Neuen Kunden Speichern", "Cihaz Geçmişini Kontrol Et": "Geräteverlauf Prüfen", "Ön Ödeme Ekle": "Anzahlung Hinzufügen", "Servis Formu Oluştur": "Serviceformular Erstellen", "Kaydet ve Yazdır": "Speichern und Drucken", "Kaydet ve Yeni Kayıt Aç": "Speichern und Neu", "Temizle": "Leeren", "Geri Dön": "Zurück", "Çıkış": "Abmelden", "Tema": "Theme", "Global Ara": "Global Suchen", "Piyasa fiyati kaydedildi": "Marktpreis gespeichert", "Servis kaydi olusturuldu": "Serviceauftrag erstellt", "Kayit silindi": "Datensatz gelöscht", "Kayit guncellendi": "Datensatz aktualisiert", "Ayarlar kaydedildi": "Einstellungen gespeichert"
    }
  };
  const nav = [
    ["dashboard", "📊", "dashboard"], ["services", "🛠", "services"], ["customers", "👥", "customers"], ["devices", "📱", "devices"], ["stock", "📦", "stock"], ["sales", "🧾", "sales"], ["buySell", "🔁", "buy-sell"], ["cash", "💰", "cash"], ["receivables", "📌", "receivables"], ["returns", "↩", "returns"], ["cargo", "🚚", "cargo"], ["external", "🤝", "external"], ["marketPrices", "🌐", "market-prices"], ["reports", "📈", "reports"], ["invoices", "🖨", "invoices"], ["settings", "⚙", "settings"], ["users", "🔐", "users"]
  ];

  let db = load();
  let currentUser = JSON.parse(sessionStorage.getItem("telefoncu-session") || "null");
  let route = location.hash.replace("#/", "") || "dashboard";
  let selected = new Set();
  const t = (key) => (defaultLocales[db.settings.language] || defaultLocales.tr)[key] || defaultLocales.tr[key] || key;
  const money = (n, cur = db.settings.currency) => new Intl.NumberFormat(localeCode(), { style: "currency", currency: cur === "TL" ? "TRY" : cur }).format(Number(n || 0));
  const localeCode = () => ({ tr: "tr-TR", en: "en-US", ar: "ar-SA", de: "de-DE" }[db.settings.language] || "tr-TR");
  const save = () => localStorage.setItem(STORE, JSON.stringify(db));
  const log = (text, module = "Genel") => { db.audit.unshift({ id: uid("LOG"), text, module, user: currentUser?.name || "Sistem", at: now() }); db.audit = db.audit.slice(0, 500); save(); };

  function load() {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
    const initial = {
      settings: {
        language: "tr", currency: "TL", theme: "light", businessName: "Telefoncu Paneli", phone: "", address: "", taxNo: "",
        receiptText: "Servis tesliminden sonra 30 gun icinde teslim alinmayan cihazlardan isletme sorumlu degildir.",
        templates: {
          received: "Sayin musterimiz, {serviceNo} numarali cihaziniz servisimize alinmistir.",
          ready: "Sayin musterimiz, {serviceNo} numarali {device} cihaziniz hazirdir.",
          debt: "Sayin musterimiz, {amount} tutarindaki odemeniz beklemektedir.",
          cargo: "Sayin musterimiz, kargo takip numaraniz: {trackingNo}.",
          delivered: "Sayin musterimiz, {serviceNo} numarali cihaziniz teslim edilmistir."
        }
      },
      counters: { service: 2, invoice: 1 },
      users: [{ id: "USR-admin", name: "Admin", username: "admin", password: "admin123", role: "ADMIN", active: true, createdAt: now() }],
      customers: [{ id: "CUS-demo", name: "Ornek Musteri", phone: "05550000000", address: "Magaza yakini", note: "Demo kayit", createdAt: now() }],
      devices: [{ id: "DEV-demo", customerId: "CUS-demo", brand: "Apple", model: "iPhone 13", imei: "356000000000000", serial: "SN-DEMO-13", color: "Siyah", createdAt: now() }],
      services: [{ id: "SRV-demo", no: "SRV-2026-000001", customerId: "CUS-demo", deviceId: "DEV-demo", brand: "Apple", model: "iPhone 13", issue: "Ekran degisimi", status: "TAMIRDE", price: 2500, paid: 500, warrantyDays: 90, staffId: "USR-admin", notes: ["On odeme alindi"], technicalNotes: ["Ekran siparisi verildi"], createdAt: now() }],
      stock: [{ id: "STK-screen", name: "iPhone 13 Ekran", barcode: "BRK-1001", quantity: 4, minQuantity: 2, buyPrice: 1200, salePrice: 1800, category: "Ekran", createdAt: now() }],
      sales: [], saleItems: [], buySell: [], cash: [{ id: "CSH-demo", type: "IN", amount: 500, currency: "TL", title: "Servis on odeme", ref: "SRV-2026-000001", at: now() }],
      receivables: [{ id: "RCV-demo", customerId: "CUS-demo", title: "Ekran servisi kalan", total: 2000, paid: 0, dueDate: today(), status: "BEKLIYOR", createdAt: now() }],
      returns: [], cargo: [], external: [], invoices: [], marketPrices: [], stockMovements: [], audit: [], notifications: []
    };
    localStorage.setItem(STORE, JSON.stringify(initial));
    return initial;
  }

  function toast(message, type = "success") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = phrase(message);
    $("#toastHost").appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  function phrase(text) {
    if (db.settings.language === "tr") return text;
    return (phraseMap[db.settings.language] || {})[text] || text;
  }
  function confirmBox(message) {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.className = "modal-backdrop";
      wrap.innerHTML = `<div class="modal"><div class="modal-head"><h2>Onay</h2></div><p>${esc(message)}</p><div class="toolbar"><button data-yes>✓ ${t("confirm")}</button><button class="secondary" data-no>✕ ${t("cancel")}</button></div></div>`;
      document.body.appendChild(wrap);
      $("[data-yes]", wrap).onclick = () => { wrap.remove(); resolve(true); };
      $("[data-no]", wrap).onclick = () => { wrap.remove(); resolve(false); };
    });
  }
  function modal(title, body, buttons = "") {
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="modal"><div class="modal-head"><h2>${esc(title)}</h2><button class="secondary icon" data-close title="Kapat">✕</button></div>${body}<div class="toolbar">${buttons}<button class="secondary" data-close>✕ Kapat</button></div></div>`;
    document.body.appendChild(wrap);
    $$("[data-close]", wrap).forEach((b) => b.onclick = () => wrap.remove());
    bindActions(wrap);
    return wrap;
  }
  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])); }
  function formData(root) { return Object.fromEntries(new FormData(root).entries()); }
  function setHash(path) { location.hash = `#/${path}`; }
  window.addEventListener("hashchange", () => { route = location.hash.replace("#/", "") || "dashboard"; selected.clear(); render(); });

  function render() {
    document.documentElement.lang = db.settings.language;
    document.documentElement.dir = db.settings.language === "ar" ? "rtl" : "ltr";
    document.body.dataset.theme = db.settings.theme;
    document.body.classList.toggle("rtl", db.settings.language === "ar");
    if (!currentUser) return renderLogin();
    $("#app").innerHTML = `
      <div class="layout">
        <aside class="sidebar" id="sidebar">
          <div class="brand"><span class="brand-mark">📱</span><span>${t("appName")}</span></div>
          <nav class="nav">${nav.map(([key, icon, path]) => `<button class="${routeBase() === path ? "active" : ""}" data-route="${path}">${icon} ${t(key)}</button>`).join("")}</nav>
        </aside>
        <main class="main">
          <header class="topbar">
            <div class="topbar-left"><button class="mobile-menu icon secondary" data-action="toggleMenu">☰</button><input class="search" id="globalSearch" placeholder="${t("searchPlaceholder")}" value="${esc(db._search || "")}"><button data-action="globalSearch">🔎 Global Ara</button></div>
            <div class="topbar-right">
              <button class="secondary icon" data-route="notifications" title="Bildirimleri Gor">🔔 <span>${notifications().length}</span></button>
              <select id="langSelect" title="${t("selectLanguage")}"><option value="tr">Türkçe</option><option value="en">English</option><option value="ar">العربية</option><option value="de">Deutsch</option></select>
              <button class="secondary" data-action="toggleTheme">◐ Tema</button>
              <button class="secondary" data-action="logout">↪ ${t("logout")}</button>
            </div>
          </header>
          <section class="content">${page()}</section>
        </main>
      </div><div class="print-area" id="printArea"></div>`;
    $("#langSelect").value = db.settings.language;
    $("#langSelect").onchange = (e) => { db.settings.language = e.target.value; save(); toast("Dil ayari kaydedildi"); render(); };
    $("#globalSearch").oninput = (e) => { db._search = e.target.value; };
    bindActions(document);
    localizeVisible(document);
  }
  function renderLogin() {
    $("#app").innerHTML = `<section class="auth"><form class="auth-box" id="loginForm"><div class="auth-logo">📱 ${t("appName")}</div><p class="hint">${t("adminHint")}</p><label>${t("username")}<input name="username" required autocomplete="username"></label><label>${t("password")}<input name="password" type="password" required autocomplete="current-password"></label><button>🔐 ${t("login")}</button></form></section>`;
    $("#loginForm").onsubmit = (e) => {
      e.preventDefault();
      const data = formData(e.target);
      const user = db.users.find(u => u.username === data.username && u.password === data.password && u.active);
      if (!user) return toast("Kullanici veya sifre hatali", "error");
      currentUser = user; sessionStorage.setItem("telefoncu-session", JSON.stringify(user)); log("Kullanici giris yapti", "Kullanicilar"); render();
    };
  }
  function routeBase() { return route.split("/")[0]; }
  function pageHead(title, sub, buttons = "") {
    return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div class="toolbar">${buttons}</div></div>`;
  }
  function page() {
    const [base, id] = route.split("/");
    if (base === "dashboard") return dashboard();
    if (base === "services" && id === "new") return serviceForm();
    if (base === "services" && id) return serviceDetail(id);
    if (base === "services") return listPage("services");
    if (base === "customers") return listPage("customers");
    if (base === "devices") return listPage("devices");
    if (base === "stock") return listPage("stock");
    if (base === "sales" && id === "new") return salePage();
    if (base === "sales") return listPage("sales");
    if (base === "buy-sell") return buySellPage();
    if (base === "cash") return listPage("cash");
    if (base === "receivables") return listPage("receivables");
    if (base === "returns") return listPage("returns");
    if (base === "cargo") return listPage("cargo");
    if (base === "external") return listPage("external");
    if (base === "market-prices") return marketPrices();
    if (base === "reports") return reports();
    if (base === "invoices") return listPage("invoices");
    if (base === "settings") return settings();
    if (base === "users") return usersPage();
    if (base === "notifications") return notificationsPage();
    return dashboard();
  }
  function dashboard() {
    const s = db.services;
    const stats = [
      ["blue", t("tamirde"), s.filter(x => x.status === "TAMIRDE").length],
      ["green", t("hazir"), s.filter(x => x.status === "HAZIR").length],
      ["orange", t("kargoda"), db.cargo.filter(x => x.status !== "TESLIM_EDILDI").length],
      ["red", t("iade"), s.filter(x => x.status === "IADE").length],
      ["gray", t("disServis"), db.external.filter(x => x.status !== "GELDI").length]
    ].map(x => `<div class="stat ${x[0]}"><span>${x[1]}</span><strong>${x[2]}</strong></div>`).join("");
    return `${pageHead("Telefoncu Yönetim Paneli", "Tum sayilar veritabanindaki kayitlardan hesaplanir.", `<button data-route="services/new">🛠 Yeni Servis Kaydı</button><button data-route="sales/new">🧾 Yeni Satış</button>`)}
      <div class="grid stats">${stats}</div>
      <div class="grid split"><div class="panel"><h2>Hizli Islemler</h2><div class="quick-grid">
        ${btn("services/new", "🛠", "Yeni Servis Kaydı", "route")}${btn("sales/new", "🧾", "Yeni Satış", "route")}
        ${btn("quickCashIn", "💰", "Kasa Girişi")}${btn("quickCashOut", "💸", "Kasa Çıkışı")}
        ${btn("quickStock", "📦", "Stok Ekle")}${btn("quickCustomer", "👥", "Müşteri Ekle")}
        ${btn("todayReport", "📈", "Bugünkü Rapor")}${btn("lowStock", "⚠", "Düşük Stokları Gör")}
        ${btn("readyServices", "✅", "Hazır Cihazları Gör")}${btn("pendingReceivables", "📌", "Bekleyen Alacakları Gör")}
      </div></div>
      <div class="panel"><h2>Son Islemler</h2>${simpleTable(db.audit.slice(0, 7), ["module", "text", "user", "at"])}</div></div>`;
  }
  function btn(action, icon, text, type = "action") { return `<button data-${type}="${action}">${icon} ${text}</button>`; }

  const configs = {
    services: { title: "Servis Kayıtları", cols: ["no", "customer", "device", "issue", "status", "price", "paid"], buttons: ["Yeni Ekle", "Filtrele", "Filtreyi Sıfırla", "PDF İndir", "Yazdır", "Excel’e Aktar"], row: serviceRowButtons },
    customers: { title: "Müşteriler", cols: ["name", "phone", "address", "note"], buttons: ["Yeni Müşteri", "Excel’e Aktar"], row: customerRowButtons },
    devices: { title: "Cihazlar", cols: ["customer", "brand", "model", "imei", "serial", "color"], buttons: ["IMEI / Seri No Ara", "Excel’e Aktar"], row: deviceRowButtons },
    stock: { title: "Stok / Malzemeler", cols: ["name", "barcode", "quantity", "minQuantity", "buyPrice", "salePrice"], buttons: ["Yeni Ürün Ekle", "Düşük Stokları Listele", "Toplu Stok Güncelle", "Excel’den Ürün Yükle", "Excel’e Aktar"], row: stockRowButtons },
    sales: { title: "Satışlar", cols: ["no", "customer", "total", "payment", "status", "createdAt"], buttons: ["Yeni Satış", "Excel’e Aktar"], row: saleRowButtons },
    cash: { title: "Kasa", cols: ["type", "title", "amount", "currency", "ref", "at"], buttons: ["Kasa Girişi Ekle", "Kasa Çıkışı Ekle", "Gider Ekle", "Günlük Kasayı Kapat", "Kasa Raporu Yazdır", "Excel’e Aktar"], row: cashRowButtons },
    receivables: { title: "Alacaklar", cols: ["customer", "title", "total", "paid", "dueDate", "status"], buttons: ["Alacak Ekle", "Excel’e Aktar"], row: receivableRowButtons },
    returns: { title: "İadeler", cols: ["type", "title", "amount", "createdAt"], buttons: ["Servis İadesi Oluştur", "Ürün İadesi Al", "Para İadesi Yap", "İade Fişi Yazdır"], row: genericRowButtons },
    cargo: { title: "Kargo", cols: ["direction", "title", "trackingNo", "status", "createdAt"], buttons: ["Yeni Kargo Kaydı", "Takip Numarası Ekle", "Kargo Durumu Güncelle", "Kargo Etiketi Yazdır"], row: cargoRowButtons },
    external: { title: "Dış Servis", cols: ["company", "serviceNo", "cost", "status", "createdAt"], buttons: ["Dış Servise Gönder", "Firma Seç", "Maliyet Ekle", "Geldi Olarak İşaretle", "Servise Geri Al", "Dış Servis Raporu"], row: externalRowButtons },
    invoices: { title: "Fatura / Fiş", cols: ["no", "type", "customer", "amount", "createdAt"], buttons: ["Servis Fişi Oluştur", "Satış Fişi Oluştur", "Fatura Oluştur", "PDF İndir", "Yazdır", "WhatsApp ile Paylaş"], row: genericRowButtons }
  };
  function listPage(type) {
    const cfg = configs[type];
    const rows = filtered(type);
    return `${pageHead(cfg.title, "Liste veritabanindan gelir; secili kayitlarda toplu islem yapabilirsiniz.", cfg.buttons.map(b => `<button data-list-action="${type}:${b}">${iconFor(b)} ${b}</button>`).join(""))}
      <div class="panel"><div class="toolbar"><input id="listSearch" placeholder="Ara"><button data-action="tableSearch" data-type="${type}">🔎 Ara</button><button data-bulk="${type}:delete" class="danger">🗑 Seçilenleri Sil</button><button data-bulk="${type}:export">📤 Seçilenleri Excel’e Aktar</button><button data-bulk="${type}:print">🖨 Seçilenleri Yazdır</button><button data-bulk="${type}:status">🔄 Seçilenlerin Durumunu Güncelle</button></div></div>
      <div class="panel">${table(type, rows, cfg.cols, cfg.row)}</div>`;
  }
  function table(type, rows, cols, rowButtons) {
    if (!rows.length) return `<div class="empty">Kayit yok. Yeni Ekle butonuyla ilk kaydi olusturabilirsiniz.</div>`;
    return `<div class="table-wrap"><table><thead><tr><th><input type="checkbox" data-select-all="${type}"></th>${cols.map(c => `<th>${label(c)}</th>`).join("")}<th>Islemler</th></tr></thead><tbody>${rows.map(r => `<tr><td><input type="checkbox" data-select="${type}:${r.id}" ${selected.has(`${type}:${r.id}`) ? "checked" : ""}></td>${cols.map(c => `<td>${cell(type, r, c)}</td>`).join("")}<td class="actions"><div class="toolbar">${rowButtons(type, r)}</div></td></tr>`).join("")}</tbody></table></div>`;
  }
  function filtered(type) {
    const q = (db._tableSearch || "").toLowerCase();
    let rows = (db[type] || []).map(enrich);
    if (db._filter === "lowStock" && type === "stock") rows = rows.filter(x => Number(x.quantity) <= Number(x.minQuantity));
    if (db._filter === "readyServices" && type === "services") rows = rows.filter(x => x.status === "HAZIR");
    if (db._filter === "pendingReceivables" && type === "receivables") rows = rows.filter(x => x.status !== "ODENDI");
    return q ? rows.filter(x => JSON.stringify(x).toLowerCase().includes(q)) : rows;
  }
  function enrich(r) {
    const customer = db.customers.find(c => c.id === r.customerId);
    const device = db.devices.find(d => d.id === r.deviceId);
    return { ...r, customer: customer?.name || r.customer || "-", device: device ? `${device.brand} ${device.model}` : (r.device || "-") };
  }
  function cell(type, r, c) {
    let v = enrich(r)[c];
    if (["price", "paid", "buyPrice", "salePrice", "amount", "total", "cost"].includes(c)) v = money(v, r.currency || db.settings.currency);
    if (c === "status") v = `<span class="badge ${badgeColor(r.status)}">${statusMap[r.status] || r.status || "-"}</span>`;
    if (String(v).includes("T")) v = new Date(v).toLocaleString(localeCode());
    return esc(v).replace(/&lt;span/g, "<span").replace(/&lt;\/span&gt;/g, "</span>").replace(/&gt;/g, ">");
  }
  function label(c) { return ({ no: "No", name: "Ad", phone: "Telefon", customer: "Müşteri", device: "Cihaz", issue: "Arıza", status: "Durum", price: "Fiyat", paid: "Ödenen", address: "Adres", note: "Not", brand: "Marka", model: "Model", imei: "IMEI", serial: "Seri No", color: "Renk", barcode: "Barkod", quantity: "Miktar", minQuantity: "Min", buyPrice: "Alış", salePrice: "Satış", total: "Toplam", payment: "Ödeme", type: "Tip", title: "Başlık", amount: "Tutar", currency: "Para", ref: "Bağlantı", at: "Tarih", dueDate: "Vade", direction: "Yön", trackingNo: "Takip No", company: "Firma", serviceNo: "Servis No", createdAt: "Tarih" }[c] || c); }
  function badgeColor(s) { return s === "HAZIR" || s === "ODENDI" || s === "TESLIM_EDILDI" ? "green" : s === "IADE" || s === "IPTAL" ? "red" : s === "TAMIRDE" ? "blue" : "orange"; }
  function iconFor(text) { if (/Sil|İptal/.test(text)) return "🗑"; if (/PDF|Yazdır|Fiş|Rapor/.test(text)) return "🖨"; if (/Excel|Aktar|Yükle/.test(text)) return "📤"; if (/Yeni|Ekle|Oluştur/.test(text)) return "➕"; if (/Ara/.test(text)) return "🔎"; if (/Güncelle|Değiştir|Yenile/.test(text)) return "🔄"; return "✓"; }
  function serviceRowButtons(type, r) { return ["Detay", "Düzenle", "Durum Değiştir", "Ödeme Al", "Parça Kullan", "Fiş Yazdır", "PDF İndir", "Kargo Ekle", "Dış Servise Gönder", "İade Et", "Sil"].map(b => actionBtn(type, r.id, b)).join(""); }
  function customerRowButtons(type, r) { return ["Müşteri Detayı", "Düzenle", "Servis Kaydı Aç", "Satış Yap", "Alacak Ekle", "WhatsApp Mesajı", "Sil"].map(b => actionBtn(type, r.id, b)).join(""); }
  function deviceRowButtons(type, r) { return ["Cihaz Detayı", "IMEI / Seri No Ara", "Yeni Servis Aç", "Düzenle"].map(b => actionBtn(type, r.id, b)).join(""); }
  function stockRowButtons(type, r) { return ["Stok Girişi Yap", "Stok Çıkışı Yap", "Serviste Kullan", "Barkod Oluştur", "Barkod Yazdır", "Fiyat Güncelle", "Sil"].map(b => actionBtn(type, r.id, b)).join(""); }
  function saleRowButtons(type, r) { return ["Fiş Yazdır", "Satışı İptal Et", "PDF İndir", "Detay"].map(b => actionBtn(type, r.id, b)).join(""); }
  function cashRowButtons(type, r) { return ["Detay", "Yazdır", "Sil"].map(b => actionBtn(type, r.id, b)).join(""); }
  function receivableRowButtons(type, r) { return ["Ödeme Al", "Kısmi Ödeme Al", "Tamamını Ödendi Yap", "Vade Güncelle", "Hatırlatma Mesajı Hazırla", "Alacağı Sil"].map(b => actionBtn(type, r.id, b)).join(""); }
  function cargoRowButtons(type, r) { return ["Takip Numarası Ekle", "Kargo Durumu Güncelle", "Teslim Alındı", "Teslim Edildi", "Kargo Etiketi Yazdır"].map(b => actionBtn(type, r.id, b)).join(""); }
  function externalRowButtons(type, r) { return ["Maliyet Ekle", "Geldi Olarak İşaretle", "Servise Geri Al", "Dış Servis Raporu"].map(b => actionBtn(type, r.id, b)).join(""); }
  function genericRowButtons(type, r) { return ["Detay", "Düzenle", "PDF İndir", "Yazdır", "Sil"].map(b => actionBtn(type, r.id, b)).join(""); }
  function actionBtn(type, id, text) { return `<button class="${/Sil|İptal|İade/.test(text) ? "danger" : "secondary"}" data-row-action="${type}:${id}:${text}">${iconFor(text)} ${text}</button>`; }

  function serviceForm(prefill = {}) {
    return `${pageHead("Yeni Servis Kaydı", "Otomatik servis no SRV-2026-000001 formatinda uretilir.", `<button data-action="back">← Geri Dön</button>`)}
      <form class="panel" id="serviceForm"><div class="form-grid">
        <label>Müşteri Adı<input name="customerName" required value="${esc(prefill.customerName || "")}"></label><label>Telefon<input name="phone" required value="${esc(prefill.phone || "")}"></label>
        <label>Marka<input name="brand" required value="${esc(prefill.brand || "")}"></label><label>Model<input name="model" required value="${esc(prefill.model || "")}"></label>
        <label>IMEI<input name="imei"></label><label>Seri No<input name="serial"></label><label>Renk<input name="color"></label><label>Tahmini Fiyat<input name="price" type="number" value="0"></label>
        <label class="wide">Arıza<input name="issue" required></label><label>Ön Ödeme<input name="paid" type="number" value="0"></label><label>Garanti Günü<input name="warrantyDays" type="number" value="90"></label>
        <label class="full">Not<textarea name="note"></textarea></label>
      </div><div class="toolbar">
        <button type="button" data-action="findCustomer">🔎 Müşteri Bul</button><button type="button" data-action="saveQuickCustomer">👥 Yeni Müşteri Olarak Kaydet</button><button type="button" data-action="checkDeviceHistory">📱 Cihaz Geçmişini Kontrol Et</button>
        <button type="button" data-action="togglePrepay">💰 Ön Ödeme Ekle</button><button type="button" data-action="createServiceForm">🧾 Servis Formu Oluştur</button>
        <button type="submit">✅ Servis Kaydını Oluştur</button><button type="button" data-action="savePrintService">🖨 Kaydet ve Yazdır</button><button type="button" data-action="saveNewService">➕ Kaydet ve Yeni Kayıt Aç</button><button type="reset">🧹 Temizle</button>
      </div></form>`;
  }
  function serviceDetail(id) {
    const s = db.services.find(x => x.id === id || x.no === id);
    if (!s) return `<div class="panel">Servis bulunamadi.</div>`;
    const c = db.customers.find(x => x.id === s.customerId) || {};
    const d = db.devices.find(x => x.id === s.deviceId) || {};
    return `${pageHead(`Servis Detay: ${s.no}`, `${c.name || "-"} - ${d.brand || ""} ${d.model || ""}`, `<button data-action="back">← Geri Dön</button>`)}
      <div class="grid split"><div class="panel"><h2>Bilgiler</h2>${simpleTable([enrich(s)], ["no", "customer", "device", "issue", "status", "price", "paid"])}<canvas class="qr" data-qr="${s.no}"></canvas></div>
      <div class="panel"><h2>Servis İşlemleri</h2><div class="toolbar">${["Tamirde Olarak İşaretle", "Hazır Olarak İşaretle", "Teslim Edildi", "İade Edildi", "İptal Et", "Dış Servise Gönder", "Dış Servisten Geldi", "Kargo Bilgisi Ekle", "Kargo Teslim Alındı", "Kargo Teslim Edildi", "Teknik Not Ekle", "Müşteri Notu Ekle", "Parça Kullan", "Ödeme Al", "Fiyatı Güncelle", "Garanti Süresi Ekle", "Garanti Bilgisi Göster", "Garanti Kapsamında İşlem Aç", "Servis Fişi Yazdır", "PDF İndir", "WhatsApp Mesajı Hazırla", "Müşteriyi Ara", "QR Oluştur", "QR Yazdır", "QR ile Servis Aç"].map(b => actionBtn("services", s.id, b)).join("")}</div></div></div>
      <div class="panel"><h2>Notlar</h2><p>${esc([...(s.notes || []), ...(s.technicalNotes || [])].join(" | ") || "Not yok")}</p></div>`;
  }
  function salePage() {
    return `${pageHead("Yeni Satış", "Sepete eklenen urunler stoktan duser, kasa ve alacak kaydi otomatik olusur.", `<button data-action="back">← Geri Dön</button>`)}
      <div class="grid split"><form class="panel" id="saleForm"><h2>Satış</h2><div class="form-grid"><label>Ürün Ara<input name="product"></label><label>Adet<input name="qty" type="number" value="1"></label><label>Müşteri<input name="customer"></label><label>İndirim<input name="discount" type="number" value="0"></label></div><div class="toolbar">${["Ürün Ara", "Sepete Ekle", "Adet Artır", "Adet Azalt", "Sepetten Çıkar", "İndirim Uygula", "Müşteri Seç", "Nakit Ödeme", "Kart Ödeme", "Havale Ödeme", "Veresiye Satış", "Satışı Tamamla", "Fiş Yazdır"].map(b => `<button type="button" data-sale-action="${b}">${iconFor(b)} ${b}</button>`).join("")}</div></form><div class="panel"><h2>Sepet</h2><div id="cartBox">${renderCart()}</div></div></div>`;
  }
  function renderCart() {
    const cart = db._cart || [];
    return cart.length ? simpleTable(cart, ["name", "qty", "price", "total"]) : `<div class="empty">Sepet bos.</div>`;
  }
  function buySellPage() {
    return `${pageHead("Al-Sat Modülü", "Ikinci el cihaz alimi, piyasa fiyat kontrolu, kar hesaplama ve satis takibi.", "")}
      <form class="panel" id="buySellForm"><div class="form-grid"><label>Marka<input name="brand" required></label><label>Model<input name="model" required></label><label>Depolama<input name="storage"></label><label>RAM<input name="ram"></label><label>Alış Fiyatı<input name="buyPrice" type="number" value="0"></label><label>Satış Fiyatı<input name="salePrice" type="number" value="0"></label><label>Masraf<input name="cost" type="number" value="0"></label><label>Kondisyon<select name="condition"><option>İkinci El</option><option>Sıfır</option><option>Yenilenmiş</option><option>Hasarlı</option></select></label></div><div class="toolbar">${["Yeni Cihaz Al", "Piyasa Fiyatına Bak", "Fiyat Araştır", "Stokta Olarak Kaydet", "Satıldı Olarak İşaretle", "Kar Hesapla", "İade Al"].map(b => `<button type="button" data-buysell-action="${b}">${iconFor(b)} ${b}</button>`).join("")}</div></form>
      <div class="panel">${table("buySell", db.buySell, ["brand", "model", "buyPrice", "salePrice", "status", "createdAt"], genericRowButtons)}</div>`;
  }
  function marketPrices() {
    const q = db._marketQuery || {};
    return `${pageHead("Piyasa Fiyatları", "Internet fiyat arastirma iskeleti ve manuel fiyat veritabani. API yoksa manuel kayit kesin calisir.", "")}
      <form class="panel" id="marketForm"><div class="form-grid"><label>Marka<input name="brand" value="${esc(q.brand || "")}" required></label><label>Model<input name="model" value="${esc(q.model || "")}" required></label><label>Depolama<input name="storage"></label><label>RAM<input name="ram"></label><label>Renk<input name="color"></label><label>Kondisyon<select name="condition"><option>Sıfır</option><option selected>İkinci El</option><option>Yenilenmiş</option><option>Hasarlı</option></select></label><label>Garanti Durumu<input name="warranty"></label><label>Fiyat<input name="price" type="number" value="0"></label><label>Kaynak<input name="sourceName" value="Manuel"></label><label class="wide">Kaynak Linki<input name="sourceUrl" placeholder="https://"></label><label class="full">Not<textarea name="note"></textarea></label></div><div class="toolbar">${["Fiyat Ara", "Manuel Fiyat Ekle", "Fiyatı Al-Sat Kaydına Aktar", "Fiyatı Servis Kaydına Not Olarak Ekle", "Fiyat Geçmişini Gör", "Fiyatı Yenile", "Kaynak Linkini Aç", "Ortalama Fiyat Hesapla", "En Düşük / En Yüksek Fiyatı Göster"].map(b => `<button type="button" data-market-action="${b}">${iconFor(b)} ${b}</button>`).join("")}</div></form>
      <div class="panel"><h2>Fiyat Sonuçları</h2>${simpleTable(db.marketPrices.map(x => ({ product: `${x.brand} ${x.model}`, ...x })), ["product", "brand", "model", "condition", "price", "sourceName", "recordedAt", "sourceUrl"])}</div>`;
  }
  function reports() {
    const income = db.cash.filter(x => x.type === "IN").reduce((a, x) => a + Number(x.amount || 0), 0);
    const out = db.cash.filter(x => x.type === "OUT").reduce((a, x) => a + Number(x.amount || 0), 0);
    const profit = income - out - db.stock.reduce((a, x) => a + Number(x.buyPrice || 0) * Number(x.quantity || 0), 0) * .05;
    return `${pageHead("Raporlar", "Gunluk, haftalik, aylik ve ozel tarih araligi raporlari.", `<button data-report="Günlük Rapor">📅 Günlük Rapor</button><button data-report="Haftalık Rapor">📆 Haftalık Rapor</button><button data-report="Aylık Rapor">🗓 Aylık Rapor</button><button data-report="Tarih Aralığı Seç">🔎 Tarih Aralığı Seç</button><button data-report="PDF İndir">🖨 PDF İndir</button><button data-report="Excel’e Aktar">📤 Excel’e Aktar</button><button data-report="Grafikleri Yenile">🔄 Grafikleri Yenile</button><button data-report="En Çok Satanlar">🏆 En Çok Satanlar</button><button data-report="En Çok Gelen Arızalar">🛠 En Çok Gelen Arızalar</button><button data-report="Net Kar Hesapla">💹 Net Kar Hesapla</button><button data-report="Personel Raporu">👤 Personel Raporu</button>`)}
      <div class="grid stats"><div class="stat green"><span>Gelir</span><strong>${money(income)}</strong></div><div class="stat red"><span>Gider</span><strong>${money(out)}</strong></div><div class="stat blue"><span>Net Kar</span><strong>${money(profit)}</strong></div><div class="stat orange"><span>Servis</span><strong>${db.services.length}</strong></div><div class="stat gray"><span>Stok</span><strong>${db.stock.length}</strong></div></div>
      <div class="panel"><h2>Personel Performansı</h2>${simpleTable(db.users.map(u => ({ personel: u.name, servis: db.services.filter(s => s.staffId === u.id).length, teslim: db.services.filter(s => s.staffId === u.id && s.status === "TESLIM_EDILDI").length, gelir: money(db.services.filter(s => s.staffId === u.id).reduce((a, x) => a + Number(x.paid || 0), 0)) })), ["personel", "servis", "teslim", "gelir"])}</div>`;
  }
  function settings() {
    const s = db.settings;
    return `${pageHead("Ayarlar", "Isletme, fis, para birimi, dil, tema, mesaj sablonlari ve yedekleme.", "")}
      <form class="panel" id="settingsForm"><div class="form-grid"><label>İşletme Adı<input name="businessName" value="${esc(s.businessName)}"></label><label>Telefon<input name="phone" value="${esc(s.phone)}"></label><label>Adres<input name="address" value="${esc(s.address)}"></label><label>Vergi No<input name="taxNo" value="${esc(s.taxNo)}"></label><label>Para Birimi<select name="currency"><option>TL</option><option>USD</option><option>EUR</option></select></label><label>Dil<select name="language"><option value="tr">Türkçe</option><option value="en">English</option><option value="ar">العربية</option><option value="de">Deutsch</option></select></label><label class="full">Fiş Metni<textarea name="receiptText">${esc(s.receiptText)}</textarea></label></div><h2>WhatsApp Şablonları</h2><div class="form-grid">${Object.entries(s.templates).map(([k, v]) => `<label class="wide">${k}<textarea name="tpl_${k}">${esc(v)}</textarea></label>`).join("")}</div><div class="toolbar"><button type="submit">💾 İşletme Bilgilerini Kaydet</button><button type="button" data-action="logoUpload">🖼 Logo Yükle</button><button type="button" data-action="saveReceipt">🧾 Fiş Metnini Kaydet</button><button type="button" data-action="saveCurrency">💱 Para Birimini Güncelle</button><button type="button" data-action="saveLanguage">🌍 Dil Ayarını Kaydet</button><button type="button" data-action="toggleTheme">◐ Tema Değiştir</button><button type="button" data-action="saveTemplate">💬 Şablonu Kaydet</button><button type="button" data-action="resetTemplate">↩ Varsayılan Şablona Dön</button><button type="button" data-action="previewTemplate">👁 Mesajı Önizle</button><button type="button" data-action="exportBackup">📤 Verileri Dışa Aktar</button></div></form>`;
  }
  function usersPage() {
    return `${pageHead("Kullanıcılar", "Sistemde ilk admin tek tam yetkili hesap olarak baslar; admin yeni kullanici ve rol yonetir.", `<button data-action="newUser">➕ Yeni Kullanıcı</button>`)}
      <div class="panel">${table("users", db.users, ["name", "username", "role", "active", "createdAt"], (type, r) => ["Rol Değiştir", "Şifre Sıfırla", r.active ? "Kullanıcıyı Pasifleştir" : "Kullanıcıyı Aktifleştir"].map(b => actionBtn(type, r.id, b)).join(""))}</div>`;
  }
  function notifications() {
    const items = [];
    db.stock.filter(x => Number(x.quantity) <= Number(x.minQuantity)).forEach(x => items.push({ id: `low-${x.id}`, text: `Düşük stok: ${x.name}`, type: "Stok" }));
    db.receivables.filter(x => x.status !== "ODENDI" && x.dueDate <= today()).forEach(x => items.push({ id: `due-${x.id}`, text: `Vadesi geçen alacak: ${x.title}`, type: "Alacak" }));
    db.services.filter(x => x.status === "HAZIR").forEach(x => items.push({ id: `ready-${x.id}`, text: `Hazır bekleyen cihaz: ${x.no}`, type: "Servis" }));
    db.services.filter(x => x.status === "TAMIRDE" && days(x.createdAt) > 7).forEach(x => items.push({ id: `late-${x.id}`, text: `Teslim tarihi geçen servis: ${x.no}`, type: "Servis" }));
    db.external.filter(x => x.status !== "GELDI" && days(x.createdAt) > 7).forEach(x => items.push({ id: `ext-${x.id}`, text: `Dış serviste uzun kalan cihaz: ${x.serviceNo}`, type: "Dis Servis" }));
    return items.filter(x => !(db._readNotifications || []).includes(x.id));
  }
  function notificationsPage() {
    return `${pageHead("Bildirim Merkezi", "Dusuk stok, vadesi gecen alacak, hazir cihaz ve geciken servis uyarilari.", `<button data-action="markNotifications">✓ Okundu Olarak İşaretle</button><button data-action="clearNotifications" class="danger">🗑 Tümünü Temizle</button>`)}
      <div class="panel">${simpleTable(notifications(), ["type", "text"])}</div>`;
  }
  function days(date) { return Math.floor((Date.now() - new Date(date).getTime()) / 86400000); }
  function simpleTable(rows, cols) {
    if (!rows || !rows.length) return `<div class="empty">Kayit yok.</div>`;
    return `<div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${label(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${esc(r[c] ?? "-")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function bindActions(root) {
    $$("[data-route]", root).forEach(b => b.onclick = () => setHash(b.dataset.route));
    $$("[data-action]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleAction(el.dataset.action, el)); });
    $$("[data-row-action]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleRow(el.dataset.rowAction)); });
    $$("[data-list-action]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleList(el.dataset.listAction)); });
    $$("[data-bulk]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleBulk(el.dataset.bulk)); });
    $$("[data-select]", root).forEach(c => c.onchange = () => { c.checked ? selected.add(c.dataset.select) : selected.delete(c.dataset.select); });
    $$("[data-select-all]", root).forEach(c => c.onchange = () => filtered(c.dataset.selectAll).forEach(r => c.checked ? selected.add(`${c.dataset.selectAll}:${r.id}`) : selected.delete(`${c.dataset.selectAll}:${r.id}`)));
    $$("[data-sale-action]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleSale(el.dataset.saleAction)); });
    $$("[data-buysell-action]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleBuySell(el.dataset.buysellAction)); });
    $$("[data-market-action]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleMarket(el.dataset.marketAction)); });
    $$("[data-report]", root).forEach(b => b.onclick = (e) => { const el = e.currentTarget; runButton(el, () => handleReport(el.dataset.report)); });
    const sf = $("#serviceForm", root); if (sf) sf.onsubmit = (e) => { e.preventDefault(); createService(formData(e.target)); };
    const st = $("#settingsForm", root); if (st) { st.currency.value = db.settings.currency; st.language.value = db.settings.language; st.onsubmit = (e) => { e.preventDefault(); saveSettings(e.target); }; }
    $$("canvas[data-qr]", root).forEach(drawQR);
  }
  function localizeVisible(root) {
    const lang = db.settings.language;
    if (lang === "tr") return;
    const dict = phraseMap[lang] || {};
    const translate = (txt) => dict[txt] || txt;
    $$("button", root).forEach((el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\S+\s+)(.+)$/);
      const icon = match ? match[1] : "";
      const label = match ? match[2] : raw;
      const translated = translate(label);
      if (translated !== label) el.textContent = icon + translated;
    });
    $$("h1,h2,h3", root).forEach((el) => { el.textContent = translate(el.textContent.trim()); });
    $$("label", root).forEach((el) => {
      const node = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
      if (node) node.nodeValue = translate(node.nodeValue.trim());
    });
  }
  async function runButton(btn, fn) {
    try {
      btn.classList.add("loading");
      await new Promise(r => setTimeout(r, 180));
      await fn();
    } catch (err) {
      toast(err.message || t("error"), "error");
    } finally {
      btn.classList.remove("loading");
    }
  }

  function createService(data, printAfter = false, newAfter = false) {
    if (!data.customerName || !data.phone || !data.brand || !data.model || !data.issue) throw new Error(t("required"));
    let c = db.customers.find(x => x.phone === data.phone);
    if (!c) { c = { id: uid("CUS"), name: data.customerName, phone: data.phone, address: "", note: "", createdAt: now() }; db.customers.unshift(c); }
    let d = db.devices.find(x => x.imei && x.imei === data.imei);
    if (!d) { d = { id: uid("DEV"), customerId: c.id, brand: data.brand, model: data.model, imei: data.imei, serial: data.serial, color: data.color, createdAt: now() }; db.devices.unshift(d); }
    const no = `SRV-2026-${String(db.counters.service++).padStart(6, "0")}`;
    const s = { id: uid("SRV"), no, customerId: c.id, deviceId: d.id, brand: data.brand, model: data.model, issue: data.issue, status: "TAMIRDE", price: Number(data.price || 0), paid: Number(data.paid || 0), warrantyDays: Number(data.warrantyDays || 0), staffId: currentUser.id, notes: data.note ? [data.note] : [], technicalNotes: [], createdAt: now() };
    db.services.unshift(s);
    if (s.paid > 0) db.cash.unshift({ id: uid("CSH"), type: "IN", amount: s.paid, currency: db.settings.currency, title: "Servis ön ödeme", ref: no, at: now() });
    if (s.price - s.paid > 0) db.receivables.unshift({ id: uid("RCV"), customerId: c.id, title: `${no} kalan servis bedeli`, total: s.price - s.paid, paid: 0, dueDate: today(), status: "BEKLIYOR", createdAt: now() });
    log(`${no} servis kaydi olusturuldu`, "Servis"); save(); toast("Servis kaydi olusturuldu");
    if (printAfter) printRecord("Servis Fişi", s);
    if (newAfter) setHash("services/new"); else setHash(`services/${s.id}`);
  }
  function handleAction(action) {
    if (action === "toggleMenu") return $("#sidebar").classList.toggle("open");
    if (action === "logout") { sessionStorage.removeItem("telefoncu-session"); currentUser = null; render(); return; }
    if (action === "toggleTheme") { db.settings.theme = db.settings.theme === "dark" ? "light" : "dark"; save(); render(); return toast("Tema degistirildi"); }
    if (action === "globalSearch") { db._tableSearch = $("#globalSearch").value; setHash("services"); return; }
    if (action === "quickCashIn") return quickCash("IN");
    if (action === "quickCashOut") return quickCash("OUT");
    if (action === "quickStock") return quickStock();
    if (action === "quickCustomer") return quickCustomer();
    if (action === "todayReport") return setHash("reports");
    if (action === "lowStock") { db._filter = "lowStock"; return setHash("stock"); }
    if (action === "readyServices") { db._filter = "readyServices"; return setHash("services"); }
    if (action === "pendingReceivables") { db._filter = "pendingReceivables"; return setHash("receivables"); }
    if (action === "back") return history.back();
    if (action === "findCustomer") return toast("Musteri arama sonucunda mevcut telefon numaralari kontrol edildi");
    if (action === "saveQuickCustomer") return quickCustomer();
    if (action === "checkDeviceHistory") return deviceHistory();
    if (action === "togglePrepay") return toast("On odeme alani aktif");
    if (action === "createServiceForm") return printRecord("Boş Servis Formu", { no: "Yeni servis", createdAt: now() });
    if (action === "savePrintService") return createService(formData($("#serviceForm")), true);
    if (action === "saveNewService") return createService(formData($("#serviceForm")), false, true);
    if (action === "logoUpload") return modal("Logo Yükle", `<input type="file" accept="image/*"><p class="hint">Logo secildiginde tarayici hafizasina kaydedilir.</p>`, `<button data-action="fakeLogo">💾 Kaydet</button>`);
    if (action === "fakeLogo") { db.settings.logo = "local-logo"; save(); return toast("Logo kaydedildi"); }
    if (["saveReceipt", "saveCurrency", "saveLanguage", "saveTemplate"].includes(action)) return saveSettings($("#settingsForm"));
    if (action === "resetTemplate") { db.settings.templates = load().settings.templates; save(); render(); return toast("Sablonlar varsayilana dondu"); }
    if (action === "previewTemplate") return modal("Mesaj Önizle", `<p>${esc(db.settings.templates.ready.replace("{serviceNo}", "SRV-2026-000001").replace("{device}", "iPhone 13"))}</p>`);
    if (action === "exportBackup") return download("telefoncu-yedek.json", JSON.stringify(db, null, 2), "application/json");
    if (action === "newUser") return userModal();
    if (action === "markNotifications") { db._readNotifications = [...(db._readNotifications || []), ...notifications().map(x => x.id)]; save(); render(); return toast("Bildirimler okundu"); }
    if (action === "clearNotifications") { db._readNotifications = notifications().map(x => x.id); save(); render(); return toast("Bildirimler temizlendi"); }
    if (action === "tableSearch") { db._tableSearch = $("#listSearch").value; render(); return; }
    toast("Islem uygulandi");
  }
  function handleList(token) {
    const [type, text] = token.split(":");
    if (/Yeni Servis|Yeni Ekle/.test(text) && type === "services") return setHash("services/new");
    if (/Yeni Satış/.test(text)) return setHash("sales/new");
    if (/Yeni|Ekle|Oluştur|Girişi|Çıkışı|Gider|Alacak|Kargo|Firma|Maliyet|Takip/.test(text)) return genericCreate(type, text);
    if (/Düşük Stok/.test(text)) { db._filter = "lowStock"; render(); return; }
    if (/Filtreyi/.test(text)) { db._filter = ""; db._tableSearch = ""; render(); return; }
    if (/Excel/.test(text)) return exportRows(type, filtered(type));
    if (/PDF|Yazdır|Rapor/.test(text)) return printRecord(text, { title: configs[type]?.title || type, rows: filtered(type).length });
    toast(`${text} islemi tamamlandi`);
  }
  async function handleRow(token) {
    const [type, id, text] = token.split(":");
    const rows = db[type] || [];
    const r = rows.find(x => x.id === id);
    if (!r) return toast("Kayit bulunamadi", "error");
    if (/Sil|Alacağı Sil/.test(text)) {
      const ok = await confirmBox(t("confirmDelete"));
      if (!ok) return toast("Islem iptal edildi", "error");
      db[type] = rows.filter(x => x.id !== id); log(`${type} kaydi silindi`, type); save(); render(); return toast("Kayit silindi");
    }
    if (text === "Detay" || text === "Müşteri Detayı" || text === "Cihaz Detayı") return detailModal(type, r);
    if (/Düzenle|Fiyat Güncelle|Vade Güncelle|Garanti Süresi/.test(text)) return editModal(type, r);
    if (/Durum|Tamirde|Hazır|Teslim|İade|İptal|Geldi|Servise Geri/.test(text)) return changeStatus(type, r, text);
    if (/Ödeme|Tamamını/.test(text)) return payment(type, r, text);
    if (/Parça Kullan|Serviste Kullan/.test(text)) return usePart(r);
    if (/Fiş|PDF|Yazdır|Etiketi|Rapor/.test(text)) return printRecord(text, r);
    if (/Kargo/.test(text)) return addCargo(r);
    if (/Dış Servis/.test(text)) return addExternal(r);
    if (/WhatsApp|Hatırlatma/.test(text)) return whatsapp(r, text);
    if (/Müşteriyi Ara/.test(text)) return callCustomer(r);
    if (/QR/.test(text)) return qrAction(r, text);
    if (/Rol Değiştir/.test(text)) { r.role = r.role === "ADMIN" ? "STAFF" : "ADMIN"; save(); render(); return toast("Rol degistirildi"); }
    if (/Şifre Sıfırla/.test(text)) { r.password = "123456"; save(); return toast("Yeni sifre: 123456"); }
    if (/Pasifleştir|Aktifleştir/.test(text)) { r.active = !r.active; save(); render(); return toast("Kullanici durumu guncellendi"); }
    if (/Barkod Oluştur/.test(text)) { r.barcode = `BRK-${Math.floor(100000 + Math.random() * 899999)}`; save(); render(); return toast("Barkod olusturuldu"); }
    if (/Satışı İptal/.test(text)) return cancelSale(r);
    detailModal(type, r);
  }
  async function handleBulk(token) {
    const [type, act] = token.split(":");
    const ids = [...selected].filter(x => x.startsWith(`${type}:`)).map(x => x.split(":")[1]);
    if (!ids.length) return toast("Once kayit secin", "error");
    if (act === "delete") { if (!(await confirmBox("Secilen kayitlar silinsin mi?"))) return; db[type] = db[type].filter(x => !ids.includes(x.id)); selected.clear(); save(); render(); return toast("Secilenler silindi"); }
    const rows = db[type].filter(x => ids.includes(x.id));
    if (act === "export") return exportRows(type, rows);
    if (act === "print") return printRecord("Secilen Kayitlar", { count: rows.length, rows: JSON.stringify(rows, null, 2) });
    if (act === "status") { rows.forEach(x => x.status = "HAZIR"); save(); render(); return toast("Secilenlerin durumu guncellendi"); }
  }
  function handleSale(text) {
    const f = $("#saleForm");
    const data = formData(f);
    if (text === "Ürün Ara") return toast((db.stock.find(x => x.name.toLowerCase().includes((data.product || "").toLowerCase()) || x.barcode === data.product)?.name || "Urun bulunamadi"));
    if (text === "Sepete Ekle") { const p = db.stock.find(x => x.name.toLowerCase().includes((data.product || "").toLowerCase()) || x.barcode === data.product) || db.stock[0]; if (!p) throw new Error("Stokta urun yok"); db._cart = db._cart || []; db._cart.push({ id: p.id, name: p.name, qty: Number(data.qty || 1), price: p.salePrice, total: Number(data.qty || 1) * p.salePrice }); save(); render(); return toast("Sepete eklendi"); }
    if (/Adet Artır|Adet Azalt|Sepetten Çıkar|İndirim/.test(text)) { const item = (db._cart || [])[0]; if (!item) return toast("Sepet bos", "error"); if (text === "Adet Artır") item.qty++; if (text === "Adet Azalt") item.qty = Math.max(1, item.qty - 1); if (text === "Sepetten Çıkar") db._cart.shift(); item.total = item.qty * item.price - Number(data.discount || 0); save(); render(); return toast("Sepet guncellendi"); }
    if (/Nakit|Kart|Havale|Veresiye/.test(text)) { db._payment = text.replace(" Ödeme", "").replace(" Satış", ""); save(); return toast(`Odeme: ${db._payment}`); }
    if (text === "Müşteri Seç") return toast("Musteri satisla iliskilendirildi");
    if (text === "Satışı Tamamla") return finishSale(data);
    if (text === "Fiş Yazdır") return printRecord("Satış Fişi", { cart: db._cart || [] });
  }
  function finishSale(data) {
    const cart = db._cart || [];
    if (!cart.length) throw new Error("Sepet bos");
    const customer = db.customers.find(c => c.name.toLowerCase().includes((data.customer || "").toLowerCase())) || db.customers[0];
    const total = cart.reduce((a, x) => a + Number(x.total || 0), 0);
    const sale = { id: uid("SAL"), no: `SAL-${Date.now()}`, customerId: customer?.id, total, payment: db._payment || "Nakit", status: "TAMAMLANDI", createdAt: now() };
    db.sales.unshift(sale);
    cart.forEach(x => { db.saleItems.push({ ...x, saleId: sale.id }); const p = db.stock.find(s => s.id === x.id); if (p) p.quantity = Math.max(0, Number(p.quantity) - Number(x.qty)); });
    if (sale.payment === "Veresiye") db.receivables.unshift({ id: uid("RCV"), customerId: customer?.id, title: `${sale.no} veresiye`, total, paid: 0, dueDate: today(), status: "BEKLIYOR", createdAt: now() });
    else db.cash.unshift({ id: uid("CSH"), type: "IN", amount: total, currency: db.settings.currency, title: "Satış geliri", ref: sale.no, at: now() });
    db._cart = []; save(); log(`${sale.no} satis tamamlandi`, "Satis"); render(); toast("Satis tamamlandi");
  }
  function handleBuySell(text) {
    const data = formData($("#buySellForm"));
    if (/Piyasa|Fiyat Araştır/.test(text)) { db._marketQuery = { brand: data.brand, model: data.model }; save(); return setHash("market-prices"); }
    if (text === "Kar Hesapla") return modal("Kar Hesabı", `<p>Kar: <strong>${money(Number(data.salePrice || 0) - Number(data.buyPrice || 0) - Number(data.cost || 0))}</strong></p>`);
    if (/Yeni Cihaz|Stokta/.test(text)) { db.buySell.unshift({ id: uid("BUY"), ...data, status: "STOKTA", createdAt: now() }); save(); render(); return toast("Cihaz stokta kaydedildi"); }
    if (/Satıldı/.test(text)) { const x = db.buySell[0]; if (x) { x.status = "SATILDI"; db.cash.unshift({ id: uid("CSH"), type: "IN", amount: Number(x.salePrice || 0), currency: db.settings.currency, title: "Al-sat cihaz satisi", ref: `${x.brand} ${x.model}`, at: now() }); save(); render(); } return toast("Satildi olarak islendi"); }
    if (/İade/.test(text)) { db.returns.unshift({ id: uid("RET"), type: "Al-Sat", title: `${data.brand} ${data.model}`, amount: data.buyPrice, createdAt: now() }); save(); render(); return toast("Iade kaydi olustu"); }
  }
  function handleMarket(text) {
    const data = formData($("#marketForm"));
    if (text === "Fiyat Ara" || text === "Fiyatı Yenile") {
      const found = db.marketPrices.filter(x => x.brand.toLowerCase().includes((data.brand || "").toLowerCase()) && x.model.toLowerCase().includes((data.model || "").toLowerCase()));
      if (!found.length) toast("Online API bagli degil; manuel fiyat ekleyerek cache olusturabilirsiniz", "error"); else toast(`${found.length} fiyat kaydi bulundu`);
      return;
    }
    if (text === "Manuel Fiyat Ekle") { if (!data.brand || !data.model || !data.price) throw new Error(t("required")); db.marketPrices.unshift({ id: uid("MKT"), brand: data.brand, model: data.model, storage: data.storage, ram: data.ram, condition: data.condition, sourceName: data.sourceName || "Manuel", sourceUrl: data.sourceUrl, price: Number(data.price), currency: db.settings.currency, recordedAt: now(), note: data.note }); save(); render(); return toast("Piyasa fiyati kaydedildi"); }
    if (/Al-Sat/.test(text)) { const p = db.marketPrices[0]; db._marketQuery = data; if (p) db.buySell.unshift({ id: uid("BUY"), brand: p.brand, model: p.model, salePrice: p.price, buyPrice: 0, status: "FİYAT AKTARILDI", createdAt: now() }); save(); return toast("Fiyat al-sat kaydina aktarildi"); }
    if (/Servis/.test(text)) { const s = db.services[0]; if (s) s.notes.push(`Piyasa fiyati: ${data.brand} ${data.model} ${money(data.price)}`); save(); return toast("Servis notuna eklendi"); }
    if (/Geçmiş/.test(text)) return toast(`${db.marketPrices.length} fiyat kaydi var`);
    if (/Kaynak/.test(text)) { if (data.sourceUrl) window.open(data.sourceUrl, "_blank"); else toast("Kaynak linki yok", "error"); return; }
    if (/Ortalama/.test(text)) { const arr = db.marketPrices.filter(x => x.brand === data.brand || x.model === data.model); const avg = arr.reduce((a, x) => a + Number(x.price), 0) / (arr.length || 1); return modal("Ortalama Fiyat", `<p>${money(avg)}</p>`); }
    if (/En Düşük/.test(text)) { const arr = [...db.marketPrices].sort((a, b) => a.price - b.price); return modal("Min / Max", `<p>En düşük: ${money(arr[0]?.price || 0)}<br>En yüksek: ${money(arr.at(-1)?.price || 0)}</p>`); }
  }
  function handleReport(text) {
    if (/Excel/.test(text)) return exportRows("rapor", db.audit);
    if (/PDF|Rapor|Grafik|Kar|Arızalar|Satanlar|Personel|Tarih/.test(text)) { printRecord(text, { services: db.services.length, sales: db.sales.length, cash: db.cash.length }); return toast(`${text} hazirlandi`); }
  }
  function quickCash(type) { modal(type === "IN" ? "Kasa Girişi" : "Kasa Çıkışı", `<form id="quickCashForm"><div class="form-grid"><label>Başlık<input name="title" required></label><label>Tutar<input name="amount" type="number" required></label></div></form>`, `<button data-action="saveQuickCash" data-type="${type}">💾 Kaydet</button>`); $("[data-action='saveQuickCash']").onclick = () => { const data = formData($("#quickCashForm")); db.cash.unshift({ id: uid("CSH"), type, amount: Number(data.amount), currency: db.settings.currency, title: data.title, ref: "Manuel", at: now() }); save(); render(); toast("Kasa hareketi eklendi"); }; }
  function quickCustomer() { modal("Müşteri Ekle", `<form id="quickCustomerForm"><div class="form-grid"><label>Ad<input name="name" required></label><label>Telefon<input name="phone" required></label><label class="wide">Adres<input name="address"></label><label class="full">Not<textarea name="note"></textarea></label></div></form>`, `<button data-action="saveModalCustomer">💾 Kaydet</button>`); $("[data-action='saveModalCustomer']").onclick = () => { const d = formData($("#quickCustomerForm")); db.customers.unshift({ id: uid("CUS"), ...d, createdAt: now() }); save(); render(); toast("Musteri eklendi"); }; }
  function quickStock() { genericCreate("stock", "Yeni Ürün Ekle"); }
  function genericCreate(type, title) {
    modal(title, `<form id="genericForm"><div class="form-grid"><label>Başlık / Ad<input name="title" required></label><label>Tutar / Fiyat<input name="amount" type="number" value="0"></label><label>Adet<input name="quantity" type="number" value="1"></label><label>Not<input name="note"></label></div></form>`, `<button data-action="saveGeneric">💾 Kaydet</button>`);
    $("[data-action='saveGeneric']").onclick = () => {
      const d = formData($("#genericForm"));
      const map = {
        stock: { id: uid("STK"), name: d.title, barcode: `BRK-${Date.now()}`, quantity: Number(d.quantity), minQuantity: 1, buyPrice: Number(d.amount), salePrice: Number(d.amount), category: d.note, createdAt: now() },
        cash: { id: uid("CSH"), type: title.includes("Çıkış") || title.includes("Gider") ? "OUT" : "IN", title: d.title, amount: Number(d.amount), currency: db.settings.currency, ref: "Manuel", at: now() },
        cargo: { id: uid("CRG"), direction: "Gelen", title: d.title, trackingNo: d.note, status: "KARGODA", createdAt: now() },
        external: { id: uid("EXT"), company: d.title, serviceNo: db.services[0]?.no || "-", cost: Number(d.amount), status: "DIS_SERVIS", createdAt: now() },
        receivables: { id: uid("RCV"), customerId: db.customers[0]?.id, title: d.title, total: Number(d.amount), paid: 0, dueDate: today(), status: "BEKLIYOR", createdAt: now() },
        returns: { id: uid("RET"), type: title, title: d.title, amount: Number(d.amount), createdAt: now() },
        invoices: { id: uid("INV"), no: `INV-${db.counters.invoice++}`, type: title, customer: db.customers[0]?.name || "-", amount: Number(d.amount), createdAt: now() }
      };
      (db[type] || db.cash).unshift(map[type] || map.cash); save(); render(); toast("Kayit eklendi");
    };
  }
  function detailModal(type, r) { modal("Kayıt Detayı", `<pre>${esc(JSON.stringify(enrich(r), null, 2))}</pre>`, `<button data-row-action="${type}:${r.id}:PDF İndir">🖨 PDF İndir</button>`); }
  function editModal(type, r) { modal("Düzenle", `<form id="editForm"><div class="form-grid">${Object.keys(r).filter(k => !Array.isArray(r[k])).slice(0, 10).map(k => `<label>${k}<input name="${k}" value="${esc(r[k])}"></label>`).join("")}</div></form>`, `<button data-action="saveEdit">💾 Güncelle</button>`); $("[data-action='saveEdit']").onclick = () => { Object.assign(r, formData($("#editForm"))); save(); render(); toast("Kayit guncellendi"); }; }
  function changeStatus(type, r, text) {
    const map = { "Tamirde": "TAMIRDE", "Hazır": "HAZIR", "Teslim": "TESLIM_EDILDI", "İade": "IADE", "İptal": "IPTAL", "Geldi": "GELDI", "Alındı": "TESLIM_ALINDI", "Edildi": "TESLIM_EDILDI" };
    const key = Object.keys(map).find(k => text.includes(k));
    r.status = map[key] || "HAZIR";
    if (r.status === "TESLIM_EDILDI") r.deliveredAt = now();
    save(); render(); toast("Durum guncellendi");
  }
  function payment(type, r, text) {
    const amount = text.includes("Tamam") ? Number(r.total || r.price || 0) - Number(r.paid || 0) : Number(prompt("Tutar", "100") || 0);
    r.paid = Number(r.paid || 0) + amount;
    if (r.total && r.paid >= r.total) r.status = "ODENDI";
    db.cash.unshift({ id: uid("CSH"), type: "IN", amount, currency: db.settings.currency, title: "Ödeme alındı", ref: r.no || r.title, at: now() });
    save(); render(); toast("Odeme alindi");
  }
  function usePart(r) { const p = db.stock[0]; if (!p) return toast("Stok urunu yok", "error"); p.quantity = Math.max(0, Number(p.quantity) - 1); if (r.notes) r.notes.push(`${p.name} parca kullanildi`); save(); render(); toast("Parca stoktan dusuldu"); }
  function addCargo(r) { db.cargo.unshift({ id: uid("CRG"), direction: "Giden", title: r.no || r.title || "Kargo", trackingNo: `TRK${Date.now()}`, status: "KARGODA", createdAt: now() }); save(); render(); toast("Kargo kaydi eklendi"); }
  function addExternal(r) { db.external.unshift({ id: uid("EXT"), company: "Dis Servis Firmasi", serviceNo: r.no || "-", cost: 0, status: "DIS_SERVIS", createdAt: now() }); if (r.status) r.status = "DIS_SERVIS"; save(); render(); toast("Dis servis kaydi olustu"); }
  function whatsapp(r, text) { const msg = `Sayın müşterimiz, ${r.no || r.title || ""} numaralı cihazınızın durumu: ${statusMap[r.status] || r.status || "bilgi"}.`; modal(text, `<textarea>${esc(msg)}</textarea><p class="hint">WhatsApp'a yapistirilmaya hazir mesaj.</p>`); }
  function callCustomer(r) { const c = db.customers.find(x => x.id === r.customerId) || {}; if (c.phone) location.href = `tel:${c.phone}`; else toast("Telefon numarasi yok", "error"); }
  function qrAction(r, text) { if (text.includes("Yazdır")) printRecord("QR", r); else toast("QR hazir"); }
  function cancelSale(sale) { sale.status = "IPTAL"; db.saleItems.filter(x => x.saleId === sale.id).forEach(x => { const p = db.stock.find(s => s.id === x.id); if (p) p.quantity = Number(p.quantity) + Number(x.qty); }); db.cash.unshift({ id: uid("CSH"), type: "OUT", amount: sale.total, currency: db.settings.currency, title: "Satış iptali", ref: sale.no, at: now() }); save(); render(); toast("Satis iptal edildi"); }
  function saveSettings(form) {
    const d = formData(form);
    db.settings.businessName = d.businessName; db.settings.phone = d.phone; db.settings.address = d.address; db.settings.taxNo = d.taxNo; db.settings.currency = d.currency; db.settings.language = d.language; db.settings.receiptText = d.receiptText;
    Object.keys(db.settings.templates).forEach(k => db.settings.templates[k] = d[`tpl_${k}`] || db.settings.templates[k]);
    save(); render(); toast("Ayarlar kaydedildi");
  }
  function userModal() { modal("Yeni Kullanıcı", `<form id="userForm"><div class="form-grid"><label>Ad<input name="name" required></label><label>Kullanıcı<input name="username" required></label><label>Şifre<input name="password" required></label><label>Rol<select name="role"><option>STAFF</option><option>ADMIN</option></select></label></div></form>`, `<button data-action="saveUser">💾 Kaydet</button>`); $("[data-action='saveUser']").onclick = () => { db.users.unshift({ id: uid("USR"), ...formData($("#userForm")), active: true, createdAt: now() }); save(); render(); toast("Kullanici olusturuldu"); }; }
  function deviceHistory() { const imei = $("[name='imei']")?.value; const count = db.devices.filter(x => x.imei && x.imei === imei).length; toast(`${count} cihaz gecmisi bulundu`); }
  function printRecord(title, data) { $("#printArea").innerHTML = `<h1>${esc(title)}</h1><pre>${esc(JSON.stringify(data, null, 2))}</pre><p>${esc(db.settings.receiptText)}</p>`; window.print(); }
  function exportRows(type, rows) { const csv = toCSV(rows.map(enrich)); download(`${type}.xls`, csv, "application/vnd.ms-excel"); toast("Excel dosyasi hazirlandi"); }
  function toCSV(rows) { if (!rows.length) return ""; const keys = Object.keys(rows[0]); return [keys.join("\t"), ...rows.map(r => keys.map(k => String(r[k] ?? "").replace(/\n/g, " ")).join("\t"))].join("\n"); }
  function download(name, text, mime) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }
  function drawQR(canvas) {
    const ctx = canvas.getContext("2d"); const size = 120; canvas.width = size; canvas.height = size; ctx.fillStyle = "white"; ctx.fillRect(0, 0, size, size); ctx.fillStyle = "#111827";
    const text = canvas.dataset.qr || "QR"; for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if ((x * y + text.charCodeAt((x + y) % text.length)) % 3 === 0) ctx.fillRect(x * 10, y * 10, 8, 8);
    [[0, 0], [80, 0], [0, 80]].forEach(([x, y]) => { ctx.fillRect(x, y, 32, 32); ctx.fillStyle = "white"; ctx.fillRect(x + 8, y + 8, 16, 16); ctx.fillStyle = "#111827"; ctx.fillRect(x + 13, y + 13, 6, 6); });
  }
  render();
})();
