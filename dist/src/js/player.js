// player.js
(function (global) {
  const Player = {
    orbitIndex: 0,
    angle: 0,
    jumpCooldown: 0,
    orbits: [],
    baseSpeed: 2.4,

    init(orbits) {
      this.orbits = orbits;
      this.reset();
    },

    reset() {
      this.orbitIndex = 0;
      this.angle = 0;
      this.jumpCooldown = 0;
    },

    update(dt, input, modifiers) {
      // Input: { left: bool, right: bool, jump: bool }
      // Modifiers: { slowPenaltyTimer, speedBoostTimer }
      this.jumpCooldown = Math.max(0, this.jumpCooldown - dt);

      let moveDir = 0;
      if (input.left) moveDir -= 1;
      if (input.right) moveDir += 1;

      let speed = this.baseSpeed;

      if (modifiers.slowPenaltyTimer > 0) {
        speed *= 0.5;
      } else if (modifiers.speedBoostTimer > 0) {
        speed *= 2.3;
      } else {
        // auto-run even without input
        moveDir += 0.35;
      }

      this.angle += moveDir * speed * dt;

      const twoPi = Math.PI * 2;
      if (this.angle > twoPi) this.angle -= twoPi;
      if (this.angle < 0) this.angle += twoPi;

      if (input.jump && this.jumpCooldown <= 0) {
        this.orbitIndex = (this.orbitIndex + 1) % this.orbits.length;
        this.jumpCooldown = 0.25;
      }
    },

    getPosition(centerX, centerY) {
      const r = this.orbits[this.orbitIndex];
      const x = centerX + Math.cos(this.angle) * r;
      const y = centerY + Math.sin(this.angle) * r;
      return { x, y, r, orbitIndex: this.orbitIndex, angle: this.angle };
    }
  };

  global.Player = Player;
})(window);
