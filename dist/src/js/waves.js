// waves.js
(function (global) {
  /**
   * Given total elapsed seconds, return the current wave number
   * and difficulty parameters for that wave.
   */
  function getWaveParams(elapsedSeconds) {
    // Wave every 10 seconds
    const wave = Math.max(1, Math.floor(elapsedSeconds / 10) + 1);

    // Scale difficulty with wave
    const hazardSpeed = 0.7 + wave * 0.08;          // how fast hazards orbit
    const hazardCountMultiplier = 1 + wave * 0.06;  // more hazards over time
    const envSpeedMultiplier = 1 + wave * 0.04;     // orbits feel more intense

    let blueChance = 0.20 + wave * 0.02;
    blueChance = Math.min(blueChance, 0.75);        // cap at 75%

    let purpleChance = 0.12 + wave * 0.015;         // invincibility frequency
    purpleChance = Math.min(purpleChance, 0.45);

    const goldChance = 0.5;                         // constant-ish, more RNG

    return {
      wave,
      hazardSpeed,
      hazardCountMultiplier,
      envSpeedMultiplier,
      blueChance,
      goldChance,
      purpleChance
    };
  }

  global.Waves = { getWaveParams };
})(window);
