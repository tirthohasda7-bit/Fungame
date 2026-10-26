/**
 * Bangla Fun Games (বাংলা ফান গেমস)
 * Pure Vanilla JavaScript - No dependencies, No paid APIs, 100% Client-side
 */

// ==================== Bengali Number Formatter ====================
function toBnNum(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

// ==================== Web Audio Sound Synthesizer ====================
// Generates pleasant 8-bit / arcade sound effects without any external audio files
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tap') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'flip') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'win') {
      // Fanfare notes
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
        noteGain.gain.setValueAtTime(0.14, now + idx * 0.1);
        noteGain.gain.linearRampToValueAtTime(0.01, now + (idx + 1) * 0.1 + 0.1);
        noteOsc.start(now + idx * 0.1);
        noteOsc.stop(now + (idx + 1) * 0.1 + 0.15);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// ==================== Navigation & Views ====================
let currentView = 'home';

function navigateTo(viewId) {
  playSound('tap');
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
    currentView = viewId;
  }

  // Update bottom navigation active tab
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBNav = document.getElementById(`bnav-${viewId}`);
  if (activeBNav) {
    activeBNav.classList.add('active');
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function launchGame(gameType) {
  navigateTo(gameType);
  if (gameType === 'quiz') {
    startQuiz();
  } else if (gameType === 'tictactoe') {
    restartTTT();
  } else if (gameType === 'memory') {
    initMemoryGame();
  }
}

function toggleHelp(gameId) {
  playSound('tap');
  const helpEl = document.getElementById(`help-${gameId}`);
  if (helpEl) {
    helpEl.style.display = helpEl.style.display === 'none' ? 'block' : 'none';
  }
}

function openAboutModal() {
  playSound('tap');
  document.getElementById('about-modal').style.display = 'flex';
}

function closeAboutModal() {
  playSound('tap');
  document.getElementById('about-modal').style.display = 'none';
}

// ==================== Search and Filter Logic ====================
const searchInput = document.getElementById('game-search');
const clearSearchBtn = document.getElementById('clear-search');
const categoryTabs = document.querySelectorAll('.tab-btn');
const gameCards = document.querySelectorAll('.game-card');
const noResultsEl = document.getElementById('no-results');
const gamesCountEl = document.getElementById('games-count');

let activeCategory = 'all';

function filterGames() {
  const query = (searchInput.value || '').trim().toLowerCase();
  let visibleCount = 0;

  clearSearchBtn.style.display = query ? 'block' : 'none';

  gameCards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    const cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
    const textContent = card.innerText.toLowerCase();

    const matchesCategory = (activeCategory === 'all' || cardCat === activeCategory);
    const matchesQuery = (!query || cardTitle.includes(query) || textContent.includes(query));

    if (matchesCategory && matchesQuery) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  gamesCountEl.innerText = `${toBnNum(visibleCount)}টি গেম`;
  noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
}

if (searchInput) {
  searchInput.addEventListener('input', filterGames);
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterGames();
    searchInput.focus();
  });
}

categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    playSound('tap');
    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = tab.getAttribute('data-category');
    filterGames();
  });
});

function resetSearch() {
  searchInput.value = '';
  activeCategory = 'all';
  categoryTabs.forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-category="all"]').classList.add('active');
  filterGames();
}

// ==================== Theme & Sound State ====================
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');

function initSettings() {
  const savedTheme = localStorage.getItem('bfg_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeIcon.innerText = savedTheme === 'light' ? '☀️' : '🌙';

  const savedSound = localStorage.getItem('bfg_sound');
  soundEnabled = savedSound !== 'false';
  soundIcon.innerText = soundEnabled ? '🔊' : '🔇';

  updateHomeBestScores();
}

themeBtn.addEventListener('click', () => {
  playSound('tap');
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeIcon.innerText = newTheme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('bfg_theme', newTheme);
});

soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundIcon.innerText = soundEnabled ? '🔊' : '🔇';
  localStorage.setItem('bfg_sound', soundEnabled);
  if (soundEnabled) playSound('tap');
});

function updateHomeBestScores() {
  const bestQuiz = localStorage.getItem('bfg_best_quiz') || '0';
  const quizPreview = document.getElementById('preview-best-quiz');
  if (quizPreview) {
    quizPreview.innerHTML = `সর্বোচ্চ স্কোর: <strong>${toBnNum(bestQuiz)}/২৫</strong>`;
  }

  const bestTTT = localStorage.getItem('bfg_ttt_wins') || '0';
  const tttPreview = document.getElementById('preview-best-ttt');
  if (tttPreview) {
    tttPreview.innerHTML = `মোট জয়: <strong>${toBnNum(bestTTT)}</strong>`;
  }

  const bestMem = localStorage.getItem('bfg_best_memory');
  const memPreview = document.getElementById('preview-best-memory');
  if (memPreview) {
    memPreview.innerHTML = `সেরা চাল: <strong>${bestMem ? toBnNum(bestMem) : '-'}</strong>`;
  }
}

// ====================================================================
// GAME 1: BENGALI QUIZ CHALLENGE (২৫টি চমৎকার বাংলা সাধারণ জ্ঞান প্রশ্ন)
// ====================================================================
const QUIZ_QUESTIONS = [
  {
    q: "বাংলাদেশের জাতীয় কবির নাম কী?",
    options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জীবনানন্দ দাশ", "জসীমউদ্দীন"],
    answer: 1,
    explanation: "কাজী নজরুল ইসলাম বাংলাদেশের জাতীয় কবি। তিনি 'বিদ্রোহী কবি' হিসেবেও পরিচিত।"
  },
  {
    q: "সূর্যের সবচেয়ে কাছের গ্রহ কোনটি?",
    options: ["বুধ (Mercury)", "শুক্র (Venus)", "মঙ্গল (Mars)", "পৃথিবী (Earth)"],
    answer: 0,
    explanation: "বুধ গ্রহটি সৌরজগতের ক্ষুদ্রতম এবং সূর্যের সবচেয়ে নিকটবর্তী গ্রহ।"
  },
  {
    q: "বাংলাদেশের দীর্ঘতম ও গভীরতম নদী কোনটি?",
    options: ["পদ্মা", "যমুনা", "মেঘনা", "কর্ণফুলী"],
    answer: 2,
    explanation: "মেঘনা নদী বাংলাদেশের অন্যতম দীর্ঘতম ও সবচেয়ে প্রশস্ত নদী।"
  },
  {
    q: "বিশ্বের বৃহত্তম ম্যানগ্রোভ বা লবণাক্ত বনাঞ্চল কোনটি?",
    options: ["অ্যামাজন", "সুন্দরবন", "ব্ল্যাক ফরেস্ট", "শালবন"],
    answer: 1,
    explanation: "সুন্দরবন বিশ্ব ঐতিহ্যবাহী পৃথিবীর বৃহত্তম অবিচ্ছিন্ন ম্যানগ্রোভ বন।"
  },
  {
    q: "মানুষের শরীরে রক্তের প্রধান পাম্পিং অঙ্গ কোনটি?",
    options: ["ফুসফুস", "যকৃৎ", "হৃদপিণ্ড (Heart)", "বৃক্ক (Kidney)"],
    answer: 2,
    explanation: "হৃদপিণ্ড অনবরত সংকুচিত ও প্রসারিত হয়ে সারা শরীরে রক্ত সংবহন বজায় রাখে।"
  },
  {
    q: "কোন ভিটামিনের অভাবে রাতকানা রোগ হয়?",
    options: ["ভিটামিন এ", "ভিটামিন বি", "ভিটামিন সি", "ভিটামিন ডি"],
    answer: 0,
    explanation: "ভিটামিন 'এ' চোখের দৃষ্টিশক্তি সুরক্ষায় অপরিহার্য। এর ঘাটতিতে রাতকানা রোগ হয়।"
  },
  {
    q: "বাংলাদেশের জাতীয় শহীদ মিনার কোথায় অবস্থিত?",
    options: ["ঢাকা বিশ্ববিদ্যালয় চত্বরে", "সাভারে", "মিরপুরে", "সোহরাওয়ার্দী উদ্যানে"],
    answer: 0,
    explanation: "ঢাকা মেডিকেল কলেজ হাসপাতালের পাশে ঢাকা বিশ্ববিদ্যালয় চত্বরে কেন্দ্রীয় শহীদ মিনার অবস্থিত।"
  },
  {
    q: "কোন গ্যাস ছাড়া আগুন জ্বলে না?",
    options: ["নাইট্রোজেন", "অক্সিজেন", "কার্বন ডাই অক্সাইড", "হাইড্রোজেন"],
    answer: 1,
    explanation: "অক্সিজেন গ্যাস দহনে সহায়তা করে। অক্সিজেন ছাড়া আগুন জ্বলতে পারে না।"
  },
  {
    q: "কম্পিউটারের মস্তিষ্ক (Brain of Computer) কাকে বলা হয়?",
    options: ["RAM", "Hard Disk", "CPU", "Motherboard"],
    answer: 2,
    explanation: "CPU (Central Processing Unit) কম্পিউটারের যাবতীয় হিসাব ও কমান্ড পরিচালনা করে।"
  },
  {
    q: "বাংলাদেশের জাতীয় প্রতীকে কয়টি তারকা চিহ্ন রয়েছে?",
    options: ["২টি", "৩টি", "৪টি", "৫টি"],
    answer: 2,
    explanation: "বাংলাদেশের জাতীয় প্রতীকের দুই পাশে ২টি করে মোট ৪টি তারকা রয়েছে।"
  },
  {
    q: "ক্রিকেট খেলায় পিচের দৈর্ঘ্য কত গজ?",
    options: ["২০ গজ", "২২ গজ", "২৪ গজ", "১৮ গজ"],
    answer: 1,
    explanation: "ক্রিকেট পিচের দৈর্ঘ্য ঠিক ২২ গজ (প্রায় ২০১.১২ সেন্টিমিটার)।"
  },
  {
    q: "পৃথিবীর সবচেয়ে বড় মহাসাগর কোনটি?",
    options: ["আটলান্টিক মহাসাগর", "ভারত মহাসাগর", "প্রশান্ত মহাসাগর (Pacific Ocean)", "উত্তর মহাসাগর"],
    answer: 2,
    explanation: "প্রশান্ত মহাসাগর আয়তনে বিশ্বের সবচেয়ে বড় এবং গভীরতম মহাসাগর।"
  },
  {
    q: "পদ্মা সেতু কত তারিখে উদ্বোধন করা হয়?",
    options: ["২৫ জুন ২০২২", "১৬ ডিসেম্বর ২০২১", "২৬ মার্চ ২০২২", "৭ মার্চ ২০২৩"],
    answer: 0,
    explanation: "২৫ জুন ২০২২ তারিখে ঐতিহাসিক পদ্মা সেতু আনুষ্ঠানিকভাবে উদ্বোধন করা হয়।"
  },
  {
    q: "কোন রঙের আলোর তরঙ্গদৈর্ঘ্য সবচেয়ে বেশি?",
    options: ["নীল", "সবুজ", "লাল", "হলুদ"],
    answer: 2,
    explanation: "লাল রঙের আলোর তরঙ্গদৈর্ঘ্য সবচেয়ে বেশি হওয়ায় এটি দূর থেকেও স্পষ্টভাবে দৃশ্যমান হয়।"
  },
  {
    q: "বাংলাদেশের একমাত্র প্রবাল দ্বীপ কোনটি?",
    options: ["হাতিয়া", "সেন্টমার্টিন", "মহেশখালী", "ভোলা"],
    answer: 1,
    explanation: "সেন্টমার্টিন হলো বাংলাদেশের একমাত্র সামুদ্রিক প্রবাল দ্বীপ, যা নারিকেল জিঞ্জিরা নামেও পরিচিত।"
  },
  {
    q: "উদ্ভিদ সালোকসংশ্লেষণ প্রক্রিয়ায় কোন গ্যাস গ্রহণ করে?",
    options: ["অক্সিজেন", "কার্বন ডাই অক্সাইড", "নাইট্রোজেন", "মিথেন"],
    answer: 1,
    explanation: "গাছপালা সূর্যালোকের উপস্থিতিতে বাতাস থেকে কার্বন ডাই অক্সাইড গ্রহণ করে খাবার তৈরি করে ও অক্সিজেন ছাড়ে।"
  },
  {
    q: "বিশ্বের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?",
    options: ["মাউন্ট এভারেস্ট", "কে-২", "কাঞ্চনজঙ্ঘা", "কিলিমাঞ্জারো"],
    answer: 0,
    explanation: "হিমালয় পর্বতমালার মাউন্ট এভারেস্ট (৮,৮৪৮.৮৬ মিটার) বিশ্বের সর্বোচ্চ শৃঙ্গ।"
  },
  {
    q: "পানির রাসায়নিক সংকেত কোনটি?",
    options: ["CO2", "H2O", "NaCl", "CH4"],
    answer: 1,
    explanation: "পানির প্রতিটি অণুতে দুটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণু থাকে (H2O)।"
  },
  {
    q: "বাংলা নববর্ষের প্রথম দিন কোনটি?",
    options: ["পহেলা বৈশাখ", "পহেলা ফাল্গুন", "নবান্ন", "চৈত্র সংক্রান্তি"],
    answer: 0,
    explanation: "পহেলা বৈশাখ বাংলা সনের প্রথম দিন এবং বাঙালিদের ঐতিহ্যবাহী উৎসবের দিন।"
  },
  {
    q: "আন্তর্জাতিক মাতৃভাষা দিবস কত তারিখে পালিত হয়?",
    options: ["২৬ মার্চ", "১৬ ডিসেম্বর", "২১ ফেব্রুয়ারি", "৭ মার্চ"],
    answer: 2,
    explanation: "ইউনেস্কো ১৯৯৯ সালে ২১ ফেব্রুয়ারিকে আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে ঘোষণা করে।"
  },
  {
    q: "কোন প্রাণী দাঁড়িয়ে ঘুমায়?",
    options: ["সিংহ", "ঘোড়া", "বাঘ", "ভাল্লুক"],
    answer: 1,
    explanation: "ঘোড়ার পায়ের বিশেষ পেশিবিন্যাসের কারণে তারা দাঁড়িয়েই আরামে ঘুমাতে পারে।"
  },
  {
    q: "শব্দের গতি বাতাসে সবচেয়ে বেশি না কঠিন মাধ্যমে বেশি?",
    options: ["বাতাসে বেশি", "শূন্যস্থানে বেশি", "কঠিন মাধ্যমে বেশি", "সব মাধ্যমে সমান"],
    answer: 2,
    explanation: "শব্দ তরঙ্গের চলাচলের জন্য মাধ্যমের ঘনত্ব বেশি প্রয়োজন, তাই কঠিন মাধ্যমে শব্দের গতি সবচেয়ে বেশি।"
  },
  {
    q: "বাংলাদেশের জাতীয় পতাকার অনুপাত কত?",
    options: ["৫:৩ (বা ১০:৬)", "৪:৩", "৩:২", "২:১"],
    answer: 0,
    explanation: "বাংলাদেশের জাতীয় পতাকার দৈর্ঘ্য ও প্রস্থের অনুপাত ১০:৬ বা ৫:৩।"
  },
  {
    q: "নোবেল পুরস্কার কোন দেশ থেকে প্রধানত প্রদান করা হয়?",
    options: ["সুইডেন ও নরওয়ে", "যুক্তরাষ্ট্র", "যুক্তরাজ্য", "সুইজারল্যান্ড"],
    answer: 0,
    explanation: "আলফ্রেড নোবেলের স্মরণে চিকিৎসা, পদার্থ, রসায়ন, সাহিত্য ইত্যাদি বিষয়ে সুইডেন থেকে এবং শান্তিতে নরওয়ে থেকে দেওয়া হয়।"
  },
  {
    q: "বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?",
    options: ["মেঘনাদবধ কাব্য", "পদ্মাবতী", "গীতাঞ্জলি", "অন্নদামঙ্গল"],
    answer: 0,
    explanation: "মাইকেল মধুসূদন দত্ত রচিত 'মেঘনাদবধ কাব্য' বাংলা সাহিত্যের প্রথম সার্থক মহাকাব্য।"
  }
];

let quizCurrentIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function startQuiz() {
  quizCurrentIndex = 0;
  quizScore = 0;
  quizAnswered = false;

  document.getElementById('quiz-result-card').style.display = 'none';
  document.getElementById('quiz-question-box').style.display = 'block';

  const bestScore = localStorage.getItem('bfg_best_quiz') || '0';
  document.getElementById('quiz-best-score-display').innerText = `সর্বোচ্চ স্কোর: ${toBnNum(bestScore)}`;

  renderQuizQuestion();
}

function renderQuizQuestion() {
  quizAnswered = false;
  const qData = QUIZ_QUESTIONS[quizCurrentIndex];
  const total = QUIZ_QUESTIONS.length;

  document.getElementById('quiz-question-counter').innerText = `প্রশ্ন: ${toBnNum(quizCurrentIndex + 1)}/${toBnNum(total)}`;
  document.getElementById('quiz-score-counter').innerHTML = `স্কোর: <strong>${toBnNum(quizScore)}</strong>`;
  document.getElementById('quiz-q-num').innerText = `প্রশ্ন ${toBnNum(quizCurrentIndex + 1 < 10 ? '0' + (quizCurrentIndex + 1) : quizCurrentIndex + 1)}`;
  
  const progressPercent = Math.round(((quizCurrentIndex) / total) * 100);
  document.getElementById('quiz-progress-bar').style.width = `${Math.max(4, progressPercent)}%`;

  document.getElementById('quiz-question-text').innerText = qData.q;

  // Options
  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = '';
  const optLetters = ['ক', 'খ', 'গ', 'ঘ'];

  qData.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.innerHTML = `
      <span class="option-prefix">${optLetters[idx]}</span>
      <span class="option-text">${optText}</span>
      <span class="option-status-icon"></span>
    `;
    btn.onclick = () => selectQuizOption(idx, btn);
    optionsContainer.appendChild(btn);
  });

  document.getElementById('quiz-feedback-box').style.display = 'none';
}

function selectQuizOption(selectedIdx, btnElement) {
  if (quizAnswered) return;
  quizAnswered = true;

  const qData = QUIZ_QUESTIONS[quizCurrentIndex];
  const allOptionBtns = document.querySelectorAll('.quiz-option-btn');
  const isCorrect = (selectedIdx === qData.answer);

  allOptionBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === qData.answer) {
      btn.classList.add('correct');
      btn.querySelector('.option-status-icon').innerText = '✓';
    } else if (idx === selectedIdx && !isCorrect) {
      btn.classList.add('wrong');
      btn.querySelector('.option-status-icon').innerText = '✕';
    }
  });

  if (isCorrect) {
    playSound('correct');
    quizScore++;
    document.getElementById('quiz-score-counter').innerHTML = `স্কোর: <strong>${toBnNum(quizScore)}</strong>`;
  } else {
    playSound('wrong');
  }

  // Show Feedback Box
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackExp = document.getElementById('feedback-explanation');

  feedbackIcon.innerText = isCorrect ? '🎉' : '💡';
  feedbackTitle.innerText = isCorrect ? 'অভিনন্দন! সঠিক উত্তর!' : `ভুল উত্তর! সঠিক উত্তর: "${qData.options[qData.answer]}"`;
  feedbackExp.innerText = qData.explanation;
  feedbackBox.style.display = 'block';

  // Smooth scroll to feedback if on small phone
  feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function nextQuizQuestion() {
  playSound('tap');
  quizCurrentIndex++;
  if (quizCurrentIndex < QUIZ_QUESTIONS.length) {
    renderQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  playSound('win');
  document.getElementById('quiz-question-box').style.display = 'none';
  const resultCard = document.getElementById('quiz-result-card');
  resultCard.style.display = 'block';

  const total = QUIZ_QUESTIONS.length;
  document.getElementById('quiz-final-score').innerText = toBnNum(quizScore);
  const accuracy = Math.round((quizScore / total) * 100);
  document.getElementById('quiz-accuracy').innerText = `${toBnNum(accuracy)}%`;

  // Best score handling
  const prevBest = parseInt(localStorage.getItem('bfg_best_quiz') || '0', 10);
  const newBest = Math.max(prevBest, quizScore);
  localStorage.setItem('bfg_best_quiz', newBest);
  document.getElementById('quiz-final-best').innerText = `${toBnNum(newBest)}/২৫`;

  // Feedback message
  const greetingEl = document.getElementById('quiz-result-greeting');
  if (quizScore >= 23) {
    greetingEl.innerText = 'অসাধারণ প্রতিভা! আপনি কুইজ মাস্টার!';
  } else if (quizScore >= 18) {
    greetingEl.innerText = 'চমৎকার পারফরম্যান্স! আপনার সাধারণ জ্ঞান দারুণ!';
  } else if (quizScore >= 12) {
    greetingEl.innerText = 'ভালো খেলেছেন! নিয়মিত চর্চায় আরও উন্নতি হবে।';
  } else {
    greetingEl.innerText = 'আবার চেষ্টা করুন এবং নতুন জ্ঞান অর্জন করুন!';
  }

  updateHomeBestScores();
}

function restartQuiz() {
  playSound('tap');
  startQuiz();
}

// ====================================================================
// GAME 2: TIC-TAC-TOE (টিক-ট্যাক-টো / কাটাকুটি খেলা)
// ====================================================================
let tttBoard = Array(9).fill(null);
let tttCurrentPlayer = 'X'; // 'X' or 'O'
let tttGameActive = true;
let tttMode = 'p2p'; // 'p2p' or 'ai'
let tttScores = { x: 0, o: 0, draw: 0 };

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function setTTTMode(mode) {
  playSound('tap');
  tttMode = mode;
  document.getElementById('mode-p2p').classList.toggle('active', mode === 'p2p');
  document.getElementById('mode-ai').classList.toggle('active', mode === 'ai');

  const p2Name = document.getElementById('name-p2');
  if (p2Name) {
    p2Name.innerText = mode === 'ai' ? 'কম্পিউটার (🤖)' : 'খেলোয়াড় ২';
  }
  restartTTT();
}

function initTTTBoard() {
  const cells = document.querySelectorAll('.ttt-cell');
  cells.forEach((cell, idx) => {
    cell.onclick = () => handleTTTCellClick(idx);
  });
}

function handleTTTCellClick(index) {
  if (!tttGameActive || tttBoard[index] !== null) return;

  makeTTTMove(index, tttCurrentPlayer);

  // If AI mode and game still active and next is O
  if (tttGameActive && tttMode === 'ai' && tttCurrentPlayer === 'O') {
    // Disable board briefly for natural feel
    setTimeout(() => {
      if (tttGameActive) makeAIMove();
    }, 400);
  }
}

function makeTTTMove(index, player) {
  tttBoard[index] = player;
  const cell = document.querySelector(`.ttt-cell[data-index="${index}"]`);
  if (cell) {
    cell.innerText = player === 'X' ? '✕' : '◯';
    cell.classList.add(player === 'X' ? 'x-mark' : 'o-mark');
  }
  playSound('tap');

  const winnerInfo = checkTTTWinner();
  if (winnerInfo) {
    handleTTTWin(winnerInfo);
  } else if (tttBoard.every(cell => cell !== null)) {
    handleTTTDraw();
  } else {
    // Next turn
    tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
    updateTTTStatus();
  }
}

function makeAIMove() {
  // Simple smart AI: Win if can, block if must, take center, or random
  let bestMove = findBestAIMove();
  if (bestMove !== -1) {
    makeTTTMove(bestMove, 'O');
  }
}

function findBestAIMove() {
  // 1. Can AI (O) win in 1 move?
  for (let i = 0; i < 9; i++) {
    if (tttBoard[i] === null) {
      tttBoard[i] = 'O';
      if (checkTTTWinner()) {
        tttBoard[i] = null;
        return i;
      }
      tttBoard[i] = null;
    }
  }

  // 2. Can Player (X) win in 1 move? Block them!
  for (let i = 0; i < 9; i++) {
    if (tttBoard[i] === null) {
      tttBoard[i] = 'X';
      if (checkTTTWinner()) {
        tttBoard[i] = null;
        return i;
      }
      tttBoard[i] = null;
    }
  }

  // 3. Take center if free
  if (tttBoard[4] === null) return 4;

  // 4. Take corners
  const corners = [0, 2, 6, 8].filter(idx => tttBoard[idx] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Any remaining cell
  const emptyCells = [];
  tttBoard.forEach((val, idx) => {
    if (val === null) emptyCells.push(idx);
  });
  if (emptyCells.length > 0) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  return -1;
}

function checkTTTWinner() {
  for (let combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
      return { winner: tttBoard[a], combo };
    }
  }
  return null;
}

function handleTTTWin(winInfo) {
  tttGameActive = false;
  playSound('win');

  // Highlight winning cells
  winInfo.combo.forEach(idx => {
    const cell = document.querySelector(`.ttt-cell[data-index="${idx}"]`);
    if (cell) cell.classList.add('win-highlight');
  });

  const winner = winInfo.winner;
  if (winner === 'X') {
    tttScores.x++;
    document.getElementById('score-x').innerText = toBnNum(tttScores.x);
    const prevWins = parseInt(localStorage.getItem('bfg_ttt_wins') || '0', 10);
    localStorage.setItem('bfg_ttt_wins', prevWins + 1);
    updateHomeBestScores();
  } else {
    tttScores.o++;
    document.getElementById('score-o').innerText = toBnNum(tttScores.o);
  }

  const turnText = document.getElementById('ttt-turn-text');
  const turnIcon = document.getElementById('turn-icon');
  turnIcon.innerText = '🏆';

  if (tttMode === 'ai') {
    turnText.innerText = winner === 'X' ? '🎉 আপনি জিতেছেন! অভিনন্দন!' : '🤖 কম্পিউটার বিজয়ী হয়েছে!';
  } else {
    turnText.innerText = winner === 'X' ? '🎉 খেলোয়াড় ১ (❌) বিজয়ী হয়েছে!' : '🎉 খেলোয়াড় ২ (⭕) বিজয়ী হয়েছে!';
  }
}

function handleTTTDraw() {
  tttGameActive = false;
  tttScores.draw++;
  document.getElementById('score-draw').innerText = toBnNum(tttScores.draw);

  const turnText = document.getElementById('ttt-turn-text');
  const turnIcon = document.getElementById('turn-icon');
  turnIcon.innerText = '🤝';
  turnText.innerText = 'ম্যাচ ড্র / সমতায় শেষ হয়েছে!';
  playSound('tap');
}

function updateTTTStatus() {
  const turnText = document.getElementById('ttt-turn-text');
  const turnIcon = document.getElementById('turn-icon');
  const boxP1 = document.getElementById('box-p1');
  const boxP2 = document.getElementById('box-p2');

  turnIcon.innerText = tttCurrentPlayer === 'X' ? '❌' : '⭕';

  if (tttCurrentPlayer === 'X') {
    turnText.innerText = 'এখন খেলোয়াড় ১ (❌)-এর চাল';
    boxP1.classList.add('active-turn');
    boxP2.classList.remove('active-turn');
  } else {
    turnText.innerText = tttMode === 'ai' ? 'কম্পিউটার (🤖) ভাবছে...' : 'এখন খেলোয়াড় ২ (⭕)-এর চাল';
    boxP1.classList.remove('active-turn');
    boxP2.classList.add('active-turn');
  }
}

function restartTTT() {
  playSound('tap');
  tttBoard = Array(9).fill(null);
  tttCurrentPlayer = 'X';
  tttGameActive = true;

  const cells = document.querySelectorAll('.ttt-cell');
  cells.forEach(cell => {
    cell.innerText = '';
    cell.className = 'ttt-cell';
  });

  updateTTTStatus();
}

function resetTTTScores() {
  playSound('tap');
  tttScores = { x: 0, o: 0, draw: 0 };
  document.getElementById('score-x').innerText = '০';
  document.getElementById('score-o').innerText = '০';
  document.getElementById('score-draw').innerText = '০';
  restartTTT();
}

// ====================================================================
// GAME 3: MEMORY MATCHING GAME (মেমোরি কার্ড ম্যাচিং)
// ====================================================================
const MEMORY_ITEMS = [
  { id: 'tiger', emoji: '🐅', label: 'বাঘ' },
  { id: 'fish', emoji: '🐟', label: 'ইলিশ' },
  { id: 'mango', emoji: '🥭', label: 'আম' },
  { id: 'shapla', emoji: '🪷', label: 'শাপলা' },
  { id: 'football', emoji: '⚽', label: 'ফুটবল' },
  { id: 'bird', emoji: '🐦', label: 'দোয়েল' },
  { id: 'star', emoji: '⭐', label: 'তারা' },
  { id: 'rocket', emoji: '🚀', label: 'রকেট' }
];

let memCards = [];
let memFlippedCards = [];
let memMatchedCount = 0;
let memMoves = 0;
let memTimerSeconds = 0;
let memTimerInterval = null;
let memIsLocked = false;

function initMemoryGame() {
  playSound('tap');
  clearInterval(memTimerInterval);
  memTimerSeconds = 0;
  memMoves = 0;
  memMatchedCount = 0;
  memFlippedCards = [];
  memIsLocked = false;

  document.getElementById('mem-moves').innerText = '০';
  document.getElementById('mem-matches').innerText = '০ / ৮';
  document.getElementById('mem-timer').innerText = '০০:০০';

  // Duplicate and shuffle items
  const cardPool = [...MEMORY_ITEMS, ...MEMORY_ITEMS];
  shuffleArray(cardPool);

  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';

  cardPool.forEach((item, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'memory-card';
    cardEl.setAttribute('data-id', item.id);
    cardEl.setAttribute('data-index', index);
    cardEl.innerHTML = `
      <div class="card-face card-back"></div>
      <div class="card-face card-front">
        <span class="card-emoji">${item.emoji}</span>
        <span class="card-label">${item.label}</span>
      </div>
    `;
    cardEl.onclick = () => handleMemoryCardClick(cardEl);
    grid.appendChild(cardEl);
  });

  // Start timer on first user click or right now
  startMemoryTimer();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startMemoryTimer() {
  clearInterval(memTimerInterval);
  memTimerInterval = setInterval(() => {
    memTimerSeconds++;
    const mins = Math.floor(memTimerSeconds / 60);
    const secs = memTimerSeconds % 60;
    const str = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    document.getElementById('mem-timer').innerText = toBnNum(str);
  }, 1000);
}

function handleMemoryCardClick(cardEl) {
  if (memIsLocked) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

  cardEl.classList.add('flipped');
  playSound('flip');
  memFlippedCards.push(cardEl);

  if (memFlippedCards.length === 2) {
    memMoves++;
    document.getElementById('mem-moves').innerText = toBnNum(memMoves);
    checkMemoryMatch();
  }
}

function checkMemoryMatch() {
  const [card1, card2] = memFlippedCards;
  const id1 = card1.getAttribute('data-id');
  const id2 = card2.getAttribute('data-id');

  if (id1 === id2) {
    // Matched!
    playSound('correct');
    card1.classList.add('matched');
    card2.classList.add('matched');
    memMatchedCount++;
    document.getElementById('mem-matches').innerText = `${toBnNum(memMatchedCount)} / ৮`;
    memFlippedCards = [];

    if (memMatchedCount === 8) {
      setTimeout(handleMemoryGameWin, 500);
    }
  } else {
    // Not matched - flip back
    memIsLocked = true;
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      memFlippedCards = [];
      memIsLocked = false;
    }, 900);
  }
}

function handleMemoryGameWin() {
  clearInterval(memTimerInterval);
  playSound('win');

  const mins = Math.floor(memTimerSeconds / 60);
  const secs = memTimerSeconds % 60;
  const timeStr = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;

  document.getElementById('modal-moves').innerText = toBnNum(memMoves);
  document.getElementById('modal-time').innerText = toBnNum(timeStr);

  const prevBest = localStorage.getItem('bfg_best_memory');
  let bestDisplay = prevBest;
  if (!prevBest || memMoves < parseInt(prevBest, 10)) {
    localStorage.setItem('bfg_best_memory', memMoves);
    bestDisplay = memMoves;
  }
  document.getElementById('modal-best-moves').innerText = `${toBnNum(bestDisplay)} চালে`;

  document.getElementById('memory-win-modal').style.display = 'flex';
  updateHomeBestScores();
}

function closeMemWinModal() {
  playSound('tap');
  document.getElementById('memory-win-modal').style.display = 'none';
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initTTTBoard();
  filterGames();

  // Handle hardware / browser back navigation gracefully
  window.addEventListener('popstate', (e) => {
    if (currentView !== 'home') {
      navigateTo('home');
    }
  });

  // Push initial state
  if (history.pushState) {
    history.pushState({ page: 'home' }, '');
  }
});
