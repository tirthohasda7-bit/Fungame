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
  } else if (gameType === 'rps') {
    initRPS();
  } else if (gameType === 'guess') {
    initNumberGuess();
  } else if (gameType === 'math') {
    initMathChallenge();
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
  const allTab = document.querySelector('.tab-btn[data-category="all"]');
  if (allTab) allTab.classList.add('active');
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
  // Quiz
  const bestQuiz = localStorage.getItem('bfg_best_quiz') || '0';
  const quizPreview = document.getElementById('preview-best-quiz');
  if (quizPreview) {
    quizPreview.innerHTML = `সর্বোচ্চ স্কোর: <strong>${toBnNum(bestQuiz)}/২৫</strong>`;
  }

  // TTT
  const bestTTT = localStorage.getItem('bfg_ttt_wins') || '0';
  const tttPreview = document.getElementById('preview-best-ttt');
  if (tttPreview) {
    tttPreview.innerHTML = `মোট জয়: <strong>${toBnNum(bestTTT)}</strong>`;
  }

  // Memory
  const bestMem = localStorage.getItem('bfg_best_memory');
  const memPreview = document.getElementById('preview-best-memory');
  if (memPreview) {
    memPreview.innerHTML = `সেরা চাল: <strong>${bestMem ? toBnNum(bestMem) : '-'}</strong>`;
  }

  // RPS
  const rpsWins = localStorage.getItem('bfg_rps_wins') || '0';
  const rpsPreview = document.getElementById('preview-best-rps');
  if (rpsPreview) {
    rpsPreview.innerHTML = `মোট জয়: <strong>${toBnNum(rpsWins)}</strong>`;
  }

  // Guess
  const bestGuess = localStorage.getItem('bfg_best_guess');
  const guessPreview = document.getElementById('preview-best-guess');
  if (guessPreview) {
    guessPreview.innerHTML = `সেরা চাল: <strong>${bestGuess ? toBnNum(bestGuess) + ' বার' : '-'}</strong>`;
  }

  // Math
  const bestMath = localStorage.getItem('bfg_best_math') || '0';
  const mathPreview = document.getElementById('preview-best-math');
  if (mathPreview) {
    mathPreview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(bestMath)}</strong>`;
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

  const prevBest = parseInt(localStorage.getItem('bfg_best_quiz') || '0', 10);
  const newBest = Math.max(prevBest, quizScore);
  localStorage.setItem('bfg_best_quiz', newBest);
  document.getElementById('quiz-final-best').innerText = `${toBnNum(newBest)}/২৫`;

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
let tttCurrentPlayer = 'X';
let tttGameActive = true;
let tttMode = 'p2p';
let tttScores = { x: 0, o: 0, draw: 0 };

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
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

  if (tttGameActive && tttMode === 'ai' && tttCurrentPlayer === 'O') {
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
    tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
    updateTTTStatus();
  }
}

function makeAIMove() {
  let bestMove = findBestAIMove();
  if (bestMove !== -1) {
    makeTTTMove(bestMove, 'O');
  }
}

function findBestAIMove() {
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

  if (tttBoard[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter(idx => tttBoard[idx] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

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

// ====================================================================
// GAME 4: ROCK PAPER SCISSORS (পাথর কাগজ কাঁচি)
// ====================================================================
const RPS_CHOICES = {
  rock: { name: 'পাথর', emoji: '🪨', beats: 'scissors', msg: 'পাথর কাঁচিকে গুঁড়ো করে' },
  paper: { name: 'কাগজ', emoji: '📄', beats: 'rock', msg: 'কাগজ পাথরকে ঢেকে দেয়' },
  scissors: { name: 'কাঁচি', emoji: '✂️', beats: 'paper', msg: 'কাঁচি কাগজকে কেটে ফেলে' }
};

let rpsScores = { player: 0, comp: 0, draw: 0, streak: 0 };
let rpsIsPlaying = false;

function initRPS() {
  rpsScores.streak = 0;
  updateRPSScoreboard();
  resetRPSRound();
}

function updateRPSScoreboard() {
  document.getElementById('rps-score-player').innerText = toBnNum(rpsScores.player);
  document.getElementById('rps-score-comp').innerText = toBnNum(rpsScores.comp);
  document.getElementById('rps-score-draw').innerText = toBnNum(rpsScores.draw);
  document.getElementById('rps-streak-count').innerText = toBnNum(rpsScores.streak);

  const bestStreak = localStorage.getItem('bfg_best_rps_streak') || '0';
  document.getElementById('rps-best-streak').innerText = toBnNum(bestStreak);
}

function playRPSRound(playerChoiceKey) {
  if (rpsIsPlaying) return;
  rpsIsPlaying = true;
  playSound('tap');

  const pChoice = RPS_CHOICES[playerChoiceKey];
  const keys = ['rock', 'paper', 'scissors'];
  const compChoiceKey = keys[Math.floor(Math.random() * keys.length)];
  const cChoice = RPS_CHOICES[compChoiceKey];

  const pCircle = document.getElementById('rps-display-player');
  const cCircle = document.getElementById('rps-display-comp');
  const pLabel = document.getElementById('rps-label-player');
  const cLabel = document.getElementById('rps-label-comp');
  const outcomeTitle = document.getElementById('rps-outcome-title');
  const outcomeDesc = document.getElementById('rps-outcome-desc');

  // Disable buttons temporarily
  document.querySelectorAll('.rps-weapon-btn').forEach(btn => btn.disabled = true);

  // Shaking animation
  pCircle.className = 'rps-choice-circle shaking';
  cCircle.className = 'rps-choice-circle shaking';
  pCircle.innerText = '✊';
  cCircle.innerText = '✊';
  pLabel.innerText = 'লড়াই চলছে...';
  cLabel.innerText = 'লড়াই চলছে...';
  outcomeTitle.innerText = '৩... ২... ১... লড়াই!';
  outcomeDesc.innerText = 'কম্পিউটার তার চাল দিচ্ছে...';

  setTimeout(() => {
    pCircle.classList.remove('shaking');
    cCircle.classList.remove('shaking');

    pCircle.innerText = pChoice.emoji;
    cCircle.innerText = cChoice.emoji;
    pLabel.innerText = pChoice.name;
    cLabel.innerText = cChoice.name;

    // Check winner
    if (playerChoiceKey === compChoiceKey) {
      // Draw
      rpsScores.draw++;
      outcomeTitle.innerText = '🤝 ম্যাচ ড্র হয়েছে!';
      outcomeDesc.innerText = `দুজনেই "${pChoice.name}" বেছে নিয়েছেন।`;
      playSound('tap');
    } else if (pChoice.beats === compChoiceKey) {
      // Player won
      rpsScores.player++;
      rpsScores.streak++;
      pCircle.classList.add('winner-glow');
      outcomeTitle.innerText = '🎉 অভিনন্দন! আপনি জিতেছেন!';
      outcomeDesc.innerText = `${pChoice.msg}! চমৎকার চাল ছিল।`;
      playSound('win');

      // Save best streak & wins
      const currentWins = parseInt(localStorage.getItem('bfg_rps_wins') || '0', 10);
      localStorage.setItem('bfg_rps_wins', currentWins + 1);

      const bestStreak = parseInt(localStorage.getItem('bfg_best_rps_streak') || '0', 10);
      if (rpsScores.streak > bestStreak) {
        localStorage.setItem('bfg_best_rps_streak', rpsScores.streak);
      }
      updateHomeBestScores();
    } else {
      // Computer won
      rpsScores.comp++;
      rpsScores.streak = 0;
      cCircle.classList.add('winner-glow');
      outcomeTitle.innerText = '🤖 কম্পিউটার জিতেছে!';
      outcomeDesc.innerText = `${cChoice.msg}! পরবর্তী রাউন্ডে চেষ্টা করুন।`;
      playSound('wrong');
    }

    updateRPSScoreboard();
    document.querySelectorAll('.rps-weapon-btn').forEach(btn => btn.disabled = false);
    rpsIsPlaying = false;
  }, 600);
}

function resetRPSRound() {
  playSound('tap');
  const pCircle = document.getElementById('rps-display-player');
  const cCircle = document.getElementById('rps-display-comp');
  pCircle.className = 'rps-choice-circle';
  cCircle.className = 'rps-choice-circle';
  pCircle.innerText = '❓';
  cCircle.innerText = '❓';
  document.getElementById('rps-label-player').innerText = 'পছন্দ করুন';
  document.getElementById('rps-label-comp').innerText = 'অপেক্ষারত';
  document.getElementById('rps-outcome-title').innerText = 'আপনার চাল বেছে নিন!';
  document.getElementById('rps-outcome-desc').innerText = 'নিচের বাটনগুলোতে চাপ দিয়ে পাথর, কাগজ বা কাঁচি নির্বাচন করুন।';
  document.querySelectorAll('.rps-weapon-btn').forEach(btn => btn.disabled = false);
  rpsIsPlaying = false;
}

function resetRPSScoreboard() {
  playSound('tap');
  rpsScores = { player: 0, comp: 0, draw: 0, streak: 0 };
  updateRPSScoreboard();
  resetRPSRound();
}

// ====================================================================
// GAME 5: NUMBER GUESSING (সংখ্যা অনুমানের খেলা - ১ থেকে ১০০)
// ====================================================================
let guessSecretNumber = 50;
let guessAttempts = 0;
let guessGameOver = false;

function initNumberGuess() {
  playSound('tap');
  guessSecretNumber = Math.floor(Math.random() * 100) + 1;
  guessAttempts = 0;
  guessGameOver = false;

  document.getElementById('guess-attempt-count').innerText = '০ বার';
  const bestRecord = localStorage.getItem('bfg_best_guess');
  document.getElementById('guess-best-record').innerText = bestRecord ? `${toBnNum(bestRecord)} বার` : '-';

  const mysteryCircle = document.getElementById('mystery-display');
  mysteryCircle.innerText = '?';
  mysteryCircle.className = 'mystery-circle';
  document.getElementById('mystery-text').innerText = 'গোপন সংখ্যাটি লক করা আছে';

  const hintTitle = document.getElementById('hint-title');
  const hintMsg = document.getElementById('hint-msg');
  const hintIcon = document.getElementById('hint-icon');
  hintIcon.innerText = '💡';
  hintTitle.innerText = 'অনুমান শুরু করুন!';
  hintMsg.innerText = '১ থেকে ১০০ এর মধ্যে যেকোনো একটি সংখ্যা লিখুন।';

  const inputField = document.getElementById('guess-input-field');
  inputField.value = '৫০';
  inputField.disabled = false;
  document.getElementById('guess-submit-btn').disabled = false;

  const historyContainer = document.getElementById('guess-history-list');
  historyContainer.innerHTML = '<span class="history-empty">এখনো কোনো অনুমান করা হয়নি।</span>';
  document.getElementById('history-count').innerText = '০টি চাল';
}

function adjustGuessInput(delta) {
  if (guessGameOver) return;
  playSound('tap');
  const input = document.getElementById('guess-input-field');
  let currentVal = parseInt(input.value, 10);
  if (isNaN(currentVal)) currentVal = 50;
  currentVal = Math.min(100, Math.max(1, currentVal + delta));
  input.value = currentVal;
}

function submitNumberGuess() {
  if (guessGameOver) return;

  const input = document.getElementById('guess-input-field');
  const guess = parseInt(input.value, 10);

  if (isNaN(guess) || guess < 1 || guess > 100) {
    playSound('wrong');
    document.getElementById('hint-icon').innerText = '⚠️';
    document.getElementById('hint-title').innerText = 'ভুল ইনপুট!';
    document.getElementById('hint-msg').innerText = 'দয়া করে ১ থেকে ১০০ এর মধ্যে একটি বৈধ সংখ্যা লিখুন।';
    return;
  }

  guessAttempts++;
  document.getElementById('guess-attempt-count').innerText = `${toBnNum(guessAttempts)} বার`;
  document.getElementById('history-count').innerText = `${toBnNum(guessAttempts)}টি চাল`;

  const hintIcon = document.getElementById('hint-icon');
  const hintTitle = document.getElementById('hint-title');
  const hintMsg = document.getElementById('hint-msg');
  const historyList = document.getElementById('guess-history-list');

  // Remove empty placeholder
  const emptyPlaceholder = historyList.querySelector('.history-empty');
  if (emptyPlaceholder) emptyPlaceholder.remove();

  if (guess === guessSecretNumber) {
    // Win!
    guessGameOver = true;
    playSound('win');
    input.disabled = true;
    document.getElementById('guess-submit-btn').disabled = true;

    const mysteryCircle = document.getElementById('mystery-display');
    mysteryCircle.innerText = toBnNum(guessSecretNumber);
    mysteryCircle.classList.add('revealed');
    document.getElementById('mystery-text').innerText = '🎉 গোপন সংখ্যাটি উন্মোচিত হয়েছে!';

    hintIcon.innerText = '🎯';
    hintTitle.innerText = 'অভিনন্দন! একদম সঠিক সংখ্যা!';
    hintMsg.innerText = `আপনি মাত্র ${toBnNum(guessAttempts)} বার চেষ্টা করে সংখ্যাটি বের করেছেন!`;

    // Add to history
    const chip = document.createElement('span');
    chip.className = 'history-chip correct';
    chip.innerText = `#${toBnNum(guessAttempts)}: ${toBnNum(guess)} (সঠিক! 🎯)`;
    historyList.prepend(chip);

    // Save best record (lowest attempts)
    const prevBest = localStorage.getItem('bfg_best_guess');
    if (!prevBest || guessAttempts < parseInt(prevBest, 10)) {
      localStorage.setItem('bfg_best_guess', guessAttempts);
      document.getElementById('guess-best-record').innerText = `${toBnNum(guessAttempts)} বার`;
      hintMsg.innerText += ' 👑 এটি আপনার নতুন সেরা রেকর্ড!';
    }
    updateHomeBestScores();
  } else if (guess < guessSecretNumber) {
    // Too low
    playSound('tap');
    hintIcon.innerText = '🔼';
    hintTitle.innerText = `সংখ্যাটি আরও বড়! (${toBnNum(guess)} এর চেয়ে বড়)`;
    hintMsg.innerText = 'আরেকটু বড় সংখ্যা অনুমান করে আবার চেষ্টা করুন।';

    const chip = document.createElement('span');
    chip.className = 'history-chip low';
    chip.innerText = `#${toBnNum(guessAttempts)}: ${toBnNum(guess)} 🔼 আরও বড়`;
    historyList.prepend(chip);
  } else {
    // Too high
    playSound('tap');
    hintIcon.innerText = '🔽';
    hintTitle.innerText = `সংখ্যাটি আরও ছোট! (${toBnNum(guess)} এর চেয়ে ছোট)`;
    hintMsg.innerText = 'আরেকটু ছোট সংখ্যা অনুমান করে আবার চেষ্টা করুন।';

    const chip = document.createElement('span');
    chip.className = 'history-chip high';
    chip.innerText = `#${toBnNum(guessAttempts)}: ${toBnNum(guess)} 🔽 আরও ছোট`;
    historyList.prepend(chip);
  }
}

// ====================================================================
// GAME 6: MATH CHALLENGE (গণিত স্পিড চ্যালেঞ্জ)
// ====================================================================
let mathLevel = 'easy'; // 'easy', 'medium', 'hard'
let mathScore = 0;
let mathStreak = 0;
let mathCorrectCount = 0;
let mathTimerSeconds = 45;
let mathTimerInterval = null;
let mathIsActive = false;
let currentMathAnswer = 0;

function setMathLevel(lvl) {
  playSound('tap');
  mathLevel = lvl;
  document.getElementById('math-lvl-easy').classList.toggle('active', lvl === 'easy');
  document.getElementById('math-lvl-medium').classList.toggle('active', lvl === 'medium');
  document.getElementById('math-lvl-hard').classList.toggle('active', lvl === 'hard');
  restartMathChallenge();
}

function initMathChallenge() {
  restartMathChallenge();
}

function restartMathChallenge() {
  playSound('tap');
  clearInterval(mathTimerInterval);

  mathScore = 0;
  mathStreak = 0;
  mathCorrectCount = 0;
  mathTimerSeconds = 45;
  mathIsActive = true;

  document.getElementById('math-score-val').innerText = '০';
  document.getElementById('math-streak-val').innerText = '🔥 ০';
  document.getElementById('math-timer-val').innerText = `${toBnNum(mathTimerSeconds)} সে.`;
  document.getElementById('math-timer-bar').style.width = '100%';

  document.getElementById('math-result-card').style.display = 'none';
  document.getElementById('math-card-area').style.display = 'flex';
  document.getElementById('math-active-controls').style.display = 'flex';

  generateMathProblem();
  startMathTimer();
}

function startMathTimer() {
  clearInterval(mathTimerInterval);
  const totalSecs = 45;

  mathTimerInterval = setInterval(() => {
    if (!mathIsActive) return;
    mathTimerSeconds--;

    document.getElementById('math-timer-val').innerText = `${toBnNum(mathTimerSeconds)} সে.`;
    const pct = (mathTimerSeconds / totalSecs) * 100;
    document.getElementById('math-timer-bar').style.width = `${Math.max(0, pct)}%`;

    if (mathTimerSeconds <= 0) {
      endMathChallenge();
    }
  }, 1000);
}

function generateMathProblem() {
  let num1, num2, op, answer, questionText;

  if (mathLevel === 'easy') {
    // Only + and - up to 30
    op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      num1 = Math.floor(Math.random() * 25) + 3;
      num2 = Math.floor(Math.random() * 20) + 2;
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 30) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
    }
    questionText = `${toBnNum(num1)} ${op} ${toBnNum(num2)} = ?`;
  } else if (mathLevel === 'medium') {
    // +, -, and multiplication up to 10
    const ops = ['+', '-', '×'];
    op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '+') {
      num1 = Math.floor(Math.random() * 45) + 10;
      num2 = Math.floor(Math.random() * 45) + 5;
      answer = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 60) + 20;
      num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
      answer = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 10) + 2;
      num2 = Math.floor(Math.random() * 9) + 2;
      answer = num1 * num2;
    }
    questionText = `${toBnNum(num1)} ${op} ${toBnNum(num2)} = ?`;
  } else {
    // Hard: +, -, ×, and ÷ (clean division)
    const ops = ['+', '-', '×', '÷'];
    op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '+') {
      num1 = Math.floor(Math.random() * 80) + 20;
      num2 = Math.floor(Math.random() * 70) + 15;
      answer = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * 100) + 30;
      num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
      answer = num1 - num2;
    } else if (op === '×') {
      num1 = Math.floor(Math.random() * 12) + 3;
      num2 = Math.floor(Math.random() * 12) + 2;
      answer = num1 * num2;
    } else {
      // Clean division
      num2 = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * 10) + 2;
      num1 = num2 * answer;
    }
    questionText = `${toBnNum(num1)} ${op} ${toBnNum(num2)} = ?`;
  }

  currentMathAnswer = answer;
  document.getElementById('math-equation-text').innerText = questionText;

  // Generate 4 options
  const options = new Set([answer]);
  while (options.size < 4) {
    const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const candidate = answer + offset;
    if (candidate >= 0 && candidate !== answer) {
      options.add(candidate);
    }
  }

  const optArray = Array.from(options);
  shuffleArray(optArray);

  const container = document.getElementById('math-options-grid');
  container.innerHTML = '';

  optArray.forEach(optVal => {
    const btn = document.createElement('button');
    btn.className = 'math-opt-btn';
    btn.innerText = toBnNum(optVal);
    btn.onclick = () => selectMathOption(optVal, btn);
    container.appendChild(btn);
  });
}

function selectMathOption(chosen, btn) {
  if (!mathIsActive) return;

  const isCorrect = (chosen === currentMathAnswer);
  const feedbackBadge = document.getElementById('math-feedback-badge');
  const feedbackMsg = document.getElementById('math-feedback-msg');

  if (isCorrect) {
    playSound('correct');
    btn.classList.add('correct');
    mathCorrectCount++;
    mathStreak++;

    const bonus = Math.min(20, mathStreak * 2);
    const points = 10 + bonus;
    mathScore += points;

    document.getElementById('math-score-val').innerText = toBnNum(mathScore);
    document.getElementById('math-streak-val').innerText = `🔥 ${toBnNum(mathStreak)}`;

    feedbackMsg.innerText = `+${toBnNum(points)} পয়েন্ট!`;
    feedbackBadge.style.display = 'block';

    setTimeout(() => {
      feedbackBadge.style.display = 'none';
      if (mathIsActive) generateMathProblem();
    }, 250);
  } else {
    playSound('wrong');
    btn.classList.add('wrong');
    mathStreak = 0;
    document.getElementById('math-streak-val').innerText = '🔥 ০';

    // Highlight correct
    document.querySelectorAll('.math-opt-btn').forEach(b => {
      if (b.innerText === toBnNum(currentMathAnswer)) {
        b.classList.add('correct');
      }
    });

    setTimeout(() => {
      if (mathIsActive) generateMathProblem();
    }, 500);
  }
}

function endMathChallenge() {
  mathIsActive = false;
  clearInterval(mathTimerInterval);
  playSound('win');

  document.getElementById('math-card-area').style.display = 'none';
  document.getElementById('math-active-controls').style.display = 'none';

  const resultCard = document.getElementById('math-result-card');
  resultCard.style.display = 'block';

  document.getElementById('math-final-score').innerText = toBnNum(mathScore);
  document.getElementById('math-correct-count').innerText = `${toBnNum(mathCorrectCount)}টি`;

  const prevBest = parseInt(localStorage.getItem('bfg_best_math') || '0', 10);
  const newBest = Math.max(prevBest, mathScore);
  localStorage.setItem('bfg_best_math', newBest);
  document.getElementById('math-best-display').innerText = toBnNum(newBest);

  const greeting = document.getElementById('math-result-greeting');
  if (mathScore >= 200) {
    greeting.innerText = 'অসাধারণ! আপনি একজন গণিত জিনিয়াস!';
  } else if (mathScore >= 120) {
    greeting.innerText = 'দারুণ স্পিড ও নির্ভুল হিসাব!';
  } else if (mathScore >= 60) {
    greeting.innerText = 'ভালো পারফরম্যান্স! নিয়মিত চর্চায় আরও উন্নতি হবে।';
  } else {
    greeting.innerText = 'আবার চেষ্টা করুন এবং দ্রুত হিসাব করার দক্ষতা বাড়ান!';
  }

  updateHomeBestScores();
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
