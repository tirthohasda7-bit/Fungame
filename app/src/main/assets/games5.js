/**
 * Bangla Fun Games - 5 New Games Engine (games5.js)
 * Pure Vanilla JavaScript & HTML5 Canvas
 * 1. Endless Runner (অন্তহীন দৌড়)
 * 2. Traffic Racer (ট্রাফিক রেসার)
 * 3. Tower Stack (টাওয়ার স্ট্যাক)
 * 4. Fruit Slice (ফ্রুট স্লাইস)
 * 5. Brick Breaker (ব্রিক ব্রেকার)
 */

// Helper to ensure HiDPI sharp rendering
function setupSharpCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, dpr, width, height };
}

// Convert Bengali numerals
function toBnNum(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, d => bnDigits[d]);
}

// Global cleanup: stop all active animation loops and timers across all 5 games
function stopAllGames5() {
  if (runnerAnimId) { cancelAnimationFrame(runnerAnimId); runnerAnimId = null; }
  runnerState = 'IDLE';

  if (trafficAnimId) { cancelAnimationFrame(trafficAnimId); trafficAnimId = null; }
  trafficState = 'IDLE';
  trafficHoldLeft = false;
  trafficHoldRight = false;
  trafficBoost = false;

  if (stackAnimId) { cancelAnimationFrame(stackAnimId); stackAnimId = null; }
  stackState = 'IDLE';

  if (fruitAnimId) { cancelAnimationFrame(fruitAnimId); fruitAnimId = null; }
  if (fruitTimerId) { clearInterval(fruitTimerId); fruitTimerId = null; }
  fruitState = 'IDLE';
  fruitIsSwiping = false;

  if (brickAnimId) { cancelAnimationFrame(brickAnimId); brickAnimId = null; }
  brickState = 'IDLE';
  brickHoldLeft = false;
  brickHoldRight = false;
}

// Update home best scores for the 5 new games
function updateHomeBestScores5() {
  const bestRunner = localStorage.getItem('bfg_best_runner') || '0';
  const runnerPreview = document.getElementById('preview-best-runner');
  if (runnerPreview) runnerPreview.innerHTML = `সেরা দূরত্ব: <strong>${toBnNum(bestRunner)} মি.</strong>`;

  const bestTraffic = localStorage.getItem('bfg_best_traffic') || '0';
  const trafficPreview = document.getElementById('preview-best-traffic');
  if (trafficPreview) trafficPreview.innerHTML = `সেরা দূরত্ব: <strong>${toBnNum(bestTraffic)} মি.</strong>`;

  const bestStack = localStorage.getItem('bfg_best_stack') || '0';
  const stackPreview = document.getElementById('preview-best-stack');
  if (stackPreview) stackPreview.innerHTML = `সর্বোচ্চ তলা: <strong>${toBnNum(bestStack)}</strong>`;

  const bestFruit = localStorage.getItem('bfg_best_fruitslice') || '0';
  const fruitPreview = document.getElementById('preview-best-fruitslice');
  if (fruitPreview) fruitPreview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(bestFruit)}</strong>`;

  const bestBrick = localStorage.getItem('bfg_best_brick') || '0';
  const brickPreview = document.getElementById('preview-best-brick');
  if (brickPreview) brickPreview.innerHTML = `সেরা স্কোর: <strong>${toBnNum(bestBrick)}</strong>`;
}

// ============================================================================
// GAME 1: ENDLESS RUNNER (অন্তহীন দৌড়)
// ============================================================================
let runnerAnimId = null;
let runnerState = 'IDLE'; // 'IDLE', 'RUNNING', 'PAUSED', 'GAMEOVER'
let runnerDist = 0;
let runnerCoins = 0;
let runnerSpeed = 5;
let runnerPlayer = null;
let runnerObstacles = [];
let runnerCoinItems = [];
let runnerParticles = [];
let runnerBgOffset = 0;
let runnerSlideTimer = null;

function initRunnerGame() {
  const canvas = document.getElementById('runner-canvas');
  if (!canvas) return;
  setupSharpCanvas(canvas, 480, 280);

  const jumpBtn = document.getElementById('runner-jump-btn');
  const slideBtn = document.getElementById('runner-slide-btn');

  if (jumpBtn && !jumpBtn.dataset.bound) {
    jumpBtn.dataset.bound = 'true';
    jumpBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      jumpRunner();
    });
  }

  if (slideBtn && !slideBtn.dataset.bound) {
    slideBtn.dataset.bound = 'true';
    const startSlide = (e) => {
      e.preventDefault();
      slideRunner(true);
    };
    const endSlide = (e) => {
      e.preventDefault();
      slideRunner(false);
    };
    slideBtn.addEventListener('pointerdown', startSlide);
    slideBtn.addEventListener('pointerup', endSlide);
    slideBtn.addEventListener('pointerleave', endSlide);
    slideBtn.addEventListener('pointercancel', endSlide);
  }

  if (!canvas.dataset.bound) {
    canvas.dataset.bound = 'true';
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY < rect.height * 0.55) {
        jumpRunner();
      } else {
        slideRunner(true);
        if (runnerSlideTimer) clearTimeout(runnerSlideTimer);
        runnerSlideTimer = setTimeout(() => slideRunner(false), 450);
      }
    });
  }

  if (!window.runnerKeyBound) {
    window.runnerKeyBound = true;
    window.addEventListener('keydown', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'runner') return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jumpRunner();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        slideRunner(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'runner') return;
      if (e.code === 'ArrowDown') {
        slideRunner(false);
      }
    });
  }

  restartRunnerGame();
}

function restartRunnerGame() {
  if (runnerAnimId) cancelAnimationFrame(runnerAnimId);
  const overlay = document.getElementById('runner-overlay');
  if (overlay) overlay.style.display = 'none';

  const pauseBtn = document.getElementById('runner-pause-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';

  const bestVal = localStorage.getItem('bfg_best_runner') || '0';
  const bestEl = document.getElementById('runner-best-val');
  if (bestEl) bestEl.innerText = `${toBnNum(bestVal)} মি.`;

  runnerDist = 0;
  runnerCoins = 0;
  runnerSpeed = 5;
  runnerObstacles = [];
  runnerCoinItems = [];
  runnerParticles = [];
  runnerBgOffset = 0;

  runnerPlayer = {
    x: 60,
    y: 200,
    w: 32,
    h: 46,
    baseH: 46,
    slideH: 22,
    vy: 0,
    gravity: 0.62,
    jumpForce: -11.5,
    isGrounded: true,
    jumpCount: 0,
    isSliding: false,
    animFrame: 0
  };

  runnerState = 'RUNNING';
  updateRunnerStats();
  runnerLoop();
}

function jumpRunner() {
  if (runnerState !== 'RUNNING' || !runnerPlayer) return;
  if (runnerPlayer.jumpCount < 2) {
    runnerPlayer.vy = runnerPlayer.jumpForce;
    runnerPlayer.jumpCount++;
    runnerPlayer.isGrounded = false;
    if (runnerPlayer.isSliding) {
      runnerPlayer.isSliding = false;
      runnerPlayer.h = runnerPlayer.baseH;
    }
    if (typeof playSound === 'function') playSound('tap');
    createRunnerDust(runnerPlayer.x + 16, runnerPlayer.y + runnerPlayer.h);
  }
}

function slideRunner(active) {
  if (runnerState !== 'RUNNING' || !runnerPlayer) return;
  if (!runnerPlayer.isGrounded && active) return; // Only slide on ground
  runnerPlayer.isSliding = active;
  if (active) {
    runnerPlayer.h = runnerPlayer.slideH;
    runnerPlayer.y = 246 - runnerPlayer.slideH;
    if (typeof playSound === 'function') playSound('slide');
  } else {
    runnerPlayer.h = runnerPlayer.baseH;
    runnerPlayer.y = 246 - runnerPlayer.baseH;
  }
}

function pauseRunnerGame() {
  if (runnerState === 'RUNNING') {
    runnerState = 'PAUSED';
    const pauseBtn = document.getElementById('runner-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>▶ চালু করুন</span>';
  } else if (runnerState === 'PAUSED') {
    runnerState = 'RUNNING';
    const pauseBtn = document.getElementById('runner-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';
    runnerLoop();
  }
}

function createRunnerDust(x, y) {
  for (let i = 0; i < 5; i++) {
    runnerParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 3 - runnerSpeed * 0.4,
      vy: (Math.random() - 0.7) * 2,
      radius: Math.random() * 3 + 2,
      alpha: 1,
      color: '#94a3b8'
    });
  }
}

function runnerLoop() {
  if (runnerState !== 'RUNNING') return;

  const canvas = document.getElementById('runner-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 480;
  const H = 280;
  const groundY = 246;

  ctx.clearRect(0, 0, W, H);

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#0a0d24');
  skyGrad.addColorStop(0.6, '#1e1b4b');
  skyGrad.addColorStop(1, '#312e81');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, groundY);

  // Glowing Moon
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(410, 48, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(410, 48, 28, 0, Math.PI * 2);
  ctx.fill();

  // Scrolling mountains
  runnerBgOffset = (runnerBgOffset + runnerSpeed * 0.25) % 480;
  ctx.fillStyle = 'rgba(49, 46, 129, 0.5)';
  for (let i = -1; i < 2; i++) {
    const ox = i * 480 - runnerBgOffset;
    ctx.beginPath();
    ctx.moveTo(ox, groundY);
    ctx.lineTo(ox + 120, groundY - 70);
    ctx.lineTo(ox + 260, groundY - 110);
    ctx.lineTo(ox + 400, groundY - 60);
    ctx.lineTo(ox + 480, groundY);
    ctx.fill();
  }

  // Scrolling ground
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Ground dash lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;
  const dashOffset = (runnerDist * 4) % 40;
  for (let x = -dashOffset; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, groundY + 12);
    ctx.lineTo(x + 20, groundY + 12);
    ctx.stroke();
  }

  // Player physics
  if (!runnerPlayer.isGrounded) {
    runnerPlayer.vy += runnerPlayer.gravity;
    runnerPlayer.y += runnerPlayer.vy;
    // Cap ceiling
    if (runnerPlayer.y < 15) {
      runnerPlayer.y = 15;
      runnerPlayer.vy = 0;
    }
  }

  if (runnerPlayer.y >= groundY - runnerPlayer.h) {
    runnerPlayer.y = groundY - runnerPlayer.h;
    runnerPlayer.vy = 0;
    runnerPlayer.isGrounded = true;
    runnerPlayer.jumpCount = 0;
  }

  // Distance & speed scaling
  runnerDist += Math.round(runnerSpeed * 0.15);
  runnerSpeed = Math.min(9.5, 5 + Math.floor(runnerDist / 260) * 0.45);

  // Obstacle Spawning with safe intervals
  const minObsDist = Math.max(180, 260 - runnerSpeed * 8);
  const lastObs = runnerObstacles[runnerObstacles.length - 1];
  if ((!lastObs || lastObs.x < W - minObsDist) && Math.random() < 0.02) {
    const isBird = Math.random() < 0.32 && runnerDist > 80;
    if (isBird) {
      runnerObstacles.push({
        x: W + 20,
        y: groundY - 60,
        w: 32,
        h: 22,
        type: 'bird'
      });
    } else {
      const isHigh = Math.random() < 0.28;
      runnerObstacles.push({
        x: W + 20,
        y: isHigh ? groundY - 46 : groundY - 32,
        w: 26,
        h: isHigh ? 46 : 32,
        type: 'box'
      });
    }
  }

  // Coin Spawning
  const lastCoin = runnerCoinItems[runnerCoinItems.length - 1];
  if ((!lastCoin || lastCoin.x < W - 90) && Math.random() < 0.035) {
    const coinY = Math.random() < 0.5 ? groundY - 30 : groundY - 75;
    runnerCoinItems.push({
      x: W + 20,
      y: coinY,
      radius: 9,
      collected: false
    });
  }

  // Draw & update coins
  for (let i = runnerCoinItems.length - 1; i >= 0; i--) {
    const c = runnerCoinItems[i];
    c.x -= runnerSpeed;

    // Collection check
    if (!c.collected &&
        c.x + c.radius > runnerPlayer.x &&
        c.x - c.radius < runnerPlayer.x + runnerPlayer.w &&
        c.y + c.radius > runnerPlayer.y &&
        c.y - c.radius < runnerPlayer.y + runnerPlayer.h) {
      c.collected = true;
      runnerCoins++;
      if (typeof playSound === 'function') playSound('eat');
      for (let p = 0; p < 7; p++) {
        runnerParticles.push({
          x: c.x, y: c.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 3 + 1,
          alpha: 1,
          color: '#fbbf24'
        });
      }
    }

    if (!c.collected) {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (c.x < -20 || c.collected) {
      runnerCoinItems.splice(i, 1);
    }
  }

  // Draw & update obstacles
  for (let i = runnerObstacles.length - 1; i >= 0; i--) {
    const ob = runnerObstacles[i];
    ob.x -= runnerSpeed;

    if (ob.type === 'bird') {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(ob.x + 16, ob.y + 11, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      const wingY = Math.sin(Date.now() * 0.018) * 8;
      ctx.beginPath();
      ctx.moveTo(ob.x + 10, ob.y + 11);
      ctx.lineTo(ob.x + 16, ob.y + wingY);
      ctx.lineTo(ob.x + 22, ob.y + 11);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 2;
      ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(ob.x + 3, ob.y + 4, ob.w - 6, 5);
    }

    // Precise Collision Detection with generous margin
    const padX = 6;
    const padY = 5;
    if (runnerPlayer.x + runnerPlayer.w - padX > ob.x &&
        runnerPlayer.x + padX < ob.x + ob.w &&
        runnerPlayer.y + runnerPlayer.h - padY > ob.y &&
        runnerPlayer.y + padY < ob.y + ob.h) {
      runnerGameOver();
      return;
    }

    if (ob.x < -50) {
      runnerObstacles.splice(i, 1);
    }
  }

  // Draw Player Avatar
  ctx.save();
  runnerPlayer.animFrame += 0.22;
  const legOffset = Math.sin(runnerPlayer.animFrame) * 8;

  if (runnerPlayer.isSliding) {
    // Sliding pose
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(runnerPlayer.x, runnerPlayer.y + 4, runnerPlayer.w + 12, runnerPlayer.h - 4, 6);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(runnerPlayer.x + runnerPlayer.w + 10, runnerPlayer.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Head / helmet
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(runnerPlayer.x + 16, runnerPlayer.y + 11, 9, 0, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(runnerPlayer.x + 18, runnerPlayer.y + 8, 7, 5);

    // Torso / Suit
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(runnerPlayer.x + 6, runnerPlayer.y + 19, 20, 16, 4);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    if (runnerPlayer.isGrounded) {
      ctx.beginPath();
      ctx.moveTo(runnerPlayer.x + 11, runnerPlayer.y + 35);
      ctx.lineTo(runnerPlayer.x + 11 + legOffset, runnerPlayer.y + runnerPlayer.h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(runnerPlayer.x + 21, runnerPlayer.y + 35);
      ctx.lineTo(runnerPlayer.x + 21 - legOffset, runnerPlayer.y + runnerPlayer.h);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(runnerPlayer.x + 10, runnerPlayer.y + 35);
      ctx.lineTo(runnerPlayer.x + 6, runnerPlayer.y + 43);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(runnerPlayer.x + 22, runnerPlayer.y + 35);
      ctx.lineTo(runnerPlayer.x + 26, runnerPlayer.y + 43);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Draw Particles
  for (let i = runnerParticles.length - 1; i >= 0; i--) {
    const p = runnerParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.035;
    if (p.alpha <= 0) {
      runnerParticles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateRunnerStats();
  runnerAnimId = requestAnimationFrame(runnerLoop);
}

function updateRunnerStats() {
  const distEl = document.getElementById('runner-dist-val');
  if (distEl) distEl.innerText = `${toBnNum(runnerDist)} মি.`;

  const coinEl = document.getElementById('runner-coins-val');
  if (coinEl) coinEl.innerText = `${toBnNum(runnerCoins)}টি`;

  const totalScore = runnerDist + runnerCoins * 10;
  const scoreEl = document.getElementById('runner-score-val');
  if (scoreEl) scoreEl.innerText = toBnNum(totalScore);
}

function runnerGameOver() {
  runnerState = 'GAMEOVER';
  if (typeof playSound === 'function') playSound('hit');

  const totalScore = runnerDist + runnerCoins * 10;
  const curBest = parseInt(localStorage.getItem('bfg_best_runner') || '0', 10);
  if (totalScore > curBest) {
    localStorage.setItem('bfg_best_runner', String(totalScore));
    updateHomeBestScores5();
  }

  const overlay = document.getElementById('runner-overlay');
  if (overlay) {
    const scoreVal = document.getElementById('runner-overlay-score');
    if (scoreVal) scoreVal.innerText = `${toBnNum(totalScore)} পয়েন্ট (${toBnNum(runnerDist)} মি. + ${toBnNum(runnerCoins)} কয়েন)`;
    overlay.style.display = 'flex';
  }
}

// ============================================================================
// GAME 2: TRAFFIC RACER (ট্রাফিক রেসার)
// ============================================================================
let trafficAnimId = null;
let trafficState = 'IDLE';
let trafficDistance = 0;
let trafficSpeed = 6;
let trafficBoost = false;
let trafficCar = null;
let trafficNpcs = [];
let trafficParticles = [];
let trafficRoadY = 0;
let trafficHoldLeft = false;
let trafficHoldRight = false;

function initTrafficGame() {
  const canvas = document.getElementById('traffic-canvas');
  if (!canvas) return;
  setupSharpCanvas(canvas, 360, 520);

  const leftBtn = document.getElementById('traffic-left-btn');
  const rightBtn = document.getElementById('traffic-right-btn');
  const boostBtn = document.getElementById('traffic-boost-btn');

  if (leftBtn && !leftBtn.dataset.bound) {
    leftBtn.dataset.bound = 'true';
    leftBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      trafficHoldLeft = true;
      steerTraffic(-1);
    });
    const stopLeft = (e) => { e.preventDefault(); trafficHoldLeft = false; };
    leftBtn.addEventListener('pointerup', stopLeft);
    leftBtn.addEventListener('pointerleave', stopLeft);
    leftBtn.addEventListener('pointercancel', stopLeft);
  }

  if (rightBtn && !rightBtn.dataset.bound) {
    rightBtn.dataset.bound = 'true';
    rightBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      trafficHoldRight = true;
      steerTraffic(1);
    });
    const stopRight = (e) => { e.preventDefault(); trafficHoldRight = false; };
    rightBtn.addEventListener('pointerup', stopRight);
    rightBtn.addEventListener('pointerleave', stopRight);
    rightBtn.addEventListener('pointercancel', stopRight);
  }

  if (boostBtn && !boostBtn.dataset.bound) {
    boostBtn.dataset.bound = 'true';
    boostBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); toggleTrafficBoost(true); });
    const endBoost = (e) => { e.preventDefault(); toggleTrafficBoost(false); };
    boostBtn.addEventListener('pointerup', endBoost);
    boostBtn.addEventListener('pointerleave', endBoost);
    boostBtn.addEventListener('pointercancel', endBoost);
  }

  if (!canvas.dataset.bound) {
    canvas.dataset.bound = 'true';
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.5) steerTraffic(-1);
      else steerTraffic(1);
    });
  }

  if (!window.trafficKeyBound) {
    window.trafficKeyBound = true;
    window.addEventListener('keydown', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'traffic') return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        steerTraffic(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        steerTraffic(1);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        toggleTrafficBoost(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'traffic') return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        toggleTrafficBoost(false);
      }
    });
  }

  restartTrafficGame();
}

function restartTrafficGame() {
  if (trafficAnimId) cancelAnimationFrame(trafficAnimId);
  const overlay = document.getElementById('traffic-overlay');
  if (overlay) overlay.style.display = 'none';

  const pauseBtn = document.getElementById('traffic-pause-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';

  const bestVal = localStorage.getItem('bfg_best_traffic') || '0';
  const bestEl = document.getElementById('traffic-best-val');
  if (bestEl) bestEl.innerText = `${toBnNum(bestVal)} মি.`;

  trafficDistance = 0;
  trafficSpeed = 6;
  trafficBoost = false;
  trafficNpcs = [];
  trafficParticles = [];
  trafficRoadY = 0;
  trafficHoldLeft = false;
  trafficHoldRight = false;

  // 3 lanes centered at: 90, 180, 270
  trafficCar = {
    x: 180,
    targetX: 180,
    y: 410,
    w: 44,
    h: 76,
    lane: 1
  };

  trafficState = 'RUNNING';
  updateTrafficStats();
  trafficLoop();
}

function steerTraffic(dir) {
  if (trafficState !== 'RUNNING' || !trafficCar) return;
  const lanes = [90, 180, 270];
  const oldLane = trafficCar.lane;
  trafficCar.lane = Math.max(0, Math.min(2, trafficCar.lane + dir));
  trafficCar.targetX = lanes[trafficCar.lane];
  if (oldLane !== trafficCar.lane && typeof playSound === 'function') {
    playSound('slide');
  }
}

function toggleTrafficBoost(active) {
  if (trafficState !== 'RUNNING') return;
  trafficBoost = active;
  if (active && typeof playSound === 'function') playSound('tap');
}

function pauseTrafficGame() {
  if (trafficState === 'RUNNING') {
    trafficState = 'PAUSED';
    const pauseBtn = document.getElementById('traffic-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>▶ চালু করুন</span>';
  } else if (trafficState === 'PAUSED') {
    trafficState = 'RUNNING';
    const pauseBtn = document.getElementById('traffic-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';
    trafficLoop();
  }
}

function trafficLoop() {
  if (trafficState !== 'RUNNING') return;

  const canvas = document.getElementById('traffic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 360;
  const H = 520;

  ctx.clearRect(0, 0, W, H);

  // Speed calculation
  const currentSpeed = trafficSpeed + (trafficBoost ? 4.5 : 0);
  trafficDistance += Math.round(currentSpeed * 0.18);
  trafficSpeed = Math.min(10.5, 6 + Math.floor(trafficDistance / 280) * 0.5);

  // Road background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(30, 0, W - 60, H);

  // Grass curbs
  ctx.fillStyle = '#065f46';
  ctx.fillRect(0, 0, 30, H);
  ctx.fillRect(W - 30, 0, 30, H);

  // Road red/white safety curbs
  const curbStep = 30;
  trafficRoadY = (trafficRoadY + currentSpeed) % curbStep;
  for (let y = -curbStep + trafficRoadY; y < H; y += curbStep) {
    ctx.fillStyle = (Math.floor((y - trafficRoadY) / curbStep) % 2 === 0) ? '#ef4444' : '#ffffff';
    ctx.fillRect(25, y, 6, curbStep);
    ctx.fillRect(W - 31, y, 6, curbStep);
  }

  // Dashed lane lines
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;
  ctx.setLineDash([24, 20]);
  ctx.lineDashOffset = -trafficRoadY * 2.5;

  ctx.beginPath();
  ctx.moveTo(135, 0);
  ctx.lineTo(135, H);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(225, 0);
  ctx.lineTo(225, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Smooth car steering interpolation
  trafficCar.x += (trafficCar.targetX - trafficCar.x) * 0.22;

  // Spawn NPC traffic
  const lastNpc = trafficNpcs[trafficNpcs.length - 1];
  if ((!lastNpc || lastNpc.y > 130) && Math.random() < 0.026) {
    const laneChoices = [90, 180, 270];
    const chosenLane = Math.floor(Math.random() * 3);
    const colors = ['#0284c7', '#16a34a', '#d97706', '#9333ea'];
    const isTruck = Math.random() < 0.25;

    trafficNpcs.push({
      x: laneChoices[chosenLane],
      y: -100,
      w: 42,
      h: isTruck ? 96 : 70,
      speed: Math.random() * 2 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      isTruck
    });
  }

  // Draw and update NPC traffic
  for (let i = trafficNpcs.length - 1; i >= 0; i--) {
    const npc = trafficNpcs[i];
    npc.y += (currentSpeed - npc.speed);

    // Draw NPC
    ctx.save();
    ctx.fillStyle = npc.color;
    ctx.beginPath();
    ctx.roundRect(npc.x - npc.w / 2, npc.y, npc.w, npc.h, 8);
    ctx.fill();

    // Windshield
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(npc.x - npc.w / 2 + 4, npc.y + (npc.isTruck ? 16 : 20), npc.w - 8, npc.isTruck ? 28 : 22);

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(npc.x - npc.w / 2 + 5, npc.y + npc.h - 5, 8, 4);
    ctx.fillRect(npc.x + npc.w / 2 - 13, npc.y + npc.h - 5, 8, 4);
    ctx.restore();

    // Collision Detection (generous 5px inset)
    const pLeft = trafficCar.x - trafficCar.w / 2 + 5;
    const pRight = trafficCar.x + trafficCar.w / 2 - 5;
    const pTop = trafficCar.y + 6;
    const pBottom = trafficCar.y + trafficCar.h - 6;

    const nLeft = npc.x - npc.w / 2 + 4;
    const nRight = npc.x + npc.w / 2 - 4;
    const nTop = npc.y + 4;
    const nBottom = npc.y + npc.h - 4;

    if (pLeft < nRight && pRight > nLeft && pTop < nBottom && pBottom > nTop) {
      trafficGameOver();
      return;
    }

    if (npc.y > H + 100) {
      trafficNpcs.splice(i, 1);
    }
  }

  // Draw Player Car
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(trafficCar.x - trafficCar.w / 2 + 4, trafficCar.y + 6, trafficCar.w, trafficCar.h, 10);
  ctx.fill();

  // Sports car body (Red)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(trafficCar.x - trafficCar.w / 2, trafficCar.y, trafficCar.w, trafficCar.h, 10);
  ctx.fill();

  // White racing stripes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(trafficCar.x - 3, trafficCar.y, 6, trafficCar.h);

  // Windshield & windows
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(trafficCar.x - trafficCar.w / 2 + 5, trafficCar.y + 22, trafficCar.w - 10, 26, 4);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#fde047';
  ctx.fillRect(trafficCar.x - trafficCar.w / 2 + 4, trafficCar.y + 2, 8, 4);
  ctx.fillRect(trafficCar.x + trafficCar.w / 2 - 12, trafficCar.y + 2, 8, 4);

  // Taillights
  ctx.fillStyle = trafficBoost ? '#67e8f9' : '#f87171';
  ctx.fillRect(trafficCar.x - trafficCar.w / 2 + 4, trafficCar.y + trafficCar.h - 4, 8, 3);
  ctx.fillRect(trafficCar.x + trafficCar.w / 2 - 12, trafficCar.y + trafficCar.h - 4, 8, 3);

  // Turbo exhaust flame
  if (trafficBoost) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(trafficCar.x - 8, trafficCar.y + trafficCar.h);
    ctx.lineTo(trafficCar.x, trafficCar.y + trafficCar.h + 14 + Math.random() * 8);
    ctx.lineTo(trafficCar.x + 8, trafficCar.y + trafficCar.h);
    ctx.fill();
  }
  ctx.restore();

  // Exhaust particles
  if (Math.random() < 0.4) {
    trafficParticles.push({
      x: trafficCar.x + (Math.random() - 0.5) * 14,
      y: trafficCar.y + trafficCar.h + 4,
      vx: (Math.random() - 0.5) * 1.5,
      vy: currentSpeed * 0.4,
      radius: Math.random() * 3 + 2,
      alpha: 0.8,
      color: trafficBoost ? '#38bdf8' : '#64748b'
    });
  }

  for (let i = trafficParticles.length - 1; i >= 0; i--) {
    const p = trafficParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.04;
    if (p.alpha <= 0) {
      trafficParticles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateTrafficStats();
  trafficAnimId = requestAnimationFrame(trafficLoop);
}

function updateTrafficStats() {
  const distEl = document.getElementById('traffic-dist-val');
  if (distEl) distEl.innerText = `${toBnNum(trafficDistance)} মি.`;

  const speedVal = Math.round((trafficSpeed + (trafficBoost ? 4.5 : 0)) * 12);
  const speedEl = document.getElementById('traffic-speed-val');
  if (speedEl) speedEl.innerText = `${toBnNum(speedVal)} কিমি/ঘণ্টা`;
}

function trafficGameOver() {
  trafficState = 'GAMEOVER';
  if (typeof playSound === 'function') playSound('hit');

  const curBest = parseInt(localStorage.getItem('bfg_best_traffic') || '0', 10);
  if (trafficDistance > curBest) {
    localStorage.setItem('bfg_best_traffic', String(trafficDistance));
    updateHomeBestScores5();
  }

  const overlay = document.getElementById('traffic-overlay');
  if (overlay) {
    const scoreVal = document.getElementById('traffic-overlay-score');
    if (scoreVal) scoreVal.innerText = `${toBnNum(trafficDistance)} মিটার`;
    overlay.style.display = 'flex';
  }
}

// ============================================================================
// GAME 3: TOWER STACK (টাওয়ার স্ট্যাক)
// ============================================================================
let stackAnimId = null;
let stackState = 'IDLE';
let stackBlocks = [];
let stackCurrent = null;
let stackFallingPieces = [];
let stackParticles = [];
let stackScore = 0;
let stackCombo = 0;
let stackCameraY = 0;
let stackLastDropTime = 0;
const STACK_BLOCK_HEIGHT = 28;

function initStackGame() {
  const canvas = document.getElementById('stack-canvas');
  if (!canvas) return;
  setupSharpCanvas(canvas, 360, 480);

  const dropBtn = document.getElementById('stack-drop-btn');
  if (dropBtn && !dropBtn.dataset.bound) {
    dropBtn.dataset.bound = 'true';
    dropBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      placeStackBlock();
    });
  }

  if (!canvas.dataset.bound) {
    canvas.dataset.bound = 'true';
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      placeStackBlock();
    });
  }

  if (!window.stackKeyBound) {
    window.stackKeyBound = true;
    window.addEventListener('keydown', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'stack') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        placeStackBlock();
      }
    });
  }

  restartStackGame();
}

function restartStackGame() {
  if (stackAnimId) cancelAnimationFrame(stackAnimId);
  const overlay = document.getElementById('stack-overlay');
  if (overlay) overlay.style.display = 'none';

  const pauseBtn = document.getElementById('stack-pause-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';

  const bestVal = localStorage.getItem('bfg_best_stack') || '0';
  const bestEl = document.getElementById('stack-best-val');
  if (bestEl) bestEl.innerText = `${toBnNum(bestVal)} তলা`;

  stackScore = 0;
  stackCombo = 0;
  stackCameraY = 0;
  stackFallingPieces = [];
  stackParticles = [];
  stackLastDropTime = 0;

  // Base platform block
  stackBlocks = [{
    x: 90,
    y: 420,
    w: 180,
    h: STACK_BLOCK_HEIGHT,
    color: 'hsl(210, 80%, 55%)'
  }];

  spawnNextStackBlock();
  stackState = 'PLAYING';
  updateStackStats();
  stackLoop();
}

function spawnNextStackBlock() {
  const topBlock = stackBlocks[stackBlocks.length - 1];
  const hue = (stackScore * 15) % 360;
  const speed = Math.min(6.2, 3.2 + Math.floor(stackScore / 5) * 0.35);

  stackCurrent = {
    x: Math.random() < 0.5 ? -topBlock.w : 360,
    y: topBlock.y - STACK_BLOCK_HEIGHT,
    w: topBlock.w,
    h: STACK_BLOCK_HEIGHT,
    speed: speed * (Math.random() < 0.5 ? 1 : -1),
    color: `hsl(${hue}, 80%, 60%)`
  };
}

function placeStackBlock() {
  if (stackState !== 'PLAYING' || !stackCurrent) return;

  // Debounce rapid double-taps
  const now = Date.now();
  if (now - stackLastDropTime < 160) return;
  stackLastDropTime = now;

  const topBlock = stackBlocks[stackBlocks.length - 1];
  const diff = stackCurrent.x - topBlock.x;
  const tolerance = 4; // Generous margin for perfect alignment

  if (Math.abs(diff) <= tolerance) {
    // Perfect alignment!
    stackCurrent.x = topBlock.x;
    stackCombo++;
    if (typeof playSound === 'function') playSound('win');

    // Reward: expand block slightly on combo >= 3
    if (stackCombo >= 3 && stackCurrent.w < 180) {
      stackCurrent.w = Math.min(180, stackCurrent.w + 8);
      stackCurrent.x = Math.max(10, stackCurrent.x - 4);
    }

    createStackPerfectSparkles(stackCurrent.x + stackCurrent.w / 2, stackCurrent.y);
  } else if (diff > 0 && diff < stackCurrent.w) {
    // Current block is to the RIGHT of topBlock
    stackCombo = 0;
    if (typeof playSound === 'function') playSound('pop');

    const sliceWidth = diff;
    const newWidth = stackCurrent.w - diff;
    const sliceX = stackCurrent.x + newWidth;

    stackFallingPieces.push({
      x: sliceX,
      y: stackCurrent.y,
      w: sliceWidth,
      h: stackCurrent.h,
      color: stackCurrent.color,
      vy: 1.5,
      rot: 0,
      vrot: 0.08
    });

    stackCurrent.w = newWidth;
    // stackCurrent.x stays as is
  } else if (diff < 0 && Math.abs(diff) < stackCurrent.w) {
    // Current block is to the LEFT of topBlock
    stackCombo = 0;
    if (typeof playSound === 'function') playSound('pop');

    const sliceWidth = Math.abs(diff);
    const newWidth = stackCurrent.w - sliceWidth;
    const sliceX = stackCurrent.x;

    stackFallingPieces.push({
      x: sliceX,
      y: stackCurrent.y,
      w: sliceWidth,
      h: stackCurrent.h,
      color: stackCurrent.color,
      vy: 1.5,
      rot: 0,
      vrot: -0.08
    });

    stackCurrent.w = newWidth;
    stackCurrent.x = topBlock.x;
  } else {
    // Completely missed platform!
    stackFallingPieces.push({
      x: stackCurrent.x,
      y: stackCurrent.y,
      w: stackCurrent.w,
      h: stackCurrent.h,
      color: stackCurrent.color,
      vy: 1.5,
      rot: 0,
      vrot: 0.1
    });
    stackCurrent = null;
    stackGameOver();
    return;
  }

  stackBlocks.push(stackCurrent);
  stackScore++;
  spawnNextStackBlock();
  updateStackStats();
}

function createStackPerfectSparkles(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * 4 + 2;
    stackParticles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      radius: Math.random() * 3 + 2,
      alpha: 1,
      color: '#facc15'
    });
  }
}

function pauseStackGame() {
  if (stackState === 'PLAYING') {
    stackState = 'PAUSED';
    const pauseBtn = document.getElementById('stack-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>▶ চালু করুন</span>';
  } else if (stackState === 'PAUSED') {
    stackState = 'PLAYING';
    const pauseBtn = document.getElementById('stack-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';
    stackLoop();
  }
}

function stackLoop() {
  if (stackState !== 'PLAYING') return;

  const canvas = document.getElementById('stack-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 360;
  const H = 480;

  ctx.clearRect(0, 0, W, H);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Smooth camera tracking for tall towers
  const targetCameraY = Math.max(0, (stackBlocks.length - 7) * STACK_BLOCK_HEIGHT);
  stackCameraY += (targetCameraY - stackCameraY) * 0.12;

  ctx.save();
  ctx.translate(0, stackCameraY);

  // Draw placed blocks
  for (let i = 0; i < stackBlocks.length; i++) {
    const b = stackBlocks[i];
    drawBeveledBlock(ctx, b.x, b.y, b.w, b.h, b.color);
  }

  // Draw falling debris
  for (let i = stackFallingPieces.length - 1; i >= 0; i--) {
    const p = stackFallingPieces[i];
    p.y += p.vy;
    p.vy += 0.45;
    p.rot += p.vrot;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate(p.rot);
    drawBeveledBlock(ctx, -p.w / 2, -p.h / 2, p.w, p.h, p.color);
    ctx.restore();

    // Clean up pieces once they fall off screen
    if (p.y + stackCameraY > H + 120) {
      stackFallingPieces.splice(i, 1);
    }
  }

  // Draw current moving block
  if (stackCurrent) {
    stackCurrent.x += stackCurrent.speed;
    if (stackCurrent.x > W - stackCurrent.w + 60) {
      stackCurrent.speed = -Math.abs(stackCurrent.speed);
    } else if (stackCurrent.x < -60) {
      stackCurrent.speed = Math.abs(stackCurrent.speed);
    }
    drawBeveledBlock(ctx, stackCurrent.x, stackCurrent.y, stackCurrent.w, stackCurrent.h, stackCurrent.color);
  }

  // Draw combo sparkles
  for (let i = stackParticles.length - 1; i >= 0; i--) {
    const p = stackParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.04;
    if (p.alpha <= 0) {
      stackParticles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();

  stackAnimId = requestAnimationFrame(stackLoop);
}

function drawBeveledBlock(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // Top highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(x, y, w, 4);

  // Bottom shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.restore();
}

function updateStackStats() {
  const scoreEl = document.getElementById('stack-score-val');
  if (scoreEl) scoreEl.innerText = `${toBnNum(stackScore)} তলা`;

  const comboEl = document.getElementById('stack-combo-val');
  if (comboEl) comboEl.innerText = `${toBnNum(stackCombo)}x`;
}

function stackGameOver() {
  stackState = 'GAMEOVER';
  if (typeof playSound === 'function') playSound('wrong');

  const curBest = parseInt(localStorage.getItem('bfg_best_stack') || '0', 10);
  if (stackScore > curBest) {
    localStorage.setItem('bfg_best_stack', String(stackScore));
    updateHomeBestScores5();
  }

  const overlay = document.getElementById('stack-overlay');
  if (overlay) {
    const scoreVal = document.getElementById('stack-overlay-score');
    if (scoreVal) scoreVal.innerText = `${toBnNum(stackScore)} তলা`;
    overlay.style.display = 'flex';
  }
}

// ============================================================================
// GAME 4: FRUIT SLICE (ফ্রুট স্লাইস)
// ============================================================================
let fruitAnimId = null;
let fruitTimerId = null;
let fruitState = 'IDLE';
let fruitScore = 0;
let fruitTimeLeft = 60;
let fruitLives = 3;
let fruits = [];
let fruitSplashes = [];
let fruitBladeTrail = [];
let fruitIsSwiping = false;

const FRUIT_TYPES = [
  { name: 'তরমুজ', color: '#ef4444', rind: '#15803d', radius: 26, pts: 2 },
  { name: 'কমলা', color: '#f97316', rind: '#c2410c', radius: 24, pts: 1 },
  { name: 'আম', color: '#eab308', rind: '#a16207', radius: 25, pts: 2 },
  { name: 'আপেল', color: '#dc2626', rind: '#991b1b', radius: 23, pts: 1 },
  { name: 'স্ট্রবেরি', color: '#f43f5e', rind: '#16a34a', radius: 20, pts: 3 }
];

function initFruitSliceGame() {
  const canvas = document.getElementById('fruitslice-canvas');
  if (!canvas) return;
  setupSharpCanvas(canvas, 360, 480);

  if (!canvas.dataset.bound) {
    canvas.dataset.bound = 'true';

    const getCanvasPoint = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 360;
      const y = ((e.clientY - rect.top) / rect.height) * 480;
      return { x, y, time: Date.now() };
    };

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      fruitIsSwiping = true;
      fruitBladeTrail = [];
      const pt = getCanvasPoint(e);
      fruitBladeTrail.push(pt);
      // Tap-slice check for direct press on a fruit
      checkFruitSlice(pt, pt);
    });

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (!fruitIsSwiping) return;
      const pt = getCanvasPoint(e);
      fruitBladeTrail.push(pt);
      if (fruitBladeTrail.length > 1) {
        checkFruitSlice(fruitBladeTrail[fruitBladeTrail.length - 2], pt);
      }
    });

    const endSwipe = (e) => {
      e.preventDefault();
      fruitIsSwiping = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    canvas.addEventListener('pointerup', endSwipe);
    canvas.addEventListener('pointerleave', endSwipe);
    canvas.addEventListener('pointercancel', endSwipe);
  }

  restartFruitSliceGame();
}

function restartFruitSliceGame() {
  if (fruitAnimId) cancelAnimationFrame(fruitAnimId);
  if (fruitTimerId) clearInterval(fruitTimerId);

  const overlay = document.getElementById('fruitslice-overlay');
  if (overlay) overlay.style.display = 'none';

  const pauseBtn = document.getElementById('fruitslice-pause-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';

  const bestVal = localStorage.getItem('bfg_best_fruitslice') || '0';
  const bestEl = document.getElementById('fruitslice-best-val');
  if (bestEl) bestEl.innerText = toBnNum(bestVal);

  fruitScore = 0;
  fruitTimeLeft = 60;
  fruitLives = 3;
  fruits = [];
  fruitSplashes = [];
  fruitBladeTrail = [];
  fruitState = 'PLAYING';

  updateFruitStats();

  fruitTimerId = setInterval(() => {
    if (fruitState === 'PLAYING') {
      fruitTimeLeft--;
      updateFruitStats();
      if (fruitTimeLeft <= 0) {
        fruitGameOver('সময় শেষ!');
      }
    }
  }, 1000);

  fruitLoop();
}

function pauseFruitSliceGame() {
  if (fruitState === 'PLAYING') {
    fruitState = 'PAUSED';
    const pauseBtn = document.getElementById('fruitslice-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>▶ চালু করুন</span>';
  } else if (fruitState === 'PAUSED') {
    fruitState = 'PLAYING';
    const pauseBtn = document.getElementById('fruitslice-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';
    fruitLoop();
  }
}

function checkFruitSlice(p1, p2) {
  if (fruitState !== 'PLAYING') return;

  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    if (f.sliced) continue;

    const dist = distToSegment(f, p1, p2);
    if (dist <= f.radius + 6) {
      f.sliced = true;

      if (f.isBomb) {
        // Bomb detonated!
        if (typeof playSound === 'function') playSound('wrong');
        fruitLives--;
        createFruitJuice(f.x, f.y, '#f97316', 22);
        updateFruitStats();
        if (fruitLives <= 0) {
          fruitGameOver('বোমা বিস্ফোরণ!');
          return;
        }
      } else {
        // Fruit cut!
        if (typeof playSound === 'function') playSound('hit');
        fruitScore += f.pts;
        createFruitJuice(f.x, f.y, f.color, 16);

        // Spawn split flying halves
        fruits.push({
          x: f.x - 6,
          y: f.y,
          vx: f.vx - 3,
          vy: -3.5,
          radius: f.radius * 0.9,
          color: f.color,
          rind: f.rind,
          pts: 0,
          isBomb: false,
          isHalf: true,
          halfSide: -1,
          rot: f.rot,
          vrot: -0.15,
          sliced: true
        });

        fruits.push({
          x: f.x + 6,
          y: f.y,
          vx: f.vx + 3,
          vy: -3.5,
          radius: f.radius * 0.9,
          color: f.color,
          rind: f.rind,
          pts: 0,
          isBomb: false,
          isHalf: true,
          halfSide: 1,
          rot: f.rot,
          vrot: 0.15,
          sliced: true
        });

        fruits.splice(i, 1);
        updateFruitStats();
      }
    }
  }
}

function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function createFruitJuice(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * 5 + 2;
    fruitSplashes.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      radius: Math.random() * 4 + 2,
      alpha: 1,
      color
    });
  }
}

function fruitLoop() {
  if (fruitState !== 'PLAYING') return;

  const canvas = document.getElementById('fruitslice-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 360;
  const H = 480;

  ctx.clearRect(0, 0, W, H);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#1c1917');
  bgGrad.addColorStop(1, '#292524');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Cutting board subtle lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Spawn fruits periodically
  if (Math.random() < 0.042 && fruits.filter(f => !f.isHalf).length < 5) {
    const isBomb = Math.random() < 0.18;
    const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

    fruits.push({
      x: Math.random() * (W - 120) + 60,
      y: H + 30,
      vx: (Math.random() - 0.5) * 4.2,
      vy: -(Math.random() * 3 + 12),
      radius: isBomb ? 22 : type.radius,
      color: isBomb ? '#000000' : type.color,
      rind: isBomb ? '#ef4444' : type.rind,
      pts: isBomb ? 0 : type.pts,
      isBomb,
      isHalf: false,
      rot: 0,
      vrot: (Math.random() - 0.5) * 0.12,
      sliced: false
    });
  }

  // Draw and update fruits
  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    f.x += f.vx;
    f.y += f.vy;
    f.vy += 0.38; // gravity
    f.rot += f.vrot;

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);

    if (f.isHalf) {
      // Split half flying
      ctx.fillStyle = f.rind;
      ctx.beginPath();
      if (f.halfSide === -1) {
        ctx.arc(0, 0, f.radius, Math.PI * 0.5, Math.PI * 1.5);
      } else {
        ctx.arc(0, 0, f.radius, -Math.PI * 0.5, Math.PI * 0.5);
      }
      ctx.fill();

      ctx.fillStyle = f.color;
      ctx.beginPath();
      if (f.halfSide === -1) {
        ctx.arc(0, 0, f.radius - 3, Math.PI * 0.5, Math.PI * 1.5);
      } else {
        ctx.arc(0, 0, f.radius - 3, -Math.PI * 0.5, Math.PI * 0.5);
      }
      ctx.fill();
    } else if (f.isBomb) {
      // Bomb
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Spark fuse
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -f.radius - 4, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Whole Fruit
      ctx.fillStyle = f.rind;
      ctx.beginPath();
      ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(0, 0, f.radius - 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (f.y > H + 80 && f.vy > 0) {
      fruits.splice(i, 1);
    }
  }

  // Draw juice splashes
  for (let i = fruitSplashes.length - 1; i >= 0; i--) {
    const p = fruitSplashes[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.035;
    if (p.alpha <= 0) {
      fruitSplashes.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Draw Blade Slash Trail
  const now = Date.now();
  fruitBladeTrail = fruitBladeTrail.filter(pt => now - pt.time < 150);

  if (fruitBladeTrail.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(fruitBladeTrail[0].x, fruitBladeTrail[0].y);
    for (let i = 1; i < fruitBladeTrail.length; i++) {
      ctx.lineTo(fruitBladeTrail[i].x, fruitBladeTrail[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  fruitAnimId = requestAnimationFrame(fruitLoop);
}

function updateFruitStats() {
  const scoreEl = document.getElementById('fruitslice-score-val');
  if (scoreEl) scoreEl.innerText = toBnNum(fruitScore);

  const timeEl = document.getElementById('fruitslice-time-val');
  if (timeEl) timeEl.innerText = `${toBnNum(fruitTimeLeft)} সে.`;

  const livesEl = document.getElementById('fruitslice-lives-val');
  if (livesEl) livesEl.innerText = '❤️'.repeat(Math.max(0, fruitLives));
}

function fruitGameOver(reason) {
  fruitState = 'GAMEOVER';
  if (fruitTimerId) clearInterval(fruitTimerId);
  if (typeof playSound === 'function') playSound('wrong');

  const curBest = parseInt(localStorage.getItem('bfg_best_fruitslice') || '0', 10);
  if (fruitScore > curBest) {
    localStorage.setItem('bfg_best_fruitslice', String(fruitScore));
    updateHomeBestScores5();
  }

  const overlay = document.getElementById('fruitslice-overlay');
  if (overlay) {
    const titleEl = document.getElementById('fruitslice-overlay-title');
    if (titleEl) titleEl.innerText = reason || 'খেলা সমাপ্ত!';
    const scoreVal = document.getElementById('fruitslice-overlay-score');
    if (scoreVal) scoreVal.innerText = `${toBnNum(fruitScore)} পয়েন্ট`;
    overlay.style.display = 'flex';
  }
}

// ============================================================================
// GAME 5: BRICK BREAKER (ব্রিক ব্রেকার)
// ============================================================================
let brickAnimId = null;
let brickState = 'IDLE';
let brickScore = 0;
let brickLives = 3;
let brickPaddle = null;
let brickBall = null;
let bricks = [];
let brickParticles = [];
let brickHoldLeft = false;
let brickHoldRight = false;

const BRICK_ROWS = 5;
const BRICK_COLS = 7;

function initBrickBreakerGame() {
  const canvas = document.getElementById('brick-canvas');
  if (!canvas) return;
  setupSharpCanvas(canvas, 360, 480);

  const leftBtn = document.getElementById('brick-left-btn');
  const rightBtn = document.getElementById('brick-right-btn');
  const launchBtn = document.getElementById('brick-launch-btn');

  if (leftBtn && !leftBtn.dataset.bound) {
    leftBtn.dataset.bound = 'true';
    leftBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      brickHoldLeft = true;
      moveBrickPaddle(-24);
    });
    const stopLeft = (e) => { e.preventDefault(); brickHoldLeft = false; };
    leftBtn.addEventListener('pointerup', stopLeft);
    leftBtn.addEventListener('pointerleave', stopLeft);
    leftBtn.addEventListener('pointercancel', stopLeft);
  }

  if (rightBtn && !rightBtn.dataset.bound) {
    rightBtn.dataset.bound = 'true';
    rightBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      brickHoldRight = true;
      moveBrickPaddle(24);
    });
    const stopRight = (e) => { e.preventDefault(); brickHoldRight = false; };
    rightBtn.addEventListener('pointerup', stopRight);
    rightBtn.addEventListener('pointerleave', stopRight);
    rightBtn.addEventListener('pointercancel', stopRight);
  }

  if (launchBtn && !launchBtn.dataset.bound) {
    launchBtn.dataset.bound = 'true';
    launchBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      launchBrickBall();
    });
  }

  // Pointer drag on canvas for smooth mobile paddle tracking
  if (!canvas.dataset.bound) {
    canvas.dataset.bound = 'true';

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 360;
      if (brickPaddle) {
        brickPaddle.x = Math.max(0, Math.min(360 - brickPaddle.w, x - brickPaddle.w / 2));
        if (brickBall && !brickBall.inPlay) {
          brickBall.x = brickPaddle.x + brickPaddle.w / 2;
        }
      }
      if (brickState === 'LAUNCH') {
        launchBrickBall();
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (brickState !== 'PLAYING' && brickState !== 'LAUNCH') return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 360;
      if (brickPaddle) {
        brickPaddle.x = Math.max(0, Math.min(360 - brickPaddle.w, x - brickPaddle.w / 2));
        if (brickBall && !brickBall.inPlay) {
          brickBall.x = brickPaddle.x + brickPaddle.w / 2;
        }
      }
    });

    const endDrag = (e) => {
      e.preventDefault();
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointerleave', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
  }

  if (!window.brickKeyBound) {
    window.brickKeyBound = true;
    window.addEventListener('keydown', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'brick') return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        brickHoldLeft = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        brickHoldRight = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        launchBrickBall();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (typeof currentView !== 'undefined' && currentView !== 'brick') return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        brickHoldLeft = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        brickHoldRight = false;
      }
    });
  }

  restartBrickBreakerGame();
}

function restartBrickBreakerGame() {
  if (brickAnimId) cancelAnimationFrame(brickAnimId);
  const overlay = document.getElementById('brick-overlay');
  if (overlay) overlay.style.display = 'none';

  const pauseBtn = document.getElementById('brick-pause-btn');
  if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';

  const bestVal = localStorage.getItem('bfg_best_brick') || '0';
  const bestEl = document.getElementById('brick-best-val');
  if (bestEl) bestEl.innerText = toBnNum(bestVal);

  brickScore = 0;
  brickLives = 3;
  brickParticles = [];
  brickHoldLeft = false;
  brickHoldRight = false;

  brickPaddle = {
    x: 180 - 45,
    y: 440,
    w: 90,
    h: 14,
    speed: 7
  };

  brickBall = {
    x: 180,
    y: 426,
    vx: 3,
    vy: -5,
    radius: 7,
    inPlay: false
  };

  createBricks();
  brickState = 'LAUNCH';
  updateBrickStats();
  brickLoop();
}

function createBricks() {
  bricks = [];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
  const points = [50, 40, 30, 20, 10];
  const brickW = 46;
  const brickH = 18;
  const padX = 5;
  const padY = 6;
  const startX = (360 - (BRICK_COLS * (brickW + padX) - padX)) / 2;
  const startY = 45;

  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: startX + c * (brickW + padX),
        y: startY + r * (brickH + padY),
        w: brickW,
        h: brickH,
        color: colors[r],
        pts: points[r],
        active: true
      });
    }
  }
}

function moveBrickPaddle(delta) {
  if (!brickPaddle) return;
  brickPaddle.x = Math.max(0, Math.min(360 - brickPaddle.w, brickPaddle.x + delta));
  if (brickBall && !brickBall.inPlay) {
    brickBall.x = brickPaddle.x + brickPaddle.w / 2;
  }
}

function launchBrickBall() {
  if (brickBall && !brickBall.inPlay) {
    brickBall.inPlay = true;
    brickState = 'PLAYING';
    if (typeof playSound === 'function') playSound('tap');
  }
}

function pauseBrickBreakerGame() {
  if (brickState === 'PLAYING') {
    brickState = 'PAUSED';
    const pauseBtn = document.getElementById('brick-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>▶ চালু করুন</span>';
  } else if (brickState === 'PAUSED') {
    brickState = 'PLAYING';
    const pauseBtn = document.getElementById('brick-pause-btn');
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️ বিরতি</span>';
    brickLoop();
  }
}

function brickLoop() {
  if (brickState !== 'PLAYING' && brickState !== 'LAUNCH') return;

  const canvas = document.getElementById('brick-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 360;
  const H = 480;

  ctx.clearRect(0, 0, W, H);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Continuous hold paddle movement
  if (brickHoldLeft) moveBrickPaddle(-6);
  if (brickHoldRight) moveBrickPaddle(6);

  // Update Ball
  if (brickBall.inPlay) {
    const prevX = brickBall.x;
    const prevY = brickBall.y;

    brickBall.x += brickBall.vx;
    brickBall.y += brickBall.vy;

    // Wall bounces
    if (brickBall.x - brickBall.radius <= 0) {
      brickBall.x = brickBall.radius;
      brickBall.vx = Math.abs(brickBall.vx);
      if (typeof playSound === 'function') playSound('pop');
    } else if (brickBall.x + brickBall.radius >= W) {
      brickBall.x = W - brickBall.radius;
      brickBall.vx = -Math.abs(brickBall.vx);
      if (typeof playSound === 'function') playSound('pop');
    }

    if (brickBall.y - brickBall.radius <= 0) {
      brickBall.y = brickBall.radius;
      brickBall.vy = Math.abs(brickBall.vy);
      if (typeof playSound === 'function') playSound('pop');
    }

    // Paddle Bounce
    if (brickBall.y + brickBall.radius >= brickPaddle.y &&
        brickBall.y - brickBall.radius <= brickPaddle.y + brickPaddle.h &&
        brickBall.x >= brickPaddle.x - 4 &&
        brickBall.x <= brickPaddle.x + brickPaddle.w + 4 &&
        brickBall.vy > 0) {
      const hitOffset = (brickBall.x - (brickPaddle.x + brickPaddle.w / 2)) / (brickPaddle.w / 2);
      const clampedOffset = Math.max(-0.85, Math.min(0.85, hitOffset));
      const angle = clampedOffset * (Math.PI / 3); // Max 60 deg angle
      const speed = Math.hypot(brickBall.vx, brickBall.vy);

      brickBall.vx = speed * Math.sin(angle);
      brickBall.vy = -speed * Math.cos(angle);
      brickBall.y = brickPaddle.y - brickBall.radius;
      if (typeof playSound === 'function') playSound('hit');
    }

    // Brick Collisions with proper horizontal/vertical resolution
    let activeCount = 0;
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!b.active) continue;
      activeCount++;

      if (brickBall.x + brickBall.radius > b.x &&
          brickBall.x - brickBall.radius < b.x + b.w &&
          brickBall.y + brickBall.radius > b.y &&
          brickBall.y - brickBall.radius < b.y + b.h) {
        b.active = false;

        // Determine if ball hit the side or top/bottom
        if (prevX + brickBall.radius <= b.x || prevX - brickBall.radius >= b.x + b.w) {
          brickBall.vx = -brickBall.vx;
        } else {
          brickBall.vy = -brickBall.vy;
        }

        brickScore += b.pts;
        if (typeof playSound === 'function') playSound('correct');

        // Spark particles
        for (let p = 0; p < 7; p++) {
          brickParticles.push({
            x: b.x + b.w / 2,
            y: b.y + b.h / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            radius: Math.random() * 3 + 1,
            alpha: 1,
            color: b.color
          });
        }
        updateBrickStats();
        break;
      }
    }

    // Victory check
    if (activeCount === 0) {
      brickVictory();
      return;
    }

    // Ball fell below paddle
    if (brickBall.y - brickBall.radius > H) {
      brickLives--;
      if (typeof playSound === 'function') playSound('wrong');
      updateBrickStats();

      if (brickLives <= 0) {
        brickGameOver();
        return;
      } else {
        brickBall.inPlay = false;
        brickBall.x = brickPaddle.x + brickPaddle.w / 2;
        brickBall.y = brickPaddle.y - 12;
        brickBall.vx = 3;
        brickBall.vy = -5;
        brickState = 'LAUNCH';
      }
    }
  }

  // Draw Bricks
  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i];
    if (!b.active) continue;
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(b.x, b.y, b.w, 3);
    ctx.restore();
  }

  // Draw Paddle
  ctx.save();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(brickPaddle.x, brickPaddle.y, brickPaddle.w, brickPaddle.h, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(brickPaddle.x + 12, brickPaddle.y + 3, brickPaddle.w - 24, 3);
  ctx.restore();

  // Draw Ball
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(brickBall.x, brickBall.y, brickBall.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.restore();

  // Draw Particles
  for (let i = brickParticles.length - 1; i >= 0; i--) {
    const p = brickParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.04;
    if (p.alpha <= 0) {
      brickParticles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  brickAnimId = requestAnimationFrame(brickLoop);
}

function updateBrickStats() {
  const scoreEl = document.getElementById('brick-score-val');
  if (scoreEl) scoreEl.innerText = toBnNum(brickScore);

  const livesEl = document.getElementById('brick-lives-val');
  if (livesEl) livesEl.innerText = '❤️'.repeat(Math.max(0, brickLives));

  const activeBricks = bricks.filter(b => b.active).length;
  const remainEl = document.getElementById('brick-remain-val');
  if (remainEl) remainEl.innerText = `${toBnNum(activeBricks)}টি`;
}

function brickGameOver() {
  brickState = 'GAMEOVER';
  if (typeof playSound === 'function') playSound('wrong');

  const curBest = parseInt(localStorage.getItem('bfg_best_brick') || '0', 10);
  if (brickScore > curBest) {
    localStorage.setItem('bfg_best_brick', String(brickScore));
    updateHomeBestScores5();
  }

  const overlay = document.getElementById('brick-overlay');
  if (overlay) {
    const titleEl = document.getElementById('brick-overlay-title');
    if (titleEl) titleEl.innerText = 'খেলা সমাপ্ত!';
    const scoreVal = document.getElementById('brick-overlay-score');
    if (scoreVal) scoreVal.innerText = `${toBnNum(brickScore)} পয়েন্ট`;
    overlay.style.display = 'flex';
  }
}

function brickVictory() {
  brickState = 'GAMEOVER';
  if (typeof playSound === 'function') playSound('win');

  const curBest = parseInt(localStorage.getItem('bfg_best_brick') || '0', 10);
  if (brickScore > curBest) {
    localStorage.setItem('bfg_best_brick', String(brickScore));
    updateHomeBestScores5();
  }

  const overlay = document.getElementById('brick-overlay');
  if (overlay) {
    const titleEl = document.getElementById('brick-overlay-title');
    if (titleEl) titleEl.innerText = '🎉 অভিনন্দন! সব ইট ভেঙেছেন!';
    const scoreVal = document.getElementById('brick-overlay-score');
    if (scoreVal) scoreVal.innerText = `${toBnNum(brickScore)} পয়েন্ট`;
    overlay.style.display = 'flex';
  }
}
