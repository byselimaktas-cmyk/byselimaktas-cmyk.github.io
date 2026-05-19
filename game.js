// ═══════════════════════════════════════════
//  LATTEM — Oyun Motoru
// ═══════════════════════════════════════════

const config = getDailyConfig();
let { word, length, timeLimit } = config;

// Türkçe klavye düzeni
const KB_ROWS = [
  ['E','R','T','Y','U','I','O','P','Ğ','Ü'],
  ['A','S','D','F','G','H','J','K','L','Ş','İ'],
  ['ENTER','Z','C','V','B','N','M','Ö','Ç','⌫']
];

// Oyun state
let currentRow = 0;
let currentCol = 0;
let currentGuess = [];
let board = [];
let keyStates = {};
let gameOver = false;
let timerInterval = null;
let timeLeft = timeLimit;
let usedAttempts = 0;
let startTime = null;

// ── Ekran yönetimi ──────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Daily info güncel ──────────────────────
document.getElementById('daily-length-display').textContent = `${length} harf · ${timeLimit}sn`;

// ── Board oluştur ──────────────────────────
function buildBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--cols', length);
  board = [];

  for (let r = 0; r < 6; r++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'board-row';
    const rowCells = [];
    for (let c = 0; c < length; c++) {
      const cell = document.createElement('div');
      cell.className = 'board-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      rowEl.appendChild(cell);
      rowCells.push(cell);
    }
    boardEl.appendChild(rowEl);
    board.push(rowCells);
  }
}

// ── Klavye oluştur ─────────────────────────
function buildKeyboard() {
  const kb = document.getElementById('keyboard');
  kb.innerHTML = '';
  KB_ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'kb-key';
      btn.textContent = key;
      btn.dataset.key = key;
      if (key === 'ENTER') btn.classList.add('kb-wide');
      if (key === '⌫') btn.classList.add('kb-wide');
      btn.addEventListener('click', () => handleKey(key));
      rowEl.appendChild(btn);
    });
    kb.appendChild(rowEl);
  });
}

// ── Timer ──────────────────────────────────
const CIRC = 2 * Math.PI * 17; // r=17

function updateTimerUI() {
  const el = document.getElementById('timer-text');
  const circle = document.getElementById('timer-circle');
  el.textContent = timeLeft;
  const pct = timeLeft / timeLimit;
  circle.style.strokeDashoffset = CIRC * (1 - pct);

  if (timeLeft <= 10) {
    el.classList.add('danger');
    circle.style.stroke = 'var(--c-absent)';
  } else if (timeLeft <= 20) {
    el.classList.add('warn');
    circle.style.stroke = 'var(--c-warn)';
  }
}

function startTimer() {
  const circle = document.getElementById('timer-circle');
  circle.style.strokeDasharray = CIRC;
  circle.style.strokeDashoffset = 0;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false, 'timeout');
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ── Harf girişi ────────────────────────────
function handleKey(key) {
  if (gameOver) return;

  if (key === '⌫' || key === 'Backspace') {
    deleteLetter();
  } else if (key === 'ENTER' || key === 'Enter') {
    submitGuess();
  } else if (/^[A-ZÇĞİÖŞÜa-zçğışöşü]$/.test(key)) {
    addLetter(key.toUpperCase());
  }
}

function addLetter(letter) {
  if (currentCol >= length) return;
  const cell = board[currentRow][currentCol];
  cell.textContent = letter;
  cell.classList.add('filled');
  currentGuess.push(letter);
  currentCol++;
  // Pop animasyonu
  cell.animate([
    { transform: 'scale(1.15)' },
    { transform: 'scale(1)' }
  ], { duration: 80 });
}

function deleteLetter() {
  if (currentCol <= 0) return;
  currentCol--;
  currentGuess.pop();
  const cell = board[currentRow][currentCol];
  cell.textContent = '';
  cell.classList.remove('filled');
}

// ── Tahmin gönder ──────────────────────────
function submitGuess() {
  if (currentCol < length) {
    showMessage('Kelime eksik!');
    shakRow(currentRow);
    return;
  }

  const guess = currentGuess.join('');
  usedAttempts = currentRow + 1;
  revealRow(currentRow, guess);

  if (guess === word) {
    stopTimer();
    setTimeout(() => endGame(true), 1800);
    return;
  }

  if (currentRow === 5) {
    stopTimer();
    setTimeout(() => endGame(false, 'noguess'), 1800);
    return;
  }

  currentRow++;
  currentCol = 0;
  currentGuess = [];
  document.getElementById('attempt-num').textContent = currentRow + 1;
}

// ── Satır açıkla ───────────────────────────
function revealRow(row, guess) {
  const wordArr = word.split('');
  const guessArr = guess.split('');
  const result = Array(length).fill('absent');
  const wordUsed = Array(length).fill(false);
  const guessUsed = Array(length).fill(false);

  // 1. geçiş — doğru yerler
  guessArr.forEach((l, i) => {
    if (l === wordArr[i]) {
      result[i] = 'correct';
      wordUsed[i] = true;
      guessUsed[i] = true;
    }
  });

  // 2. geçiş — yanlış yerde olanlar
  guessArr.forEach((l, i) => {
    if (guessUsed[i]) return;
    const found = wordArr.findIndex((wl, wi) => !wordUsed[wi] && wl === l);
    if (found !== -1) {
      result[i] = 'present';
      wordUsed[found] = true;
    }
  });

  // Hücreleri aç (sırayla, flip animasyonuyla)
  board[row].forEach((cell, i) => {
    setTimeout(() => {
      cell.classList.add('flip');
      setTimeout(() => {
        cell.classList.add(result[i]);
        // Klavyeyi güncelle
        const k = guessArr[i];
        const prev = keyStates[k];
        if (!prev || (prev === 'absent' && result[i] !== 'absent') || (prev === 'present' && result[i] === 'correct')) {
          keyStates[k] = result[i];
          const kEl = document.querySelector(`.kb-key[data-key="${k}"]`);
          if (kEl) {
            kEl.className = 'kb-key ' + result[i];
            if (k === 'ENTER' || k === '⌫') kEl.classList.add('kb-wide');
          }
        }
      }, 150);
    }, i * 120);
  });
}

// ── Mesaj bar ──────────────────────────────
let msgTimeout;
function showMessage(text, duration = 1800) {
  const bar = document.getElementById('message-bar');
  bar.textContent = text;
  bar.classList.add('show');
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => bar.classList.remove('show'), duration);
}

function shakRow(row) {
  board[row].forEach(cell => {
    cell.animate([
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' }
    ], { duration: 300 });
  });
}

// ── Oyun sonu ──────────────────────────────
function endGame(won, reason) {
  gameOver = true;
  stopTimer();

  // Skor hesapla
  const timeBonus = won ? timeLeft * 10 : 0;
  const tryBonus = won ? (6 - usedAttempts) * 50 : 0;
  const score = timeBonus + tryBonus;

  const elapsed = timeLimit - timeLeft;

  // Confetti efekti
  if (won) setTimeout(() => launchConfetti(), 200);

  setTimeout(() => {
    showScreen('screen-result');

    // Emoji & başlık
    document.getElementById('result-emoji').textContent =
      won ? (usedAttempts === 1 ? '🔥' : usedAttempts <= 3 ? '🏆' : '✅') : '😢';
    document.getElementById('result-title').textContent =
      won ? (usedAttempts === 1 ? 'İnanılmaz!' : usedAttempts <= 3 ? 'Harika!' : 'Buldun!') :
      (reason === 'timeout' ? 'Süre Doldu!' : '6 Hak Bitti!');
    document.getElementById('result-sub').textContent =
      won ? `${usedAttempts}. denemede buldun` : `Kelime: ${word}`;

    // Kelimeyi harflerle göster
    const wordReveal = document.getElementById('result-word-reveal');
    wordReveal.innerHTML = '';
    word.split('').forEach(letter => {
      const span = document.createElement('span');
      span.className = 'reveal-letter';
      span.textContent = letter;
      wordReveal.appendChild(span);
    });

    // Stat kutuları
    document.getElementById('stat-score').textContent = score;
    document.getElementById('stat-time').textContent = elapsed + 'sn';
    document.getElementById('stat-tries').textContent = won ? usedAttempts : '—';

    // Geri sayım
    startNextTimer();
  }, won ? 600 : 200);
}

// ── Sonraki kelime geri sayımı ─────────────
function startNextTimer() {
  function update() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('next-timer').textContent = `${h}:${m}:${s}`;
  }
  update();
  setInterval(update, 1000);
}

// ── Paylaş ────────────────────────────────
document.getElementById('btn-share').addEventListener('click', () => {
  const rows = board.slice(0, usedAttempts).map(row =>
    row.map(cell => {
      if (cell.classList.contains('correct')) return '🟩';
      if (cell.classList.contains('present')) return '🟨';
      return '⬛';
    }).join('')
  ).join('\n');

  const text = `LATTEM — ${word.length} harf\n${rows}\n\nlattem.app`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text).then(() => showMessage('Kopyalandı!'));
  }
});

// ── Konfeti ────────────────────────────────
function launchConfetti() {
  const colors = ['#22c55e','#eab308','#3b82f6','#f472b6','#a78bfa'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 0.6}s;
      animation-duration: ${0.8 + Math.random() * 1}s;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

// ── Klavye dinleyicisi ─────────────────────
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  handleKey(e.key);
});

// ── Navigasyon ─────────────────────────────
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-start-from-how').addEventListener('click', startGame);
document.getElementById('btn-how').addEventListener('click', () => showScreen('screen-how'));
document.getElementById('btn-back-how').addEventListener('click', () => showScreen('screen-intro'));
document.getElementById('btn-back-game').addEventListener('click', () => {
  stopTimer();
  showScreen('screen-intro');
});

function startGame() {
  gameOver = false;
  currentRow = 0;
  currentCol = 0;
  currentGuess = [];
  keyStates = {};
  timeLeft = timeLimit;
  usedAttempts = 0;

  const el = document.getElementById('timer-text');
  el.classList.remove('danger', 'warn');
  const circle = document.getElementById('timer-circle');
  circle.style.stroke = '';

  document.getElementById('attempt-num').textContent = 1;

  buildBoard();
  buildKeyboard();
  showScreen('screen-game');
  setTimeout(startTimer, 400);
}

// ── Başlangıç ─────────────────────────────
showScreen('screen-intro');