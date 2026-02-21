/* ── NeuroVibe Lab – script.js ── */

// ── Tool definitions per mood ──────────────────────────────────────────────
const TOOLS = {
  anxious: {
    title: '4-7-8 Nefes',
    desc: 'Sempatik sinir sistemini sakinleştiren yapılandırılmış nefes tekniği.',
    tool: 'breath',
  },
  overwhelmed: {
    title: 'Beden Taraması',
    desc: 'Dikkatinizi vücudunuzda gezdirerek mevcut ana dönün.',
    tool: 'scan',
  },
  numb: {
    title: '5-4-3-2-1 Topraklanma',
    desc: 'Duyularınızı harekete geçirerek bağlantı kurun.',
    tool: 'ground',
  },
  scattered: {
    title: 'Kutu Nefesi',
    desc: 'Eşit ritimli nefes döngüsüyle odaklanmayı yeniden kazanın.',
    tool: 'breath',
  },
};

// ── Body scan steps ────────────────────────────────────────────────────────
const SCAN_STEPS = [
  'Ayak tabanlarınızı hissedin. Zemin size destek veriyor.',
  'Bacaklarınızda herhangi bir gerginlik var mı? Bırakın.',
  'Karın bölgenizi fark edin. Her nefeste genişlesin.',
  'Omuzlarınızı düşürün. Çenenizi gevşetin.',
  'Yüzünüzdeki kasları bir an için yumuşatın.',
  'Tüm vücudunuzu bir bütün olarak hissedin. Güvendesiniz.',
];

// ── 5-4-3-2-1 Grounding prompts ────────────────────────────────────────────
const GROUND_STEPS = [
  '👁 Etrafınızda 5 şeyi fark edin ve adlandırın.',
  '✋ 4 farklı dokuya dokunun. Ne hissediyorsunuz?',
  '👂 3 ses duyun. Hangisi en uzakta?',
  '👃 2 koku alın ya da hayal edin.',
  '👅 1 tat fark edin. Ağzınızda ne var şu an?',
  '✅ Şu an buradasınız. Güvende ve tam.',
];

// ── Breath patterns ────────────────────────────────────────────────────────
const BREATH_PATTERNS = {
  anxious:   [{ phase: 'inhale', label: 'Nefes Al', dur: 4000 }, { phase: 'hold', label: 'Tut', dur: 7000 }, { phase: 'exhale', label: 'Ver', dur: 8000 }],
  scattered: [{ phase: 'inhale', label: 'Nefes Al', dur: 4000 }, { phase: 'hold', label: 'Tut', dur: 4000 }, { phase: 'exhale', label: 'Ver', dur: 4000 }, { phase: 'hold', label: 'Tut', dur: 4000 }],
};

// ── State ──────────────────────────────────────────────────────────────────
let currentMood   = null;
let breathTimer   = null;
let breathActive  = false;
let scanIndex     = -1;
let scanTimer     = null;
let groundIndex   = -1;

// ── DOM ────────────────────────────────────────────────────────────────────
const moodSection = document.getElementById('mood-section');
const toolPanel   = document.getElementById('tool-panel');
const toolTitle   = document.getElementById('tool-title');
const toolDesc    = document.getElementById('tool-desc');

const toolBreath  = document.getElementById('tool-breath');
const toolScan    = document.getElementById('tool-scan');
const toolGround  = document.getElementById('tool-ground');

const breathRing  = document.getElementById('breath-ring');
const breathText  = document.getElementById('breath-text');
const breathBtn   = document.getElementById('breath-btn');

const scanList    = document.getElementById('scan-list');
const scanBtn     = document.getElementById('scan-btn');

const groundCard  = document.getElementById('ground-card');
const groundText  = document.getElementById('ground-text');
const groundBtn   = document.getElementById('ground-btn');

const resetBtn    = document.getElementById('reset-btn');

// ── Mood buttons ───────────────────────────────────────────────────────────
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMood = btn.dataset.mood;
    showTool(currentMood);
  });
});

function showTool(mood) {
  const config = TOOLS[mood];
  toolTitle.textContent = config.title;
  toolDesc.textContent  = config.desc;

  toolBreath.classList.add('hidden');
  toolScan.classList.add('hidden');
  toolGround.classList.add('hidden');

  if (config.tool === 'breath') toolBreath.classList.remove('hidden');
  if (config.tool === 'scan')   { toolScan.classList.remove('hidden'); buildScanList(); }
  if (config.tool === 'ground') toolGround.classList.remove('hidden');

  moodSection.classList.add('hidden');
  toolPanel.classList.remove('hidden');
  resetBreath();
}

// ── Breath ─────────────────────────────────────────────────────────────────
breathBtn.addEventListener('click', () => {
  if (breathActive) {
    stopBreath();
  } else {
    startBreath();
  }
});

function startBreath() {
  breathActive = true;
  breathBtn.textContent = 'Durdur';
  const pattern = BREATH_PATTERNS[currentMood] || BREATH_PATTERNS['scattered'];
  let i = 0;
  const run = () => {
    if (!breathActive) return;
    const step = pattern[i % pattern.length];
    breathRing.className = 'breath-ring ' + step.phase;
    breathText.textContent = step.label;
    breathTimer = setTimeout(() => { i++; run(); }, step.dur);
  };
  run();
}

function stopBreath() {
  clearTimeout(breathTimer);
  breathActive = false;
  breathBtn.textContent = 'Nefes Egzersizini Başlat';
  breathRing.className = 'breath-ring';
  breathText.textContent = 'Başla';
}

function resetBreath() {
  stopBreath();
}

// ── Scan ───────────────────────────────────────────────────────────────────
function buildScanList() {
  scanList.innerHTML = '';
  SCAN_STEPS.forEach((s, i) => {
    const li = document.createElement('li');
    li.id = 'scan-' + i;
    li.textContent = s;
    scanList.appendChild(li);
  });
  scanIndex = -1;
  scanBtn.textContent = 'Başla';
}

scanBtn.addEventListener('click', () => {
  if (scanTimer) { clearTimeout(scanTimer); scanTimer = null; }
  scanIndex = 0;
  runScan();
});

function runScan() {
  document.querySelectorAll('.scan-list li').forEach(li => li.classList.remove('active'));
  if (scanIndex >= SCAN_STEPS.length) {
    scanBtn.textContent = 'Tekrar Başlat';
    return;
  }
  const li = document.getElementById('scan-' + scanIndex);
  if (li) li.classList.add('active');
  scanBtn.textContent = 'İleri →';
  scanBtn.onclick = () => { scanIndex++; runScan(); };
}

// ── Grounding ──────────────────────────────────────────────────────────────
groundBtn.addEventListener('click', () => {
  groundIndex++;
  if (groundIndex >= GROUND_STEPS.length) groundIndex = 0;
  groundText.textContent = GROUND_STEPS[groundIndex];
  groundCard.classList.add('active');
  if (groundIndex === GROUND_STEPS.length - 1) {
    groundBtn.textContent = 'Yeniden Başlat';
  } else {
    groundBtn.textContent = 'Sonraki →';
  }
});

// ── Reset ──────────────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  stopBreath();
  clearTimeout(scanTimer);

  groundIndex = -1;
  groundText.textContent = 'Hazır olduğunuzda başlayın.';
  groundCard.classList.remove('active');
  groundBtn.textContent = 'Topraklanmayı Başlat';

  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  currentMood = null;

  toolPanel.classList.add('hidden');
  moodSection.classList.remove('hidden');
});
