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

function playSound(type, param) {
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
    } else if (type === 'eat') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.07);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'slide') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.linearRampToValueAtTime(460, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'tone' && typeof param === 'number') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(param, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
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
  } else if (gameType === 'snake') {
    initSnakeGame();
  } else if (gameType === '2048') {
    init2048();
  } else if (gameType === 'whack') {
    initWhackGame();
  } else if (gameType === 'numpuzzle') {
    initNumPuzzle();
  } else if (gameType === 'bubble') {
    initBubbleGame();
  } else if (gameType === 'colormem') {
    initColorMemory();
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

function openContactModal() {
  playSound('tap');
  document.getElementById('contact-modal').style.display = 'flex';
}

function closeContactModal() {
  playSound('tap');
  document.getElementById('contact-modal').style.display = 'none';
}

function handleContactSubmit(event) {
  event.preventDefault();
  playSound('win');
  const form = document.getElementById('contact-form');
  const successBox = document.getElementById('contact-success');
  if (form && successBox) {
    form.style.display = 'none';
    successBox.style.display = 'block';
  }
}

function resetContactForm() {
  playSound('tap');
  const form = document.getElementById('contact-form');
  const successBox = document.getElementById('contact-success');
  if (form && successBox) {
    form.reset();
    form.style.display = 'block';
    successBox.style.display = 'none';
  }
}

function openPrivacyModal() {
  playSound('tap');
  document.getElementById('privacy-modal').style.display = 'flex';
}

function closePrivacyModal() {
  playSound('tap');
  document.getElementById('privacy-modal').style.display = 'none';
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
  const query = (searchInput ? searchInput.value || '' : '').trim().toLowerCase();
  let visibleCount = 0;

  if (clearSearchBtn) clearSearchBtn.style.display = query ? 'block' : 'none';

  const cards = document.querySelectorAll('.game-card');
  cards.forEach(card => {
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

  if (gamesCountEl) gamesCountEl.innerText = `${toBnNum(visibleCount)}টি গেম`;
  if (noResultsEl) noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
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

  // Snake
  const bestSnake = localStorage.getItem('bfg_best_snake') || '0';
  const snakePreview = document.getElementById('preview-best-snake');
  if (snakePreview) {
    snakePreview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(bestSnake)}</strong>`;
  }

  // 2048
  const best2048 = localStorage.getItem('bfg_best_2048') || '0';
  const p2048Preview = document.getElementById('preview-best-2048');
  if (p2048Preview) {
    p2048Preview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(best2048)}</strong>`;
  }

  // Whack
  const bestWhack = localStorage.getItem('bfg_best_whack') || '0';
  const whackPreview = document.getElementById('preview-best-whack');
  if (whackPreview) {
    whackPreview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(bestWhack)}</strong>`;
  }

  // Num Puzzle
  const bestNumPuzzle = localStorage.getItem('bfg_best_numpuzzle');
  const numPuzzlePreview = document.getElementById('preview-best-numpuzzle');
  if (numPuzzlePreview) {
    numPuzzlePreview.innerHTML = `সেরা চাল: <strong>${bestNumPuzzle ? toBnNum(bestNumPuzzle) + ' চাল' : '-'}</strong>`;
  }

  // Bubble
  const bestBubble = localStorage.getItem('bfg_best_bubble') || '0';
  const bubblePreview = document.getElementById('preview-best-bubble');
  if (bubblePreview) {
    bubblePreview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(bestBubble)}</strong>`;
  }

  // Color Memory
  const bestColorMem = localStorage.getItem('bfg_best_colormem') || '0';
  const colorMemPreview = document.getElementById('preview-best-colormem');
  if (colorMemPreview) {
    colorMemPreview.innerHTML = `সর্বোচ্চ রাউন্ড: <strong>${toBnNum(bestColorMem)}</strong>`;
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

// ====================================================================
// GAME 7: SNAKE GAME (সাপের খেলা)
// ====================================================================
let snakeCanvas = null;
let snakeCtx = null;
let snakeGridSize = 18; // 18x18 cells
let snakeTileSize = 20; // 360x360 px
let snake = [];
let snakeDir = { x: 1, y: 0 };
let snakeNextDir = { x: 1, y: 0 };
let snakeFood = { x: 10, y: 10, isGolden: false };
let snakeScore = 0;
let snakeApplesCount = 0;
let snakeIsActive = false;
let snakeIsPaused = false;
let snakeLoopInterval = null;
let snakeSpeedMs = 130;

function initSnakeGame() {
  snakeCanvas = document.getElementById('snake-canvas');
  if (!snakeCanvas) return;
  snakeCtx = snakeCanvas.getContext('2d');

  // Setup Touch D-Pad buttons
  const setUp = document.getElementById('dpad-up');
  const setDown = document.getElementById('dpad-down');
  const setLeft = document.getElementById('dpad-left');
  const setRight = document.getElementById('dpad-right');

  if (setUp && !setUp.dataset.bound) {
    setUp.dataset.bound = 'true';
    setUp.addEventListener('click', () => changeSnakeDir(0, -1));
    setDown.addEventListener('click', () => changeSnakeDir(0, 1));
    setLeft.addEventListener('click', () => changeSnakeDir(-1, 0));
    setRight.addEventListener('click', () => changeSnakeDir(1, 0));
  }

  // Setup Touch swipe on canvas
  let touchStartX = 0;
  let touchStartY = 0;
  snakeCanvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  snakeCanvas.addEventListener('touchend', (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 25 || Math.abs(diffY) > 25) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        changeSnakeDir(diffX > 0 ? 1 : -1, 0);
      } else {
        changeSnakeDir(0, diffY > 0 ? 1 : -1);
      }
    }
  }, { passive: true });

  // Keyboard navigation for desktop/tablet
  window.addEventListener('keydown', (e) => {
    if (currentView !== 'snake' || !snakeIsActive) return;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeSnakeDir(0, -1);
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeSnakeDir(0, 1);
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeSnakeDir(-1, 0);
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeSnakeDir(1, 0);
    else if (e.key === ' ' || e.key === 'p' || e.key === 'P') togglePauseSnake();
  });

  restartSnakeGame();
}

function changeSnakeDir(x, y) {
  // Prevent 180-degree reversing
  if (snakeDir.x === -x && snakeDir.y === -y) return;
  snakeNextDir = { x, y };
}

function restartSnakeGame() {
  document.getElementById('snake-overlay').style.display = 'none';
  snakeScore = 0;
  snakeApplesCount = 0;
  snakeDir = { x: 1, y: 0 };
  snakeNextDir = { x: 1, y: 0 };
  snakeIsPaused = false;
  snakeIsActive = true;
  document.getElementById('snake-pause-text').innerText = '⏸️ বিরতি';

  // Starting snake body (length 3)
  snake = [
    { x: 6, y: 9 },
    { x: 5, y: 9 },
    { x: 4, y: 9 }
  ];

  spawnSnakeFood();
  updateSnakeUI();

  if (snakeLoopInterval) clearInterval(snakeLoopInterval);
  snakeLoopInterval = setInterval(snakeGameTick, snakeSpeedMs);
  drawSnake();
}

function spawnSnakeFood() {
  let valid = false;
  let newFood = { x: 0, y: 0, isGolden: false };

  while (!valid) {
    newFood.x = Math.floor(Math.random() * snakeGridSize);
    newFood.y = Math.floor(Math.random() * snakeGridSize);
    valid = !snake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
  }

  // 20% chance of golden bonus apple
  newFood.isGolden = (Math.random() < 0.2);
  snakeFood = newFood;
}

function snakeGameTick() {
  if (!snakeIsActive || snakeIsPaused) return;

  snakeDir = { ...snakeNextDir };
  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

  // Wall collision check
  if (head.x < 0 || head.x >= snakeGridSize || head.y < 0 || head.y >= snakeGridSize) {
    endSnakeGame();
    return;
  }

  // Self collision check
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    endSnakeGame();
    return;
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === snakeFood.x && head.y === snakeFood.y) {
    const points = snakeFood.isGolden ? 30 : 10;
    snakeScore += points;
    snakeApplesCount++;
    playSound('eat');
    spawnSnakeFood();
    updateSnakeUI();
  } else {
    snake.pop(); // Remove tail
  }

  drawSnake();
}

function drawSnake() {
  if (!snakeCtx) return;
  const w = snakeCanvas.width;
  const h = snakeCanvas.height;

  // Background
  snakeCtx.fillStyle = '#0f0e26';
  snakeCtx.fillRect(0, 0, w, h);

  // Subtle grid lines
  snakeCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  snakeCtx.lineWidth = 1;
  for (let i = 0; i <= snakeGridSize; i++) {
    snakeCtx.beginPath();
    snakeCtx.moveTo(i * snakeTileSize, 0);
    snakeCtx.lineTo(i * snakeTileSize, h);
    snakeCtx.stroke();

    snakeCtx.beginPath();
    snakeCtx.moveTo(0, i * snakeTileSize);
    snakeCtx.lineTo(w, i * snakeTileSize);
    snakeCtx.stroke();
  }

  // Draw Food
  const fx = snakeFood.x * snakeTileSize + snakeTileSize / 2;
  const fy = snakeFood.y * snakeTileSize + snakeTileSize / 2;
  const fr = snakeTileSize / 2 - 2;

  snakeCtx.beginPath();
  snakeCtx.arc(fx, fy, fr, 0, Math.PI * 2);
  snakeCtx.fillStyle = snakeFood.isGolden ? '#f59e0b' : '#ef4444';
  snakeCtx.fill();

  // Food highlight glow
  snakeCtx.beginPath();
  snakeCtx.arc(fx - 3, fy - 3, fr / 3, 0, Math.PI * 2);
  snakeCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  snakeCtx.fill();

  // Draw Snake
  snake.forEach((seg, idx) => {
    const sx = seg.x * snakeTileSize;
    const sy = seg.y * snakeTileSize;
    const isHead = idx === 0;

    snakeCtx.beginPath();
    snakeCtx.roundRect(sx + 1, sy + 1, snakeTileSize - 2, snakeTileSize - 2, isHead ? 6 : 4);
    snakeCtx.fillStyle = isHead ? '#10b981' : '#059669';
    snakeCtx.fill();

    // Eyes on head
    if (isHead) {
      snakeCtx.fillStyle = '#ffffff';
      const eyeR = 2.5;
      let e1x = sx + 5, e1y = sy + 5, e2x = sx + 15, e2y = sy + 5;
      if (snakeDir.x === 1) { e1x = sx + 14; e1y = sy + 5; e2x = sx + 14; e2y = sy + 15; }
      else if (snakeDir.x === -1) { e1x = sx + 5; e1y = sy + 5; e2x = sx + 5; e2y = sy + 15; }
      else if (snakeDir.y === 1) { e1x = sx + 5; e1y = sy + 14; e2x = sx + 15; e2y = sy + 14; }

      snakeCtx.beginPath();
      snakeCtx.arc(e1x, e1y, eyeR, 0, Math.PI * 2);
      snakeCtx.arc(e2x, e2y, eyeR, 0, Math.PI * 2);
      snakeCtx.fill();

      snakeCtx.fillStyle = '#000000';
      snakeCtx.beginPath();
      snakeCtx.arc(e1x, e1y, 1.2, 0, Math.PI * 2);
      snakeCtx.arc(e2x, e2y, 1.2, 0, Math.PI * 2);
      snakeCtx.fill();
    }
  });
}

function togglePauseSnake() {
  if (!snakeIsActive) return;
  snakeIsPaused = !snakeIsPaused;
  document.getElementById('snake-pause-text').innerText = snakeIsPaused ? '▶️ চালু করুন' : '⏸️ বিরতি';
  playSound('tap');
}

function endSnakeGame() {
  snakeIsActive = false;
  clearInterval(snakeLoopInterval);
  playSound('wrong');

  const prevBest = parseInt(localStorage.getItem('bfg_best_snake') || '0', 10);
  if (snakeScore > prevBest) {
    localStorage.setItem('bfg_best_snake', snakeScore);
  }
  updateSnakeUI();
  updateHomeBestScores();

  const overlay = document.getElementById('snake-overlay');
  overlay.style.display = 'flex';
  document.getElementById('snake-overlay-desc').innerText = `আপনার মোট স্কোর: ${toBnNum(snakeScore)} পয়েন্ট (${toBnNum(snakeApplesCount)}টি আপেল)।`;
}

function updateSnakeUI() {
  const bestSnake = localStorage.getItem('bfg_best_snake') || '0';
  document.getElementById('snake-score-val').innerText = toBnNum(snakeScore);
  document.getElementById('snake-best-val').innerText = toBnNum(bestSnake);
  document.getElementById('snake-apple-val').innerText = `${toBnNum(snakeApplesCount)}টি`;
}

// ====================================================================
// GAME 8: 2048 PUZZLE (২০৪৮ পাজল)
// ====================================================================
let p2048Grid = [];
let p2048Score = 0;
let p2048Won = false;
let p2048GameOver = false;

function init2048() {
  restart2048();

  const gridEl = document.getElementById('p2048-grid');
  if (gridEl && !gridEl.dataset.swipeBound) {
    gridEl.dataset.swipeBound = 'true';
    let touchStartX = 0;
    let touchStartY = 0;

    gridEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    gridEl.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        if (Math.abs(dx) > Math.abs(dy)) {
          move2048(dx > 0 ? 'right' : 'left');
        } else {
          move2048(dy > 0 ? 'down' : 'up');
        }
      }
    }, { passive: true });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (currentView !== '2048') return;
    if (e.key === 'ArrowUp') move2048('up');
    else if (e.key === 'ArrowDown') move2048('down');
    else if (e.key === 'ArrowLeft') move2048('left');
    else if (e.key === 'ArrowRight') move2048('right');
  });
}

function restart2048() {
  p2048Grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  p2048Score = 0;
  p2048Won = false;
  p2048GameOver = false;
  document.getElementById('p2048-overlay').style.display = 'none';

  spawnTile2048();
  spawnTile2048();
  render2048();
}

function spawnTile2048() {
  const emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (p2048Grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  p2048Grid[chosen.r][chosen.c] = Math.random() < 0.9 ? 2 : 4;
}

function render2048() {
  const gridEl = document.getElementById('p2048-grid');
  if (!gridEl) return;
  gridEl.innerHTML = '';

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('div');
      cell.className = 'p2048-cell';

      const val = p2048Grid[r][c];
      if (val > 0) {
        const tile = document.createElement('div');
        const tileClass = val <= 2048 ? `tile-${val}` : 'tile-super';
        tile.className = `p2048-tile ${tileClass}`;
        tile.innerText = toBnNum(val);
        cell.appendChild(tile);
      }
      gridEl.appendChild(cell);
    }
  }

  const best2048 = parseInt(localStorage.getItem('bfg_best_2048') || '0', 10);
  if (p2048Score > best2048) {
    localStorage.setItem('bfg_best_2048', p2048Score);
  }

  document.getElementById('p2048-score-val').innerText = toBnNum(p2048Score);
  document.getElementById('p2048-best-val').innerText = toBnNum(Math.max(p2048Score, best2048));
  updateHomeBestScores();
}

function move2048(direction) {
  if (p2048GameOver) return;
  let rotated = false;
  let changed = false;

  const slideRow = (row) => {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        p2048Score += arr[i];
        if (arr[i] === 2048 && !p2048Won) {
          trigger2048Win();
        }
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  };

  const oldGrid = JSON.stringify(p2048Grid);

  if (direction === 'left') {
    for (let r = 0; r < 4; r++) {
      p2048Grid[r] = slideRow(p2048Grid[r]);
    }
  } else if (direction === 'right') {
    for (let r = 0; r < 4; r++) {
      p2048Grid[r] = slideRow(p2048Grid[r].reverse()).reverse();
    }
  } else if (direction === 'up') {
    for (let c = 0; c < 4; c++) {
      let col = [p2048Grid[0][c], p2048Grid[1][c], p2048Grid[2][c], p2048Grid[3][c]];
      col = slideRow(col);
      for (let r = 0; r < 4; r++) p2048Grid[r][c] = col[r];
    }
  } else if (direction === 'down') {
    for (let c = 0; c < 4; c++) {
      let col = [p2048Grid[0][c], p2048Grid[1][c], p2048Grid[2][c], p2048Grid[3][c]];
      col = slideRow(col.reverse()).reverse();
      for (let r = 0; r < 4; r++) p2048Grid[r][c] = col[r];
    }
  }

  if (oldGrid !== JSON.stringify(p2048Grid)) {
    playSound('slide');
    spawnTile2048();
    render2048();
    check2048GameOver();
  }
}

function check2048GameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (p2048Grid[r][c] === 0) return;
      if (c < 3 && p2048Grid[r][c] === p2048Grid[r][c + 1]) return;
      if (r < 3 && p2048Grid[r][c] === p2048Grid[r + 1][c]) return;
    }
  }

  p2048GameOver = true;
  playSound('wrong');
  const overlay = document.getElementById('p2048-overlay');
  document.getElementById('p2048-overlay-icon').innerText = '😢';
  document.getElementById('p2048-overlay-title').innerText = 'চাল শেষ!';
  document.getElementById('p2048-overlay-desc').innerText = `কোনো খালি ঘর নেই। আপনার মোট স্কোর: ${toBnNum(p2048Score)}।`;
  document.getElementById('p2048-continue-btn').style.display = 'none';
  overlay.style.display = 'flex';
}

function trigger2048Win() {
  p2048Won = true;
  playSound('win');
  const overlay = document.getElementById('p2048-overlay');
  document.getElementById('p2048-overlay-icon').innerText = '🏆';
  document.getElementById('p2048-overlay-title').innerText = 'অভিনন্দন!';
  document.getElementById('p2048-overlay-desc').innerText = 'আপনি সফলভাবে ২০৪৮ তৈরি করেছেন!';
  document.getElementById('p2048-continue-btn').style.display = 'inline-block';
  overlay.style.display = 'flex';
}

function continue2048() {
  document.getElementById('p2048-overlay').style.display = 'none';
}

// ====================================================================
// GAME 9: WHACK-A-MOLE (ছুঁচো ধরা খেলা)
// ====================================================================
let whackScore = 0;
let whackHits = 0;
let whackTimeLeft = 30;
let whackTimerInterval = null;
let whackMoleInterval = null;
let whackIsActive = false;
let whackIsPaused = false;
let currentWhackMoleIndex = -1;

function initWhackGame() {
  const grid = document.getElementById('whack-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className = 'whack-hole';
    hole.id = `whoole-${i}`;
    hole.setAttribute('aria-label', `গর্ত ${i + 1}`);

    const mole = document.createElement('div');
    mole.className = 'mole-creature';
    mole.id = `wmole-${i}`;
    mole.innerText = '🐹';
    mole.onclick = () => hitMole(i);

    hole.appendChild(mole);
    grid.appendChild(hole);
  }

  restartWhackGame();
}

function restartWhackGame() {
  clearInterval(whackTimerInterval);
  clearInterval(whackMoleInterval);

  whackScore = 0;
  whackHits = 0;
  whackTimeLeft = 30;
  whackIsActive = true;
  whackIsPaused = false;
  currentWhackMoleIndex = -1;

  document.getElementById('whack-result-card').style.display = 'none';
  document.getElementById('whack-active-controls').style.display = 'flex';
  document.getElementById('whack-pause-text').innerText = '⏸️ বিরতি';

  updateWhackUI();

  // 30s Countdown timer
  whackTimerInterval = setInterval(() => {
    if (!whackIsActive || whackIsPaused) return;
    whackTimeLeft--;
    document.getElementById('whack-timer-val').innerText = `${toBnNum(whackTimeLeft)} সে.`;

    if (whackTimeLeft <= 0) {
      endWhackGame();
    }
  }, 1000);

  // Mole pop loop
  whackMoleInterval = setInterval(popRandomMole, 850);
}

function popRandomMole() {
  if (!whackIsActive || whackIsPaused) return;

  // Hide previous
  if (currentWhackMoleIndex !== -1) {
    const prevMole = document.getElementById(`wmole-${currentWhackMoleIndex}`);
    if (prevMole) {
      prevMole.classList.remove('up', 'whacked', 'golden');
      prevMole.innerText = '🐹';
    }
  }

  let nextIdx = Math.floor(Math.random() * 9);
  if (nextIdx === currentWhackMoleIndex) nextIdx = (nextIdx + 1) % 9;
  currentWhackMoleIndex = nextIdx;

  const moleEl = document.getElementById(`wmole-${nextIdx}`);
  if (!moleEl) return;

  const isGolden = Math.random() < 0.22;
  moleEl.classList.remove('whacked');
  moleEl.classList.toggle('golden', isGolden);
  moleEl.innerText = isGolden ? '⭐🐹' : '🐹';
  moleEl.dataset.golden = isGolden ? 'true' : 'false';
  moleEl.classList.add('up');

  // Mole hides after short window if not hit
  setTimeout(() => {
    if (moleEl.classList.contains('up') && !moleEl.classList.contains('whacked')) {
      moleEl.classList.remove('up');
    }
  }, 680);
}

function hitMole(idx) {
  if (!whackIsActive || whackIsPaused) return;
  const moleEl = document.getElementById(`wmole-${idx}`);
  if (!moleEl || !moleEl.classList.contains('up') || moleEl.classList.contains('whacked')) return;

  playSound('hit');
  const isGolden = moleEl.dataset.golden === 'true';
  const points = isGolden ? 30 : 10;

  whackScore += points;
  whackHits++;

  moleEl.classList.add('whacked');
  moleEl.innerText = isGolden ? '✨' : '💥';

  setTimeout(() => {
    moleEl.classList.remove('up', 'whacked', 'golden');
  }, 220);

  updateWhackUI();
}

function togglePauseWhack() {
  if (!whackIsActive) return;
  whackIsPaused = !whackIsPaused;
  document.getElementById('whack-pause-text').innerText = whackIsPaused ? '▶️ চালু করুন' : '⏸️ বিরতি';
  playSound('tap');
}

function endWhackGame() {
  whackIsActive = false;
  clearInterval(whackTimerInterval);
  clearInterval(whackMoleInterval);
  playSound('win');

  const prevBest = parseInt(localStorage.getItem('bfg_best_whack') || '0', 10);
  const newBest = Math.max(prevBest, whackScore);
  localStorage.setItem('bfg_best_whack', newBest);

  document.getElementById('whack-final-score').innerText = toBnNum(whackScore);
  document.getElementById('whack-final-hits').innerText = `${toBnNum(whackHits)}টি`;
  document.getElementById('whack-final-best').innerText = toBnNum(newBest);

  const greeting = document.getElementById('whack-result-greeting');
  if (whackScore >= 200) greeting.innerText = 'অসাধারণ রিফ্লেক্স! আপনি ছুঁচো ধরার মাস্টার!';
  else if (whackScore >= 120) greeting.innerText = 'চমৎকার স্পিড ও নির্ভুল ট্যাপ!';
  else greeting.innerText = 'ভালো চেষ্টা! বারবার চর্চায় স্কোর আরও বাড়বে।';

  document.getElementById('whack-active-controls').style.display = 'none';
  document.getElementById('whack-result-card').style.display = 'block';

  updateWhackUI();
  updateHomeBestScores();
}

function updateWhackUI() {
  const bestWhack = localStorage.getItem('bfg_best_whack') || '0';
  document.getElementById('whack-score-val').innerText = toBnNum(whackScore);
  document.getElementById('whack-best-val').innerText = toBnNum(bestWhack);
}

// ====================================================================
// GAME 10: 15 NUMBER PUZZLE (সংখ্যা সাজানোর ধাঁধা)
// ====================================================================
let numPuzzleTiles = [];
let numPuzzleMoves = 0;
let numPuzzleSeconds = 0;
let numPuzzleTimer = null;
let numPuzzleTimerStarted = false;
let numPuzzleSolved = false;

function initNumPuzzle() {
  restartNumPuzzle();
}

function restartNumPuzzle() {
  clearInterval(numPuzzleTimer);
  numPuzzleMoves = 0;
  numPuzzleSeconds = 0;
  numPuzzleTimerStarted = false;
  numPuzzleSolved = false;

  document.getElementById('numpuzzle-overlay').style.display = 'none';
  document.getElementById('numpuzzle-moves-val').innerText = '০';
  document.getElementById('numpuzzle-time-val').innerText = '০০:০০';

  const best = localStorage.getItem('bfg_best_numpuzzle');
  document.getElementById('numpuzzle-best-val').innerText = best ? `${toBnNum(best)} চাল` : '-';

  // Start with solved state 1-15, then 0
  numPuzzleTiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

  // Guaranteed 100% solvable shuffle by executing 160 random valid neighbor moves
  let blankIdx = 15;
  for (let i = 0; i < 160; i++) {
    const neighbors = [];
    const r = Math.floor(blankIdx / 4);
    const c = blankIdx % 4;

    if (r > 0) neighbors.push(blankIdx - 4);
    if (r < 3) neighbors.push(blankIdx + 4);
    if (c > 0) neighbors.push(blankIdx - 1);
    if (c < 3) neighbors.push(blankIdx + 1);

    const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
    numPuzzleTiles[blankIdx] = numPuzzleTiles[swapIdx];
    numPuzzleTiles[swapIdx] = 0;
    blankIdx = swapIdx;
  }

  renderNumPuzzle();
}

function renderNumPuzzle() {
  const grid = document.getElementById('numpuzzle-grid');
  if (!grid) return;
  grid.innerHTML = '';

  numPuzzleTiles.forEach((num, idx) => {
    const tile = document.createElement('div');
    tile.className = num === 0 ? 'num-tile empty' : 'num-tile';
    tile.innerText = num === 0 ? '' : toBnNum(num);
    if (num !== 0) {
      tile.onclick = () => slideNumTile(idx);
    }
    grid.appendChild(tile);
  });
}

function slideNumTile(idx) {
  if (numPuzzleSolved) return;
  const blankIdx = numPuzzleTiles.indexOf(0);

  const r1 = Math.floor(idx / 4), c1 = idx % 4;
  const r2 = Math.floor(blankIdx / 4), c2 = blankIdx % 4;

  const isAdjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  if (!isAdjacent) return;

  // Start stopwatch on first move
  if (!numPuzzleTimerStarted) {
    numPuzzleTimerStarted = true;
    numPuzzleTimer = setInterval(() => {
      numPuzzleSeconds++;
      const m = Math.floor(numPuzzleSeconds / 60);
      const s = numPuzzleSeconds % 60;
      const mStr = String(m).padStart(2, '0');
      const sStr = String(s).padStart(2, '0');
      document.getElementById('numpuzzle-time-val').innerText = `${toBnNum(mStr)}:${toBnNum(sStr)}`;
    }, 1000);
  }

  // Swap with blank
  numPuzzleTiles[blankIdx] = numPuzzleTiles[idx];
  numPuzzleTiles[idx] = 0;
  numPuzzleMoves++;
  playSound('slide');

  document.getElementById('numpuzzle-moves-val').innerText = toBnNum(numPuzzleMoves);
  renderNumPuzzle();
  checkNumPuzzleWin();
}

function checkNumPuzzleWin() {
  for (let i = 0; i < 15; i++) {
    if (numPuzzleTiles[i] !== i + 1) return;
  }
  if (numPuzzleTiles[15] !== 0) return;

  // Win!
  numPuzzleSolved = true;
  clearInterval(numPuzzleTimer);
  playSound('win');

  const prevBest = parseInt(localStorage.getItem('bfg_best_numpuzzle') || '999999', 10);
  if (numPuzzleMoves < prevBest) {
    localStorage.setItem('bfg_best_numpuzzle', numPuzzleMoves);
  }

  const overlay = document.getElementById('numpuzzle-overlay');
  document.getElementById('numpuzzle-win-details').innerText = `আপনি মাত্র ${toBnNum(numPuzzleMoves)} চালে এবং ${document.getElementById('numpuzzle-time-val').innerText} সময়ে ধাঁধা সমাধান করেছেন!`;
  overlay.style.display = 'flex';

  updateHomeBestScores();
}

// ====================================================================
// GAME 11: BUBBLE SHOOTER (বাবল শুটার)
// ====================================================================
let bubbleCanvas = null;
let bubbleCtx = null;
let bubbleScore = 0;
let bubbleRows = 5;
let bubbleCols = 10;
let bubbleRadius = 17;
let bubbleGrid = [];
let currentShooterBubble = null;
let nextShooterBubble = null;
let activeFlyingBubble = null;
let bubbleIsActive = false;
let bubbleIsPaused = false;
let bubbleShotsFired = 0;
let bubbleAnimReq = null;

const BUBBLE_COLORS = [
  { name: 'red', hex: '#ef4444', emoji: '🔴' },
  { name: 'blue', hex: '#3b82f6', emoji: '🔵' },
  { name: 'green', hex: '#10b981', emoji: '🟢' },
  { name: 'yellow', hex: '#f59e0b', emoji: '🟡' },
  { name: 'purple', hex: '#a855f7', emoji: '🟣' }
];

function getRandomBubbleColor() {
  return BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
}

function initBubbleGame() {
  bubbleCanvas = document.getElementById('bubble-canvas');
  if (!bubbleCanvas) return;
  bubbleCtx = bubbleCanvas.getContext('2d');

  if (!bubbleCanvas.dataset.bound) {
    bubbleCanvas.dataset.bound = 'true';

    const handleAimShoot = (e) => {
      if (!bubbleIsActive || bubbleIsPaused || activeFlyingBubble) return;
      const rect = bubbleCanvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      const x = (clientX - rect.left) * (bubbleCanvas.width / rect.width);
      const y = (clientY - rect.top) * (bubbleCanvas.height / rect.height);

      shootBubble(x, y);
    };

    bubbleCanvas.addEventListener('click', handleAimShoot);
    bubbleCanvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleAimShoot(e);
    }, { passive: false });
  }

  restartBubbleGame();
}

function restartBubbleGame() {
  if (bubbleAnimReq) cancelAnimationFrame(bubbleAnimReq);
  bubbleScore = 0;
  bubbleShotsFired = 0;
  bubbleIsActive = true;
  bubbleIsPaused = false;
  activeFlyingBubble = null;

  document.getElementById('bubble-overlay').style.display = 'none';
  document.getElementById('bubble-pause-text').innerText = '⏸️ বিরতি';

  // Build grid (rows 0 to 4 filled, remaining rows empty up to row 12)
  bubbleGrid = [];
  for (let r = 0; r < 12; r++) {
    bubbleGrid[r] = [];
    for (let c = 0; c < bubbleCols; c++) {
      if (r < 5) {
        bubbleGrid[r][c] = getRandomBubbleColor();
      } else {
        bubbleGrid[r][c] = null;
      }
    }
  }

  currentShooterBubble = getRandomBubbleColor();
  nextShooterBubble = getRandomBubbleColor();

  updateBubbleUI();
  bubbleGameLoop();
}

function shootBubble(targetX, targetY) {
  const startX = bubbleCanvas.width / 2;
  const startY = bubbleCanvas.height - 35;

  const dx = targetX - startX;
  const dy = targetY - startY;
  if (dy >= 0) return; // Don't shoot downwards

  const angle = Math.atan2(dy, dx);
  const speed = 14;

  activeFlyingBubble = {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: currentShooterBubble
  };

  currentShooterBubble = nextShooterBubble;
  nextShooterBubble = getRandomBubbleColor();
  bubbleShotsFired++;

  playSound('tap');
  updateBubbleUI();
}

function bubbleGameLoop() {
  if (!bubbleIsActive) return;

  if (!bubbleIsPaused) {
    updateBubblePhysics();
    drawBubbleScene();
  }

  bubbleAnimReq = requestAnimationFrame(bubbleGameLoop);
}

function updateBubblePhysics() {
  if (!activeFlyingBubble) return;

  activeFlyingBubble.x += activeFlyingBubble.vx;
  activeFlyingBubble.y += activeFlyingBubble.vy;

  // Bounce off left and right canvas walls
  if (activeFlyingBubble.x <= bubbleRadius) {
    activeFlyingBubble.x = bubbleRadius;
    activeFlyingBubble.vx = -activeFlyingBubble.vx;
  } else if (activeFlyingBubble.x >= bubbleCanvas.width - bubbleRadius) {
    activeFlyingBubble.x = bubbleCanvas.width - bubbleRadius;
    activeFlyingBubble.vx = -activeFlyingBubble.vx;
  }

  // Check collision with top boundary or bubbles in grid
  let hasCollided = false;

  if (activeFlyingBubble.y <= bubbleRadius + 10) {
    hasCollided = true;
  } else {
    // Check distance to all existing bubbles
    for (let r = 0; r < 12 && !hasCollided; r++) {
      for (let c = 0; c < bubbleCols && !hasCollided; c++) {
        if (bubbleGrid[r][c]) {
          const pos = getBubbleCoord(r, c);
          const dist = Math.hypot(activeFlyingBubble.x - pos.x, activeFlyingBubble.y - pos.y);
          if (dist < bubbleRadius * 1.85) {
            hasCollided = true;
          }
        }
      }
    }
  }

  if (hasCollided) {
    snapAndResolveBubble();
  }
}

function getBubbleCoord(r, c) {
  const isOdd = r % 2 === 1;
  const offset = isOdd ? bubbleRadius : 0;
  const x = c * (bubbleRadius * 2) + bubbleRadius + 10 + offset;
  const y = r * (bubbleRadius * 1.73) + bubbleRadius + 10;
  return { x, y };
}

function snapAndResolveBubble() {
  // Find nearest empty grid cell
  let bestR = 0, bestC = 0, minDist = Infinity;

  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < bubbleCols; c++) {
      if (!bubbleGrid[r][c]) {
        const pos = getBubbleCoord(r, c);
        const dist = Math.hypot(activeFlyingBubble.x - pos.x, activeFlyingBubble.y - pos.y);
        if (dist < minDist) {
          minDist = dist;
          bestR = r;
          bestC = c;
        }
      }
    }
  }

  bubbleGrid[bestR][bestC] = activeFlyingBubble.color;
  const landedColor = activeFlyingBubble.color;
  activeFlyingBubble = null;

  // Match-3 Flood Fill
  const matches = findBubbleCluster(bestR, bestC, landedColor.name);
  if (matches.length >= 3) {
    playSound('pop');
    matches.forEach(m => {
      bubbleGrid[m.r][m.c] = null;
    });
    bubbleScore += matches.length * 15;

    // Drop disconnected floating bubbles
    dropFloatingBubbles();
  }

  // Advance rows every 6 shots
  if (bubbleShotsFired % 6 === 0) {
    advanceBubbleRows();
  }

  // Check Game Over (any bubble at row 10 or below)
  for (let c = 0; c < bubbleCols; c++) {
    if (bubbleGrid[10][c] || bubbleGrid[11][c]) {
      endBubbleGame();
      return;
    }
  }

  updateBubbleUI();
}

function findBubbleCluster(startR, startC, targetColorName) {
  const visited = Array.from({ length: 12 }, () => Array(bubbleCols).fill(false));
  const queue = [{ r: startR, c: startC }];
  const cluster = [];
  visited[startR][startC] = true;

  while (queue.length > 0) {
    const { r, c } = queue.shift();
    cluster.push({ r, c });

    const neighbors = getNeighbors(r, c);
    neighbors.forEach(nb => {
      if (!visited[nb.r][nb.c] && bubbleGrid[nb.r][nb.c] && bubbleGrid[nb.r][nb.c].name === targetColorName) {
        visited[nb.r][nb.c] = true;
        queue.push(nb);
      }
    });
  }

  return cluster;
}

function getNeighbors(r, c) {
  const isOdd = r % 2 === 1;
  const diffs = isOdd
    ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];

  const res = [];
  diffs.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 12 && nc >= 0 && nc < bubbleCols) {
      res.push({ r: nr, c: nc });
    }
  });
  return res;
}

function dropFloatingBubbles() {
  const connected = Array.from({ length: 12 }, () => Array(bubbleCols).fill(false));
  const queue = [];

  // Top row anchors
  for (let c = 0; c < bubbleCols; c++) {
    if (bubbleGrid[0][c]) {
      connected[0][c] = true;
      queue.push({ r: 0, c });
    }
  }

  while (queue.length > 0) {
    const { r, c } = queue.shift();
    getNeighbors(r, c).forEach(nb => {
      if (!connected[nb.r][nb.c] && bubbleGrid[nb.r][nb.c]) {
        connected[nb.r][nb.c] = true;
        queue.push(nb);
      }
    });
  }

  let droppedCount = 0;
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < bubbleCols; c++) {
      if (bubbleGrid[r][c] && !connected[r][c]) {
        bubbleGrid[r][c] = null;
        droppedCount++;
      }
    }
  }
  if (droppedCount > 0) {
    bubbleScore += droppedCount * 25;
  }
}

function advanceBubbleRows() {
  for (let r = 11; r > 0; r--) {
    bubbleGrid[r] = [...bubbleGrid[r - 1]];
  }
  bubbleGrid[0] = [];
  for (let c = 0; c < bubbleCols; c++) {
    bubbleGrid[0][c] = getRandomBubbleColor();
  }
}

function drawBubbleScene() {
  if (!bubbleCtx) return;
  const w = bubbleCanvas.width;
  const h = bubbleCanvas.height;

  bubbleCtx.fillStyle = '#0a091a';
  bubbleCtx.fillRect(0, 0, w, h);

  // Danger threshold line
  bubbleCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
  bubbleCtx.lineWidth = 2;
  bubbleCtx.setLineDash([6, 6]);
  bubbleCtx.beginPath();
  bubbleCtx.moveTo(0, 10 * (bubbleRadius * 1.73) + 10);
  bubbleCtx.lineTo(w, 10 * (bubbleRadius * 1.73) + 10);
  bubbleCtx.stroke();
  bubbleCtx.setLineDash([]);

  // Draw Grid Bubbles
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < bubbleCols; c++) {
      const bubble = bubbleGrid[r][c];
      if (bubble) {
        const { x, y } = getBubbleCoord(r, c);
        drawSingleBubble(x, y, bubble.hex);
      }
    }
  }

  // Draw Flying Bubble
  if (activeFlyingBubble) {
    drawSingleBubble(activeFlyingBubble.x, activeFlyingBubble.y, activeFlyingBubble.color.hex);
  }

  // Draw Shooter Base & Current Bubble
  const shootX = w / 2;
  const shootY = h - 35;
  bubbleCtx.fillStyle = '#1c1a3b';
  bubbleCtx.beginPath();
  bubbleCtx.arc(shootX, shootY, bubbleRadius + 6, 0, Math.PI * 2);
  bubbleCtx.fill();
  bubbleCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  bubbleCtx.stroke();

  if (currentShooterBubble) {
    drawSingleBubble(shootX, shootY, currentShooterBubble.hex);
  }
}

function drawSingleBubble(x, y, colorHex) {
  bubbleCtx.beginPath();
  bubbleCtx.arc(x, y, bubbleRadius, 0, Math.PI * 2);
  bubbleCtx.fillStyle = colorHex;
  bubbleCtx.fill();

  // Glass shine reflection
  bubbleCtx.beginPath();
  bubbleCtx.arc(x - 4, y - 4, bubbleRadius / 2.8, 0, Math.PI * 2);
  bubbleCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  bubbleCtx.fill();
}

function togglePauseBubble() {
  if (!bubbleIsActive) return;
  bubbleIsPaused = !bubbleIsPaused;
  document.getElementById('bubble-pause-text').innerText = bubbleIsPaused ? '▶️ চালু করুন' : '⏸️ বিরতি';
  playSound('tap');
}

function endBubbleGame() {
  bubbleIsActive = false;
  if (bubbleAnimReq) cancelAnimationFrame(bubbleAnimReq);
  playSound('wrong');

  const prevBest = parseInt(localStorage.getItem('bfg_best_bubble') || '0', 10);
  const newBest = Math.max(prevBest, bubbleScore);
  localStorage.setItem('bfg_best_bubble', newBest);

  const overlay = document.getElementById('bubble-overlay');
  document.getElementById('bubble-overlay-desc').innerText = `বাবল নিচে পৌঁছে গেছে! আপনার মোট স্কোর: ${toBnNum(bubbleScore)}।`;
  overlay.style.display = 'flex';

  updateBubbleUI();
  updateHomeBestScores();
}

function updateBubbleUI() {
  const bestBubble = localStorage.getItem('bfg_best_bubble') || '0';
  document.getElementById('bubble-score-val').innerText = toBnNum(bubbleScore);
  document.getElementById('bubble-best-val').innerText = toBnNum(bestBubble);
  const previewEl = document.getElementById('bubble-next-preview');
  if (previewEl && nextShooterBubble) {
    previewEl.innerText = nextShooterBubble.emoji;
  }
}

// ====================================================================
// GAME 12: COLOR MEMORY CHALLENGE (রঙের মেমোরি / Simon)
// ====================================================================
let colorSequence = [];
let playerColorStep = 0;
let colorRound = 1;
let colorIsPlayerTurn = false;
let colorIsPlayingSequence = false;
const COLOR_PAD_FREQS = [329.63, 440.00, 554.37, 659.25]; // E4, A4, C#5, E5

function initColorMemory() {
  restartColorMemory();
}

function restartColorMemory() {
  colorSequence = [];
  playerColorStep = 0;
  colorRound = 1;
  colorIsPlayerTurn = false;
  colorIsPlayingSequence = false;

  document.getElementById('colormem-result-card').style.display = 'none';
  document.getElementById('colormem-active-controls').style.display = 'flex';
  document.getElementById('colormem-round-val').innerText = '১';
  document.getElementById('colormem-hub-score').innerText = '১';

  const bestRound = localStorage.getItem('bfg_best_colormem') || '0';
  document.getElementById('colormem-best-val').innerText = toBnNum(bestRound);
  document.getElementById('colormem-status-text').innerText = '▶️ "শুরু করুন" বাটনে চাপ দিন';
}

function startColorMemory() {
  document.getElementById('colormem-active-controls').style.display = 'none';
  colorSequence = [];
  colorRound = 1;
  nextColorRound();
}

function nextColorRound() {
  playerColorStep = 0;
  colorIsPlayerTurn = false;
  colorSequence.push(Math.floor(Math.random() * 4));

  document.getElementById('colormem-round-val').innerText = toBnNum(colorRound);
  document.getElementById('colormem-hub-score').innerText = toBnNum(colorRound);
  document.getElementById('colormem-status-text').innerText = '👀 সুর ও আলোর ক্রমটি লক্ষ্য করুন...';

  playColorSequence();
}

function playColorSequence() {
  colorIsPlayingSequence = true;
  let idx = 0;

  const playStep = () => {
    if (idx >= colorSequence.length) {
      colorIsPlayingSequence = false;
      colorIsPlayerTurn = true;
      document.getElementById('colormem-status-text').innerText = '👉 এখন আপনার পালা! ক্রমটি মনে করে ট্যাপ করুন';
      return;
    }

    const padIdx = colorSequence[idx];
    flashColorPad(padIdx);
    idx++;
    setTimeout(playStep, 600);
  };

  setTimeout(playStep, 400);
}

function flashColorPad(padIdx) {
  const pad = document.getElementById(`cpad-${padIdx}`);
  if (!pad) return;

  pad.classList.add('lit');
  playSound('tone', COLOR_PAD_FREQS[padIdx]);

  setTimeout(() => {
    pad.classList.remove('lit');
  }, 320);
}

function handleColorPadClick(padIdx) {
  if (!colorIsPlayerTurn || colorIsPlayingSequence) return;

  flashColorPad(padIdx);

  if (padIdx === colorSequence[playerColorStep]) {
    playerColorStep++;
    if (playerColorStep === colorSequence.length) {
      // Completed round!
      colorIsPlayerTurn = false;
      colorRound++;
      document.getElementById('colormem-status-text').innerText = '🎉 চমৎকার! পরবর্তী রাউন্ড আসছে...';
      playSound('correct');

      const prevBest = parseInt(localStorage.getItem('bfg_best_colormem') || '0', 10);
      if (colorRound - 1 > prevBest) {
        localStorage.setItem('bfg_best_colormem', colorRound - 1);
        document.getElementById('colormem-best-val').innerText = toBnNum(colorRound - 1);
      }

      setTimeout(nextColorRound, 1000);
    }
  } else {
    // Mistake
    endColorMemory();
  }
}

function endColorMemory() {
  colorIsPlayerTurn = false;
  playSound('wrong');

  const achieved = colorRound - 1;
  const prevBest = parseInt(localStorage.getItem('bfg_best_colormem') || '0', 10);
  const newBest = Math.max(prevBest, achieved);
  localStorage.setItem('bfg_best_colormem', newBest);

  document.getElementById('colormem-final-round').innerText = toBnNum(achieved);
  const greeting = document.getElementById('colormem-result-greeting');
  if (achieved >= 10) greeting.innerText = 'অসাধারণ স্মৃতিশক্তি! আপনি একজন কালার মেমোরি চ্যাম্পিয়ন!';
  else if (achieved >= 5) greeting.innerText = 'দারুণ মনোযোগ ও স্মৃতিশক্তি!';
  else greeting.innerText = 'ভালো চেষ্টা করেছেন! বারবার খেললে স্মৃতিশক্তি আরও প্রখর হবে।';

  document.getElementById('colormem-result-card').style.display = 'block';
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

  // Close modals when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.style.display = 'none';
    }
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
    }
  });

  // Push initial state
  if (history.pushState) {
    history.pushState({ page: 'home' }, '');
  }
});

// ==================== PWA Service Worker & Install Logic ====================
let deferredInstallPrompt = null;

// Register Service Worker on window load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('Bangla Fun Games Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('Bangla Fun Games Service Worker registration note:', err);
      });
  });
}

// Capture Android / Chrome PWA install trigger
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Reveal the install buttons
  const navBtn = document.getElementById('pwa-install-nav-btn');
  if (navBtn) navBtn.style.display = 'inline-flex';

  const banner = document.getElementById('pwa-install-banner');
  if (banner && localStorage.getItem('bfg_pwa_banner_dismissed') !== 'true') {
    banner.style.display = 'flex';
  }
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const navBtn = document.getElementById('pwa-install-nav-btn');
  if (navBtn) navBtn.style.display = 'none';

  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.style.display = 'none';

  showPwaToast('🎉 বাংলা ফান গেমস অ্যাপ সফলভাবে ইনস্টল হয়েছে!');
});

function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showPwaToast('📲 অ্যাপ ইনস্টল শুরু হয়েছে...');
      }
      deferredInstallPrompt = null;
    });
  } else {
    // If browser doesn't support automatic prompt or on standalone/desktop, show guide modal
    openPwaGuideModal();
  }
}

function dismissPwaBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('bfg_pwa_banner_dismissed', 'true');
}

function openPwaGuideModal() {
  const modal = document.getElementById('pwa-guide-modal');
  if (modal) modal.style.display = 'flex';
}

function closePwaGuideModal() {
  const modal = document.getElementById('pwa-guide-modal');
  if (modal) modal.style.display = 'none';
}

function showPwaToast(message) {
  let toast = document.getElementById('pwa-toast-el');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pwa-toast-el';
    toast.className = 'pwa-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

