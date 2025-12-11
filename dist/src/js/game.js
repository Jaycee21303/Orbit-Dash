// game.js
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const W = canvas.width;
  const H = canvas.height;
  const CX = W / 2;
  const CY = H / 2;

  const orbits = [90, 150, 210, 270, 330];

  // DOM hooks
  const startModal = document.getElementById('start-modal');
  const startButton = document.getElementById('start-button');
  const gameoverModal = document.getElementById('gameover-modal');
  const gameoverSummary = document.getElementById('gameover-summary');
  const gameoverLeaderboard = document.getElementById('gameover-leaderboard');
  const scoreNameInput = document.getElementById('score-name');
  const saveScoreButton = document.getElementById('save-score');
  const playAgainButton = document.getElementById('play-again');

  // Game state
  let lastTime = 0;
  let elapsed = 0;        // seconds survived in current run
  let gameOver = false;
  let restarting = false;
  let isPlaying = false;
  let shieldTimer = 0;
  let pendingScore = null;
  let startGraceTimer = 0;

  // Time modifiers
  let slowMoTimer = 0;
  let speedBoostTimer = 0;
  let slowPenaltyTimer = 0;

  // Input
  const keys = { left: false, right: false, jump: false };
  let spaceHeld = false;

  function onKeyDown(e) {
    if (e.code === 'Space') {
      if (!spaceHeld) keys.jump = true;
      spaceHeld = true;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keys.left = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keys.right = true;
    }
  }

  function onKeyUp(e) {
    if (e.code === 'Space') {
      spaceHeld = false;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      keys.left = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      keys.right = false;
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Initialize modules
  Player.init(orbits);
  Hazards.init(orbits);

  function resetRun() {
    elapsed = 0;
    gameOver = false;
    restarting = false;
    isPlaying = false;
    shieldTimer = 0;
    pendingScore = null;
    startGraceTimer = 0;
    slowMoTimer = 0;
    speedBoostTimer = 0;
    slowPenaltyTimer = 0;
    Player.reset();
    Hazards.init(orbits);
  }

  function populateLeaderboardList() {
    const list = Leaderboard.getEntries();
    gameoverLeaderboard.innerHTML = '';
    list.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.name} — Wave ${entry.wave} · ${entry.time.toFixed(1)}s`;
      gameoverLeaderboard.appendChild(li);
    });
    if (list.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No scores yet. Be the first!';
      gameoverLeaderboard.appendChild(li);
    }
  }

  function showStartModal() {
    startModal.classList.remove('hidden');
  }

  function hideStartModal() {
    startModal.classList.add('hidden');
  }

  function showGameOver(finalWave, finalTime) {
    populateLeaderboardList();
    scoreNameInput.value = 'anon';
    gameoverSummary.textContent = `Wave ${finalWave} · ${finalTime.toFixed(1)}s survived`;
    gameoverModal.classList.remove('hidden');
  }

  function hideGameOver() {
    gameoverModal.classList.add('hidden');
  }

  function endRun() {
    if (restarting) return;
    gameOver = true;
    restarting = true;
    isPlaying = false;

    const finalTime = elapsed;
    const finalWave = Waves.getWaveParams(elapsed).wave;
    pendingScore = { wave: finalWave, time: finalTime };
    showGameOver(finalWave, finalTime);
  }

  function startRun() {
    hideStartModal();
    hideGameOver();
    resetRun();
    startGraceTimer = 1.5;
    isPlaying = true;
    lastTime = 0; // reset timing so first frame delta is clean
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    draw();

    // reset jump flag each frame
    keys.jump = false;

    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (gameOver || !isPlaying) return;

    elapsed += dt;

    if (startGraceTimer > 0) {
      startGraceTimer = Math.max(0, startGraceTimer - dt);
    }

    if (shieldTimer > 0) {
      shieldTimer = Math.max(0, shieldTimer - dt);
    }

    // Timers
    if (slowMoTimer > 0) {
      slowMoTimer -= dt;
      if (slowMoTimer <= 0) {
        slowMoTimer = 0;
        speedBoostTimer = 1.5; // kick into speed phase
      }
    }
    if (speedBoostTimer > 0) {
      speedBoostTimer -= dt;
      if (speedBoostTimer < 0) speedBoostTimer = 0;
    }
    if (slowPenaltyTimer > 0) {
      slowPenaltyTimer -= dt;
      if (slowPenaltyTimer < 0) slowPenaltyTimer = 0;
    }

    const waveParams = Waves.getWaveParams(elapsed);

    // Time scale: environment moves faster each wave, but slow-mo reduces it
    let envTimeScale = waveParams.envSpeedMultiplier;
    if (slowMoTimer > 0) envTimeScale *= 0.33;

    // Player
    Player.update(dt, keys, {
      slowPenaltyTimer,
      speedBoostTimer
    });

    const pos = Player.getPosition(CX, CY);
    const playerPos = {
      x: pos.x,
      y: pos.y,
      r: pos.r,
      orbitIndex: pos.orbitIndex,
      angle: pos.angle,
      centerX: CX,
      centerY: CY
    };

    Hazards.update(
      dt,
      waveParams,
      envTimeScale,
      playerPos,
      {
        onHit: () => endRun(),
        onGold: () => {
          // cleanse blue penalty, enter slow-mo, speed comes after
          slowPenaltyTimer = 0;
          slowMoTimer = 1.4;
          speedBoostTimer = 0;
        },
        onBlue: () => {
          // extend / set slow penalty
          slowPenaltyTimer = Math.min(slowPenaltyTimer + 2.2, 6.0);
        },
        onPurple: () => {
          shieldTimer = 5.0;
          slowPenaltyTimer = 0;
        }
      },
      {
        invincible: shieldTimer > 0 || startGraceTimer > 0
      }
    );
  }

  function draw() {
    const t = performance.now() / 1000;

    // Background
    const grad = ctx.createRadialGradient(CX, CY, 40, CX, CY, Math.max(W, H));
    grad.addColorStop(0, '#050512');
    grad.addColorStop(0.4, '#190034');
    grad.addColorStop(0.8, '#001933');
    grad.addColorStop(1, '#000005');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Center glow
    ctx.save();
    ctx.globalAlpha = 0.45;
    const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 160);
    glow.addColorStop(0, '#33ccff');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(CX, CY, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Orbits
    orbits.forEach((r, i) => {
      const hue = (t * 25 + i * 60) % 360;
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.6 + i * 0.05})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Hazards + balls
    Hazards.draw(ctx, CX, CY, t);

    // Player
    const pos = Player.getPosition(CX, CY);
    const px = pos.x;
    const py = pos.y;
    const pr = pos.r;

    ctx.save();
    // trail
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, pr, pos.angle - 0.20, pos.angle);
    ctx.stroke();

    let playerColor = '#ffffff';
    if (startGraceTimer > 0) playerColor = '#9cf6ff';
    else if (shieldTimer > 0) playerColor = '#c271ff';
    else if (slowPenaltyTimer > 0) playerColor = '#55d5ff';
    else if (speedBoostTimer > 0) playerColor = '#ffb347';

    ctx.fillStyle = playerColor;
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, Math.PI * 2);
    ctx.fill();

    // direction tick
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + Math.cos(pos.angle) * 18,
      py + Math.sin(pos.angle) * 18
    );
    ctx.stroke();

    ctx.restore();

    // HUD left: score/wave/state
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(16, 16, 230, 96);

    const waveParams = Waves.getWaveParams(elapsed);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText(`Wave: ${waveParams.wave}`, 26, 44);

    ctx.font = '13px monospace';
    ctx.fillText(`Time: ${elapsed.toFixed(1)}s`, 26, 64);

    let state = 'Normal';
    if (startGraceTimer > 0) state = 'Spawning';
    else if (shieldTimer > 0) state = 'Invincible';
    else if (slowPenaltyTimer > 0) state = 'Time Drag (blue)';
    else if (slowMoTimer > 0) state = 'Bullet Time';
    else if (speedBoostTimer > 0) state = 'Overclock';

    ctx.fillText(`State: ${state}`, 26, 84);
    ctx.restore();

    // Leaderboard panel
    Leaderboard.draw(ctx, W, H);

    if (gameOver) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.font = '32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Run Complete', CX, CY - 10);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Check the scoreboard to restart', CX, CY + 20);
      ctx.restore();
    }
  }
  // UI wiring
  startButton.addEventListener('click', () => {
    startRun();
  });

  saveScoreButton.addEventListener('click', () => {
    if (pendingScore) {
      const name = scoreNameInput.value || 'anon';
      Leaderboard.addScore(name, pendingScore.wave, pendingScore.time);
    }
    hideGameOver();
    resetRun();
    showStartModal();
  });

  playAgainButton.addEventListener('click', () => {
    hideGameOver();
    resetRun();
    showStartModal();
  });

  // Start the loop and show instructions first
  showStartModal();
  requestAnimationFrame(loop);
})();
