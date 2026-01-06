console.log("APP JS carregou ✅");

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB3_xVNQwXHvDdz_iSVKZcJzdVdwpJczm4",
  authDomain: "app-preset-estoque.firebaseapp.com",
  projectId: "app-preset-estoque",
  storageBucket: "app-preset-estoque.firebasestorage.app",
  messagingSenderId: "436162899630",
  appId: "1:436162899630:web:c969a580d549e53028473f",
  measurementId: "G-FM1WSQDGR2"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ====== CONFIG ======
const LOW_STOCK_THRESHOLD = 10;

// MASTER (por NOME + PIN)
const MASTER_NAMES = ["Everson Oliveira", "Everson", "MASTER"];
const MASTER_PIN = "1234"; // troque depois

// ====== STATE ======
let currentUser = null;
let currentProfile = null;
let estoque = {};
let lastWithdrawalRows = []; // para exportação

//  controla list do estoque
let unsubscribeStock = null;

// ====== ITENS DE ESTOQUE ======
const CATEGORIES = {
  "parafusos": [
    { "code": "PF001", "label": "M3X10 C/CABEÇA" },
    { "code": "PF002", "label": "M3X20 C/CABEÇA" },
    { "code": "PF003", "label": "M3X30 C/CABEÇA" },
    { "code": "PF004", "label": "M3X40 C/CABEÇA" },
    { "code": "PF005", "label": "M3X45 C/CABEÇA" },
    { "code": "PF006", "label": "M3X50 C/CABEÇA" },
    { "code": "PF007", "label": "M4X10 C/CABEÇA" },
    { "code": "PF008", "label": "M4X20 C/CABEÇA" },
    { "code": "PF009", "label": "M4X30 C/CABEÇA" },
    { "code": "PF010", "label": "M4X30 S/CABEÇA" },
    { "code": "PF011", "label": "M5X10 C/CABEÇA" },
    { "code": "PF012", "label": "M5X16 C/CABEÇA" },
    { "code": "PF013", "label": "M5X25 C/CABEÇA" },
    { "code": "PF014", "label": "M5X30 C/CABEÇA" },
    { "code": "PF015", "label": "M5X50 C/CABEÇA" },
    { "code": "PF016", "label": "M5X55 C/CABEÇA" },
    { "code": "PF017", "label": "M5X60 C/CABEÇA" },
    { "code": "PF018", "label": "M5X10 S/CABEÇA (INOX)" },
    { "code": "PF019", "label": "M5X15 S/CABEÇA (INOX)" },
    { "code": "PF020", "label": "M5X30 S/CABEÇA (INOX)" },
    { "code": "PF021", "label": "M6X10 C/CABEÇA" },
    { "code": "PF022", "label": "M6X20 C/CABEÇA" },
    { "code": "PF023", "label": "M6X25 C/CABEÇA" },
    { "code": "PF024", "label": "M6X30 C/CABEÇA" },
    { "code": "PF025", "label": "M6X40 C/CABEÇA" },
    { "code": "PF026", "label": "M6X55 C/CABEÇA" },
    { "code": "PF027", "label": "M6X60 C/CABEÇA" },
    { "code": "PF028", "label": "M6X80 C/CABEÇA" },
    { "code": "PF029", "label": "M6X100 C/CABEÇA" },
    { "code": "PF030", "label": "M6X10 S/CABEÇA" },
    { "code": "PF031", "label": "M6X10 S/CABEÇA (INOX)" },
    { "code": "PF032", "label": "M6X25 S/CABEÇA (INOX)" },
    { "code": "PF033", "label": "M6X30 S/CABEÇA (INOX)" },
    { "code": "PF034", "label": "M6X30 S/CABEÇA" },
    { "code": "PF035", "label": "M6X40 S/CABEÇA" },
    { "code": "PF036", "label": "M8X20 C/CABEÇA" },
    { "code": "PF037", "label": "M8X25 C/CABEÇA" },
    { "code": "PF038", "label": "M8X30 C/CABEÇA" },
    { "code": "PF039", "label": "M8X40 C/CABEÇA" },
    { "code": "PF040", "label": "M8X45 C/CABEÇA" },
    { "code": "PF041", "label": "M8X50 C/CABEÇA" },
    { "code": "PF042", "label": "M8X60 C/CABEÇA" },
    { "code": "PF043", "label": "M8X70 C/CABEÇA" },
    { "code": "PF044", "label": "M8X80 C/CABEÇA" },
    { "code": "PF045", "label": "M8X25 S/CABEÇA (INOX)" },
    { "code": "PF046", "label": "M8X50 S/CABEÇA (INOX)" },
    { "code": "PF047", "label": "M8X50 S/CABEÇA" },
    { "code": "PF048", "label": "M10X10 C/CABEÇA" },
    { "code": "PF049", "label": "M10X20 C/CABEÇA" },
    { "code": "PF050", "label": "M10X30 C/CABEÇA" },
    { "code": "PF051", "label": "M10X40 C/CABEÇA" },
    { "code": "PF052", "label": "M10X45 C/CABEÇA" },
    { "code": "PF053", "label": "M10X50 C/CABEÇA" },
    { "code": "PF054", "label": "M10X60 C/CABEÇA" },
    { "code": "PF055", "label": "M10X65 C/CABEÇA" },
    { "code": "PF056", "label": "M10X70 C/CABEÇA" },
    { "code": "PF057", "label": "M10X90 C/CABEÇA" },
    { "code": "PF058", "label": "M10X150 C/CABEÇA" },
    { "code": "PF059", "label": "M10X25 S/CABEÇA (INOX)" },
    { "code": "PF060", "label": "M10X50 S/CABEÇA (INOX)" },
    { "code": "PF061", "label": "M10X50 S/CABEÇA" },
    { "code": "PF062", "label": "M12X12 C/CABEÇA" },
    { "code": "PF063", "label": "M12X30 C/CABEÇA" },
    { "code": "PF064", "label": "M12X35 C/CABEÇA" },
    { "code": "PF065", "label": "M12X40 C/CABEÇA" },
    { "code": "PF066", "label": "M12X45 C/CABEÇA" },
    { "code": "PF067", "label": "M12X50 C/CABEÇA" },
    { "code": "PF068", "label": "M12X55 C/CABEÇA" },
    { "code": "PF069", "label": "M12X60 C/CABEÇA" },
    { "code": "PF070", "label": "M12X70 C/CABEÇA" },
    { "code": "PF071", "label": "M12X80 C/CABEÇA" },
    { "code": "PF072", "label": "M12X90 C/CABEÇA" },
    { "code": "PF073", "label": "M12X100 C/CABEÇA" },
    { "code": "PF074", "label": "M12X12 S/CABEÇA" },
    { "code": "PF075", "label": "M12X25 S/CABEÇA (INOX)" },
    { "code": "PF076", "label": "M12X50 S/CABEÇA" },
    { "code": "PF077", "label": "M14X40 C/CABEÇA" },
    { "code": "PF078", "label": "M14X45 C/CABEÇA" },
    { "code": "PF079", "label": "M14X50 C/CABEÇA" },
    { "code": "PF080", "label": "M14X60 C/CABEÇA" },
    { "code": "PF081", "label": "M16X30 C/CABEÇA" },
    { "code": "PF082", "label": "M16X35 C/CABEÇA" },
    { "code": "PF083", "label": "M16X40 C/CABEÇA" },
    { "code": "PF084", "label": "M16X45 C/CABEÇA" },
    { "code": "PF085", "label": "M16X50 C/CABEÇA" },
    { "code": "PF086", "label": "M16X80 C/CABEÇA" },
    { "code": "PF087", "label": "M16X90 C/CABEÇA" },
    { "code": "PF088", "label": "PORCA M3 ZINCADO BRANCO" },
    { "code": "PF089", "label": "PORCA M4 ZINCADO BRANCO" },
    { "code": "PF090", "label": "PORCA M5 ZINCADO BRANCO" },
    { "code": "PF091", "label": "PORCA M6 ZINCADO BRANCO" },
    { "code": "PF092", "label": "PORCA M8 ZINCADO BRANCO" },
    { "code": "PF093", "label": "PORCA M10 ZINCADO BRANCO" },
    { "code": "PF094", "label": "PORCA M10 REBAIXADA (5MM) ZINCADO BRANCO" },
    { "code": "PF095", "label": "PORCA M12 ZINCADO BRANCO" },
    { "code": "PF096", "label": "PORCA M14 ZINCADO BRANCO" },
    { "code": "PF097", "label": "PORCA M16" }
  ],
  "conexoes": [
    { "code": "CX001", "label": "BICO DE AR 1/4 BSP" },
    { "code": "CX002", "label": "COTOVELO 6X6" },
    { "code": "CX003", "label": "COTOVELO 8X8" },
    { "code": "CX004", "label": "COTOVELO 10X10" },
    { "code": "CX005", "label": "COTOVELO 12X12" },
    { "code": "CX006", "label": "TEE 6X6" },
    { "code": "CX007", "label": "TEE 8X8" },
    { "code": "CX008", "label": "TEE 10X10" },
    { "code": "CX009", "label": "TEE 12X12" },
    { "code": "CX010", "label": "UNIÃO RETA 6X6" },
    { "code": "CX011", "label": "UNIÃO RETA 8X8" },
    { "code": "CX012", "label": "UNIÃO RETA 10X10" },
    { "code": "CX013", "label": "UNIÃO RETA 12X12" },
    { "code": "CX014", "label": "UNIÃO RETA 6X6 DE METAL" },
    { "code": "CX015", "label": "UNIÃO RETA 8X8 DE METAL" },
    { "code": "CX016", "label": "UNIÃO REDUÇÃO 8X6" },
    { "code": "CX017", "label": "UNIÃO REDUÇÃO 10X8" },
    { "code": "CX018", "label": "UNIÃO REDUÇÃO 12X10" },
    { "code": "CX019", "label": "Y 6X6" },
    { "code": "CX020", "label": "Y 8X8" },
    { "code": "CX021", "label": "Y 10X10" },
    { "code": "CX022", "label": "Y 12X12" },
    { "code": "CX023", "label": "UNIÃO MACHO BSP 8MM 1/4" },
    { "code": "CX024", "label": "UNIÃO MACHO BSP 8MM 1/8" },
    { "code": "CX025", "label": "UNIÃO MACHO BSP 8MM M5" },
    { "code": "CX026", "label": "UNIÃO MACHO BSP 6MM 1/4" },
    { "code": "CX027", "label": "UNIÃO MACHO BSP 6MM M5" },
    { "code": "CX028", "label": "UNIÃO MACHO BSP 6MM 1/8" },
    { "code": "CX029", "label": "UNIÃO MACHO BSP 8MM 1/4 DE SAÍDA LATÃO" },
    { "code": "CX030", "label": "UNIÃO 2603 1/8" },
    { "code": "CX031", "label": "COTOVELO MACHO 2607 1/8" },
    { "code": "CX032", "label": "UNIÃO MACHO BSP 8MM 1/2" },
    { "code": "CX033", "label": "UNIÃO MACHO BSP 10MM 1/2" },
    { "code": "CX034", "label": "UNIÃO MACHO BSP 6MM 1/2" },
    { "code": "CX035", "label": "COTOVELO GIRATÓRIO 8MM 1/4" },
    { "code": "CX036", "label": "COTOVELO GIRATÓRIO 8MM 1/8" },
    { "code": "CX037", "label": "COTOVELO GIRATÓRIO 6MM 1/4" },
    { "code": "CX038", "label": "COTOVELO GIRATÓRIO 6MM 1/8" },
    { "code": "CX039", "label": "MANGUEIRA PU ESPIRAL C/CONEXÂO 8MM X 10METROS" },
    { "code": "CX040", "label": "MANGUEIRA PU ESPIRAL 10MM X 10METROS" }
  ],
  "filtros": [
    { "code": "FT001", "label": "FILTRO HP90074TH" },
    { "code": "FT002", "label": "FILTRO HOP629060TH" },
    { "code": "FT003", "label": "FILTRO HIDRÁULICO MFPI23010RNSMX10" },
    { "code": "FT004", "label": "10Μ Ø178X400" },
    { "code": "FT005", "label": "10Μ Ø180X460" },
    { "code": "FT006", "label": "10Μ Ø178X460" },
    { "code": "FT007", "label": "10Μ Ø178X550" },
    { "code": "FT008", "label": "10Μ Ø180X850" },
    { "code": "FT009", "label": "50Μ Ø178X400" },
    { "code": "FT010", "label": "50Μ Ø178X460" },
    { "code": "FT011", "label": "50Μ Ø180X813" },
    { "code": "FT012", "label": "50Μ Ø180X850" },
    { "code": "FT013", "label": "100Μ Ø178X400" },
    { "code": "FT014", "label": "100Μ Ø180X460" },
    { "code": "FT015", "label": "100Μ Ø180X850" }
  ],
  "ferramentas": [
    { "code": "FR001", "label": "ALLEN 1.5" },
    { "code": "FR002", "label": "ALLEN 2" },
    { "code": "FR003", "label": "ALLEN 2.5" },
    { "code": "FR004", "label": "ALLEN 3" },
    { "code": "FR005", "label": "ALLEN 4" },
    { "code": "FR006", "label": "ALLEN 5" },
    { "code": "FR007", "label": "ALLEN 6" },
    { "code": "FR008", "label": "ALLEN 8" },
    { "code": "FR009", "label": "ALLEN 10" },
    { "code": "FR010", "label": "ALICATE DE BICO" },
    { "code": "FR011", "label": "ALICATE DE PRESSÃO" },
    { "code": "FR012", "label": "ALICATE DE CORTE" },
    { "code": "FR013", "label": "CHAVE T6" },
    { "code": "FR014", "label": "CHAVE T7" },
    { "code": "FR015", "label": "CHAVE T8" },
    { "code": "FR016", "label": "CHAVE T9" },
    { "code": "FR017", "label": "CHAVE T10" },
    { "code": "FR018", "label": "CHAVE T15" },
    { "code": "FR019", "label": "CHAVE T20" },
    { "code": "FR020", "label": "CHAVE T25" },
    { "code": "FR021", "label": "CHAVE T30" },
    { "code": "FR022", "label": "CHAVE T40" },
    { "code": "FR023", "label": "CHAVE DE FENDA" },
    { "code": "FR024", "label": "CHAVE PHILIPS" },
    { "code": "FR025", "label": "DISCO DE CORTE" },
    { "code": "FR026", "label": "FLAPS" },
    { "code": "FR027", "label": "JOGO DE ALEN LONGA" },
    { "code": "FR028", "label": "JOGO DE ALEN CURTA" },
    { "code": "FR029", "label": "LIMA MURÇA" },
    { "code": "FR030", "label": "LIMA BASTARDA" },
    { "code": "FR031", "label": "LIMA REDONDA" },
    { "code": "FR032", "label": "LIMA DIAMANTADA PARALELA" },
    { "code": "FR033", "label": "LIMA DIAMANTADA REDONDA" },
    { "code": "FR034", "label": "LIMA DIAMANTADA TRIÂNGULAR" },
    { "code": "FR035", "label": "LIMA DIAMANTADA MEIA-CANA" },
    { "code": "FR036", "label": "SERRA PARA ARCO" },
    { "code": "FR037", "label": "TRENA" }
  ]
};

const ITEM_LABEL_BY_CODE = (() => {
  const map = {};
  try {
    Object.values(CATEGORIES).forEach((arr) => {
      (arr || []).forEach((it) => {
        if (it && it.code) map[it.code] = it.label || it.code;
      });
    });
  } catch (e) {}
  return map;
})();

function getItemLabel(code) {
  return ITEM_LABEL_BY_CODE[code] || code;
}

// ====== HELPERS ======
function getInputValue(id) {
  const el = document.getElementById(id);
  return (el?.value || "").trim();
}

function slugName(nome) {
  return String(nome || "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s.-]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}

function normalizeUpper(s) {
  return String(s || "").trim().toUpperCase();
}

function isMasterAttempt(nome, senha) {
  const nomeNorm = normalizeUpper(nome);
  const namesNorm = MASTER_NAMES.map(normalizeUpper);
  return namesNorm.includes(nomeNorm) && String(senha || "") === String(MASTER_PIN);
}

function roleIsAdminOrMaster() {
  const role = (currentProfile?.role || "USER").toUpperCase();
  return role === "ADMIN" || role === "MASTER";
}

function roleIsMaster() {
  const role = (currentProfile?.role || "USER").toUpperCase();
  return role === "MASTER";
}

function getStock(code) {
  return Number(estoque?.[code] ?? 0);
}

function navigateTo(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((p) => p.classList.remove("active"));

  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  // salva a última página (use localStorage para não perder no reload)
  try {
    localStorage.setItem("lastPage", pageId);
  } catch {}
}

// ====== UI (HOME) ======
function applyProfileToHome() {
  const nameText = document.getElementById("user-name-text");
  const extraText = document.getElementById("user-extra-text");

  if (nameText) nameText.textContent = currentProfile?.nome || "";
  if (extraText) extraText.textContent =
    `${currentProfile?.setor || ""} • ${currentProfile?.turno || ""}`;

  const btnAbastecer = document.getElementById("btn-abastecer");
  const btnAdmins = document.getElementById("btn-admins");

  const btnRetiradas = document.getElementById("btn-retiradas");
  if (btnAbastecer) btnAbastecer.style.display = roleIsAdminOrMaster() ? "block" : "none";
  if (btnAdmins) btnAdmins.style.display = roleIsMaster() ? "block" : "none";
  if (btnRetiradas) btnRetiradas.style.display = roleIsAdminOrMaster() ? "block" : "none";
}

// ====== AUTH BASE (ANÔNIMO SEMPRE) ======
function setupFirebaseAuth() {
  auth.onAuthStateChanged(async (user) => {
    currentUser = user || null;

    if (!currentUser) {
      currentProfile = null;

      // ✅ derruba listener quando sair
      try { if (unsubscribeStock) unsubscribeStock(); } catch {}
      unsubscribeStock = null;
      estoque = {};
      updateAllStockBadges();

      navigateTo("page-login");
      return;
    }

    // Quando autenticar anonimamente, só navega pro login
    // e aguarda o usuário fazer "Entrar" ou "Criar conta"
    navigateTo("page-login");
  });
}

// garante que tem sessão anônima
async function ensureAnonAuth() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await auth.signInAnonymously();
  return cred.user;
}

// ====== LÓGICA LOGIN/CADASTRO (NOME+SENHA) ======
async function loadAdminByNameSlug(nameSlug) {
  const snap = await db.collection("admins").doc(nameSlug).get();
  return snap.exists ? (snap.data() || null) : null;
}

async function loadAccountBySlug(nameSlug) {
  const snap = await db.collection("accounts").doc(nameSlug).get();
  return snap.exists ? (snap.data() || null) : null;
}

async function saveUserProfile(uid, payload) {
  await db.collection("users").doc(uid).set(payload, { merge: true });
}

function setupLoginButtons() {
  const btnLogin = document.getElementById("btn-login");
  const btnCriar = document.getElementById("btn-criar-conta");
  const btnLogout = document.getElementById("btn-logout");

  btnLogin?.addEventListener("click", async (ev) => {
    ev?.preventDefault?.();

    const nome = getInputValue("input-nome");
    const setor = getInputValue("input-setor");
    const turno = getInputValue("input-turno");
    const senha = getInputValue("input-senha");

    if (!nome || !setor || !turno || !senha) {
      showToast("Preencha Nome, Setor, Turno e Senha.");
      return;
    }

    try {
      const user = await ensureAnonAuth();
      const uid = user.uid;

      // 1) MASTER por PIN
      if (isMasterAttempt(nome, senha)) {
        currentProfile = { nome, setor, turno, role: "MASTER" };
        await saveUserProfile(uid, currentProfile);

        // ✅ só inicia listener do estoque depois do login
        startStockListener();

        applyProfileToHome();
        navigateTo("page-home");
        showToast("MASTER conectado ✅");
        return;
      }

      // 2) Verifica se é ADMIN (lista admins)
      const slug = slugName(nome);
      const adminData = await loadAdminByNameSlug(slug);
      if (adminData && String(adminData.senha || "") === String(senha)) {
        currentProfile = { nome: adminData.nome || nome, setor, turno, role: "ADMIN" };
        await saveUserProfile(uid, currentProfile);

        // ✅ só inicia listener do estoque depois do login
        startStockListener();

        applyProfileToHome();
        navigateTo("page-home");
        showToast("Admin conectado ✅");
        return;
      }

      // 3) Usuário comum (accounts)
      const acc = await loadAccountBySlug(slug);
      if (!acc) {
        showToast("Usuário não encontrado. Clique em Criar conta.");
        return;
      }
      if (String(acc.senha || "") !== String(senha)) {
        showToast("Senha incorreta.");
        return;
      }

      currentProfile = { nome: acc.nome || nome, setor, turno, role: "USER" };
      await saveUserProfile(uid, currentProfile);

      // ✅ só inicia listener do estoque depois do login
      startStockListener();

      applyProfileToHome();
      navigateTo("page-home");
      showToast("Login realizado ✅");

    } catch (e) {
      console.error("Falha no login:", e);
      showToast("Falha no login. Verifique os dados.");
    }
  });

  btnCriar?.addEventListener("click", async (ev) => {
    ev?.preventDefault?.();

    const nome = getInputValue("input-nome");
    const setor = getInputValue("input-setor");
    const turno = getInputValue("input-turno");
    const senha = getInputValue("input-senha");

    if (!nome || !setor || !turno || !senha) {
      showToast("Para criar conta, preencha Nome, Setor, Turno e Senha.");
      return;
    }

    // bloqueia nomes reservados como conta comum
    if (MASTER_NAMES.map(normalizeUpper).includes(normalizeUpper(nome))) {
      showToast("Nome reservado. Use outro nome para usuário comum.");
      return;
    }

    try {
      await ensureAnonAuth();

      const slug = slugName(nome);
      if (!slug) {
        showToast("Nome inválido.");
        return;
      }

      const exists = await db.collection("accounts").doc(slug).get();
      if (exists.exists) {
        showToast("Já existe um usuário com esse nome. Use outro.");
        return;
      }

      await db.collection("accounts").doc(slug).set({
        nome,
        senha,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast("Conta criada ✅ Agora é só entrar.");
    } catch (e) {
      console.error("Erro ao criar conta:", e);
      showToast("Erro ao criar conta.");
    }
  });

  btnLogout?.addEventListener("click", async (ev) => {
    ev?.preventDefault?.();
    try {
      await auth.signOut();
      currentProfile = null;
      navigateTo("page-login");
    } catch {}
  });
}

// ====== UI / NAV ======
function setupNavigation() {
  document.querySelectorAll(".main-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) navigateTo(target);
    });
  });

  document.querySelectorAll(".back-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) navigateTo(target);
    });
  });

  const btnAbastecer = document.getElementById("btn-abastecer");
  btnAbastecer?.addEventListener("click", () => {
    if (!currentUser || !roleIsAdminOrMaster()) {
      showToast("Apenas ADMIN/MASTER pode abastecer estoque.");
      return;
    }
    renderAbastecerPage();
    navigateTo("page-abastecer");
  });

  const btnAdmins = document.getElementById("btn-admins");
  btnAdmins?.addEventListener("click", () => {
    if (!currentUser || !roleIsMaster()) {
      showToast("Apenas o MASTER pode acessar esta tela.");
      return;
    }
    navigateTo("page-admins");
    renderAdminsList();
  });


  const btnRetiradas = document.getElementById("btn-retiradas");
  btnRetiradas?.addEventListener("click", async () => {
    if (!currentUser || !roleIsAdminOrMaster()) {
      showToast("Apenas ADMIN/MASTER pode acessar esta tela.");
      return;
    }
    navigateTo("page-retiradas");
    await loadWithdrawalsAndRender();
  });

}

// ====== ADMINS (MASTER) ======
function setupAdminsLogic() {
  const btnAdd = document.getElementById("btn-add-admin");
  if (!btnAdd) return;

  btnAdd.addEventListener("click", async () => {
    if (!currentUser || !roleIsMaster()) {
      showToast("Apenas o MASTER pode cadastrar admin.");
      return;
    }

    const nome = getInputValue("admin-nome");
    const senha = getInputValue("admin-senha");

    if (!nome || !senha) {
      showToast("Preencha nome e senha do admin.");
      return;
    }

    try {
      const slug = slugName(nome);
      await db.collection("admins").doc(slug).set({
        nome,
        senha,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      document.getElementById("admin-nome").value = "";
      document.getElementById("admin-senha").value = "";

      showToast("Admin cadastrado ✅");
      renderAdminsList();
    } catch (e) {
      console.error("Erro ao cadastrar admin:", e);
      showToast("Erro ao cadastrar admin.");
    }
  });
}

async function renderAdminsList() {
  const list = document.getElementById("admin-list");
  if (!list) return;

  list.innerHTML = "";

  if (!currentUser || !roleIsMaster()) {
    return;
  }

  try {
    const snap = await db.collection("admins").orderBy("createdAt", "desc").get();
    snap.forEach((doc) => {
      const data = doc.data() || {};
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <div>${data.nome || "Admin"}</div>
          <small class="admin-tag">id: ${doc.id}</small>
        </div>
      `;

      const btn = document.createElement("button");
      btn.textContent = "Remover";
      btn.style.background = "transparent";
      btn.style.color = "#ff0000";
      btn.style.border = "1px solid #ff0000";
      btn.style.padding = "6px 10px";
      btn.style.borderRadius = "10px";
      btn.style.cursor = "pointer";

      btn.addEventListener("click", async () => {
        if (!confirm(`Remover admin "${data.nome}"?`)) return;
        try {
          await db.collection("admins").doc(doc.id).delete();
          showToast("Admin removido ✅");
          renderAdminsList();
        } catch (e) {
          console.error(e);
          showToast("Erro ao remover.");
        }
      });

      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    showToast("Erro ao carregar admins.");
  }
}

// ====== RENDER LISTAS ======
function renderAllCategories() {
  Object.keys(CATEGORIES).forEach((categoryKey) => {
    const container = document.querySelector(
      `.items-list[data-category="${categoryKey}"]`
    );
    if (!container) return;

    container.innerHTML = "";

    CATEGORIES[categoryKey].forEach((item) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const left = document.createElement("div");
      left.className = "item-left";

      const label = document.createElement("span");
      label.className = "item-label";
      label.textContent = item.label;

      const stockSpan = document.createElement("small");
      stockSpan.className = "stock-text";
      stockSpan.setAttribute("data-stock-code", item.code);

      left.appendChild(label);
      left.appendChild(stockSpan);

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "item-input";

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.placeholder = "Qtd";
      input.setAttribute("data-item-code", item.code);
      input.setAttribute("data-category", categoryKey);

      inputWrapper.appendChild(input);
      row.appendChild(left);
      row.appendChild(inputWrapper);
      container.appendChild(row);
    });
  });
}

function renderAbastecerPage() {
  const container = document.getElementById("abastecer-container");
  if (!container) return;
  container.innerHTML = "";

  const categoryNames = {
    parafusos: "Parafusos",
    conexoes: "Conexões",
    ferramentas: "Ferramentas",
    filtros: "Filtros"
  };

  Object.keys(CATEGORIES).forEach((categoryKey) => {
    const section = document.createElement("div");
    section.className = "abastecer-section";

    const title = document.createElement("h3");
    title.textContent = categoryNames[categoryKey] || categoryKey;
    section.appendChild(title);

    CATEGORIES[categoryKey].forEach((item) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const left = document.createElement("div");
      left.className = "item-left";

      const label = document.createElement("span");
      label.className = "item-label";
      label.textContent = item.label;

      const stockSpan = document.createElement("small");
      stockSpan.className = "stock-text";
      stockSpan.setAttribute("data-stock-code", item.code);

      left.appendChild(label);
      left.appendChild(stockSpan);

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "item-input";

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.placeholder = "Qtd";
      input.setAttribute("data-abastecer-code", item.code);

      inputWrapper.appendChild(input);
      row.appendChild(left);
      row.appendChild(inputWrapper);
      section.appendChild(row);
    });

    container.appendChild(section);
  });

  updateAllStockBadges();
}

// ====== FIRESTORE STOCK (REALTIME) ======
function startStockListener() {
  //  se já tinha listener, derruba antes
  try { if (unsubscribeStock) unsubscribeStock(); } catch {}
  unsubscribeStock = null;

  unsubscribeStock = db.collection("stock").onSnapshot(
    (snap) => {
      const map = {};
      snap.forEach((doc) => {
        const data = doc.data() || {};
        map[doc.id] = Number(data.qtd ?? 0);
      });
      estoque = map;
      updateAllStockBadges();
    },
    (err) => {
      console.error("Erro listener stock:", err);
      // não fica spammando toast aqui
    }
  );
}

// ====== ABASTECER ======
function setupAbastecerLogic() {
  const btnSalvar = document.getElementById("btn-salvar-abastecimento");
  if (!btnSalvar) return;

  btnSalvar.addEventListener("click", async () => {
    if (!currentUser || !roleIsAdminOrMaster()) {
      showToast("Apenas ADMIN/MASTER pode abastecer estoque.");
      return;
    }

    const inputs = document.querySelectorAll("input[data-abastecer-code]");
    const FieldValue = firebase.firestore.FieldValue;

    const batch = db.batch();
    let fezMovimento = false;

    inputs.forEach((input) => {
      const raw = input.value.trim();
      const qtd = Number(raw);
      if (!isNaN(qtd) && qtd > 0) {
        const code = input.getAttribute("data-abastecer-code");
        const ref = db.collection("stock").doc(code);
        batch.set(ref, { qtd: FieldValue.increment(qtd) }, { merge: true });
        fezMovimento = true;
      }
    });

    if (!fezMovimento) {
      showToast("Informe alguma quantidade para abastecer.");
      return;
    }

    try {
      await batch.commit();
      inputs.forEach((i) => (i.value = ""));
      showToast("Abastecimento salvo com sucesso ✅");
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar abastecimento.");
    }
  });
}

// ====== RETIRAR ======
function setupRetirarButtons() {
  document.querySelectorAll(".action-btn").forEach((btn) => {
    const category = btn.getAttribute("data-category");
    if (!category) return;
    btn.addEventListener("click", () => handleWithdraw(category));
  });
}

async function handleWithdraw(category) {
  if (!currentUser || !currentProfile) {
    showToast("Faça login para retirar.");
    return;
  }

  const inputs = document.querySelectorAll(`input[data-category="${category}"]`);
  const pedidos = [];

  inputs.forEach((input) => {
    const raw = input.value.trim();
    const qty = Number(raw);
    if (!isNaN(qty) && qty > 0) {
      pedidos.push({
        code: input.getAttribute("data-item-code"),
        quantity: qty,
        category
      });
    }
  });

  if (pedidos.length === 0) {
    showToast("Informe alguma quantidade para retirar.");
    return;
  }

  try {
    const FieldValue = firebase.firestore.FieldValue;

    await db.runTransaction(async (tx) => {
      for (const p of pedidos) {
        const ref = db.collection("stock").doc(p.code);
        const doc = await tx.get(ref);
        const atual = Number(doc.exists ? (doc.data()?.qtd ?? 0) : 0);
        if (p.quantity > atual) {
          throw new Error(`Estoque insuficiente para o item ${p.code}. Atual: ${atual}`);
        }
      }

      for (const p of pedidos) {
        const ref = db.collection("stock").doc(p.code);
        tx.set(ref, { qtd: FieldValue.increment(-p.quantity) }, { merge: true });
      }
    });

    await db.collection("withdrawals").add({
      uid: currentUser.uid,
      nome: currentProfile.nome || "Usuário",
      setor: currentProfile.setor || "",
      turno: currentProfile.turno || "",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      items: pedidos.map((p) => ({
        code: p.code,
        category: p.category,
        quantity: p.quantity
      }))
    });

    inputs.forEach((i) => (i.value = ""));
    showToast("Retirada registrada com sucesso ✅");
  } catch (e) {
    console.error(e);
    showToast(e?.message || "Erro ao retirar.");
  }
}

// ====== BADGES ESTOQUE ======
function updateAllStockBadges() {
  const elements = document.querySelectorAll("[data-stock-code]");
  elements.forEach((el) => {
    const code = el.getAttribute("data-stock-code");
    const qty = getStock(code);

    let text = `Estoque: ${qty}`;
    el.classList.remove("stock-low");

    if (qty <= LOW_STOCK_THRESHOLD) {
      text += " • ESTOQUE BAIXO";
      el.classList.add("stock-low");
    }
    el.textContent = text;
  });
}

// ====== TOAST ======
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}



function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ====== RETIRADAS (ADMIN/MASTER) ======
function setupWithdrawalsLogic() {
  const btnExport = document.getElementById("btn-export-retiradas");
  const btnRefresh = document.getElementById("btn-refresh-retiradas");

  btnExport?.addEventListener("click", () => {
    if (!currentUser || !roleIsAdminOrMaster()) {
      showToast("Apenas ADMIN/MASTER pode exportar.");
      return;
    }
    exportWithdrawalsToCSV();
  });

  btnRefresh?.addEventListener("click", async () => {
    if (!currentUser || !roleIsAdminOrMaster()) {
      showToast("Apenas ADMIN/MASTER pode acessar esta tela.");
      return;
    }
    await loadWithdrawalsAndRender();
  });
}

function formatDateTime(d) {
  try {
    return d.toLocaleString("pt-BR");
  } catch {
    return String(d);
  }
}

async function loadWithdrawalsAndRender() {
  const tbody = document.getElementById("withdrawals-tbody");
  const empty = document.getElementById("withdrawals-empty");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (empty) empty.style.display = "none";
  lastWithdrawalRows = [];

  try {
    const snap = await db
      .collection("withdrawals")
      .orderBy("timestamp", "desc")
      .limit(300)
      .get();

    const rows = [];

    snap.forEach((doc) => {
      const data = doc.data() || {};
      const ts = data.timestamp?.toDate ? data.timestamp.toDate() : null;
      const when = ts ? formatDateTime(ts) : "";
      const nome = data.nome || "";
      const setor = data.setor || "";
      const items = Array.isArray(data.items) ? data.items : [];

      items.forEach((it) => {
        const code = it?.code || "";
        const label = getItemLabel(code);
        const qty = Number(it?.quantity ?? 0);

        rows.push({
          data: when,
          usuario: nome,
          setor,
          item: label,
          quantidade: qty
        });
      });
    });

    lastWithdrawalRows = rows;

    if (!rows.length) {
      if (empty) empty.style.display = "block";
      return;
    }

    // Render tabela
    tbody.innerHTML = rows.map((r) => `
      <tr>
        <td>${escapeHtml(r.data)}</td>
        <td>${escapeHtml(r.usuario)}</td>
        <td>${escapeHtml(r.setor)}</td>
        <td>${escapeHtml(r.item)}</td>
        <td>${escapeHtml(String(r.quantidade))}</td>
      </tr>
    `).join("");

  } catch (e) {
    console.error(e);
    showToast("Erro ao carregar retiradas.");
  }
}

function exportWithdrawalsToCSV() {
  if (!lastWithdrawalRows?.length) {
    showToast("Não há retiradas para exportar.");
    return;
  }

  const header = ["Data", "Usuário", "Setor", "Item", "Quantidade"];
  const lines = [header.join(";")];

  lastWithdrawalRows.forEach((r) => {
    const line = [
      r.data,
      r.usuario,
      r.setor,
      r.item,
      String(r.quantidade)
    ].map((v) => String(v ?? "").replaceAll('"', '""')); // escape básico

    // Excel pt-BR geralmente lê melhor com ';'
    lines.push(line.join(";"));
  });

  // BOM para Excel abrir UTF-8 corretamente
  const csv = "\ufeff" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `retiradas_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


// ====== BOOT ======
document.addEventListener("DOMContentLoaded", async () => {
  setupFirebaseAuth();
  setupLoginButtons();
  setupAdminsLogic();
  setupNavigation();
  renderAllCategories();
  setupRetirarButtons();
  setupAbastecerLogic();
  setupWithdrawalsLogic();

  // garante auth anônimo logo ao abrir
  try { await ensureAnonAuth(); } catch (e) { console.error(e); }

  // inicia listener do estoque (apenas 1 vez)
  startStockListener();

  // 🔥 RESTAURA A ÚLTIMA PÁGINA
  const last = sessionStorage.getItem("lastPage") || "page-login";
  navigateTo(last);
});

// ==== BLOQUEAR PULL-TO-REFRESH (Android WebView + iOS + PWA) ====
(function preventPullToRefresh() {
  let startY = 0;

  window.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    startY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!e.touches || e.touches.length !== 1) return;

    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY;

    const scroller = document.scrollingElement || document.documentElement;

    // Se estiver no topo e arrastando para baixo -> bloqueia o "refresh"
    if (scroller.scrollTop <= 0 && diffY > 0) {
      e.preventDefault();
    }
  }, { passive: false });
})();


