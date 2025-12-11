// hazards.js
(function (global) {
  const Hazards = {
    hazards: [],
    goldBalls: [],
    blueBalls: [],
    purpleBalls: [],
    orbits: [],
    ballSpawnTimer: 1.5,

    init(orbits) {
      this.orbits = orbits;
      this.hazards = [];
      this.goldBalls = [];
      this.blueBalls = [];
      this.purpleBalls = [];
      this.ballSpawnTimer = 1.5;

      // Initial hazards on each orbit
      for (let i = 0; i < orbits.length; i++) {
        const count = 2 + i; // more on outer
        for (let j = 0; j < count; j++) {
          this.hazards.push({
            orbitIndex: i,
            angle: Math.random() * Math.PI * 2,
            baseSpeed: (0.6 + Math.random() * 0.8) * (Math.random() < 0.5 ? -1 : 1)
          });
        }
      }
    },

    update(dt, waveParams, timeScale, playerPos, callbacks, options = {}) {
      const { invincible = false } = options;
      const envSpeed = timeScale; // combined with waveParams in caller
      const playerKillRadius2 = 22 * 22;
      const ballCatchRadius2 = 18 * 18;

      // Move hazards
      this.hazards.forEach(h => {
        const speed = h.baseSpeed * waveParams.hazardSpeed * envSpeed;
        h.angle += speed * dt;
      });

      // Move balls
      this.goldBalls.forEach(b => {
        const speed = b.baseSpeed * envSpeed;
        b.angle += speed * dt;
      });
      this.blueBalls.forEach(b => {
        const speed = b.baseSpeed * envSpeed;
        b.angle += speed * dt;
      });
      this.purpleBalls.forEach(b => {
        const speed = b.baseSpeed * envSpeed;
        b.angle += speed * dt;
      });

      // Spawn balls
      this.ballSpawnTimer -= dt;
      if (this.ballSpawnTimer <= 0) {
        const orbitIndex = Math.floor(Math.random() * this.orbits.length);
        const isBlue = Math.random() < waveParams.blueChance;
        const isPurple = !isBlue && Math.random() < waveParams.purpleChance;
        const ball = {
          orbitIndex,
          angle: Math.random() * Math.PI * 2,
          baseSpeed: (0.4 + Math.random() * 0.7) * (Math.random() < 0.5 ? -1 : 1)
        };
        if (isBlue) {
          this.blueBalls.push(ball);
        } else if (isPurple) {
          this.purpleBalls.push(ball);
        } else {
          this.goldBalls.push(ball);
        }
        // spawn delay shortened by difficulty
        this.ballSpawnTimer = 1.6 / waveParams.hazardCountMultiplier + Math.random() * 0.6;
      }

      const px = playerPos.x;
      const py = playerPos.y;

      // Hazard collision
      for (let h of this.hazards) {
        const r = this.orbits[h.orbitIndex];
        const x = playerPos.centerX + Math.cos(h.angle) * r;
        const y = playerPos.centerY + Math.sin(h.angle) * r;
        const dx = x - px;
        const dy = y - py;
        if (!invincible && dx * dx + dy * dy < playerKillRadius2) {
          callbacks.onHit();
          return; // stop processing after death
        }
      }

      // Gold collision
      for (let i = this.goldBalls.length - 1; i >= 0; i--) {
        const b = this.goldBalls[i];
        const r = this.orbits[b.orbitIndex];
        const x = playerPos.centerX + Math.cos(b.angle) * r;
        const y = playerPos.centerY + Math.sin(b.angle) * r;
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy < ballCatchRadius2) {
          this.goldBalls.splice(i, 1);
          callbacks.onGold();
        }
      }

      // Blue collision
      for (let i = this.blueBalls.length - 1; i >= 0; i--) {
        const b = this.blueBalls[i];
        const r = this.orbits[b.orbitIndex];
        const x = playerPos.centerX + Math.cos(b.angle) * r;
        const y = playerPos.centerY + Math.sin(b.angle) * r;
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy < ballCatchRadius2) {
          this.blueBalls.splice(i, 1);
          callbacks.onBlue();
        }
      }

      // Purple collision
      for (let i = this.purpleBalls.length - 1; i >= 0; i--) {
        const b = this.purpleBalls[i];
        const r = this.orbits[b.orbitIndex];
        const x = playerPos.centerX + Math.cos(b.angle) * r;
        const y = playerPos.centerY + Math.sin(b.angle) * r;
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy < ballCatchRadius2) {
          this.purpleBalls.splice(i, 1);
          callbacks.onPurple();
        }
      }
    },

    draw(ctx, centerX, centerY, time) {
      // Hazards
      this.hazards.forEach((h, i) => {
        const r = this.orbits[h.orbitIndex];
        const x = centerX + Math.cos(h.angle) * r;
        const y = centerY + Math.sin(h.angle) * r;
        const hue = (200 + i * 30 + time * 30) % 360;
        ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;

        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x + 9, y + 7);
        ctx.lineTo(x - 9, y + 7);
        ctx.closePath();
        ctx.fill();
      });

      // Gold balls
      this.goldBalls.forEach(b => {
        const r = this.orbits[b.orbitIndex];
        const x = centerX + Math.cos(b.angle) * r;
        const y = centerY + Math.sin(b.angle) * r;
        ctx.save();
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Blue balls
      this.blueBalls.forEach(b => {
        const r = this.orbits[b.orbitIndex];
        const x = centerX + Math.cos(b.angle) * r;
        const y = centerY + Math.sin(b.angle) * r;
        ctx.save();
        ctx.shadowColor = '#33ccff';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#33ccff';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Purple balls
      this.purpleBalls.forEach(b => {
        const r = this.orbits[b.orbitIndex];
        const x = centerX + Math.cos(b.angle) * r;
        const y = centerY + Math.sin(b.angle) * r;
        ctx.save();
        ctx.shadowColor = '#c271ff';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#c271ff';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  };

  global.Hazards = Hazards;
})(window);
