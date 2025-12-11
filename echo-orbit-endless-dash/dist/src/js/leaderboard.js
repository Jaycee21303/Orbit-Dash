// leaderboard.js
(function (global) {
  const STORAGE_KEY = 'echoOrbitEndlessScores';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch {
      return [];
    }
  }

  function save(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }

  let entries = load();

  function addScore(name, wave, timeSeconds) {
    entries.push({
      name: (name || 'anon').toString().slice(0, 12),
      wave: wave,
      time: timeSeconds
    });

    // Sort: highest wave first, then longest time
    entries.sort((a, b) => {
      if (b.wave !== a.wave) return b.wave - a.wave;
      return b.time - a.time;
    });

    if (entries.length > 10) entries.length = 10;
    save(entries);
  }

  function getEntries() {
    return entries;
  }

  function draw(ctx, canvasWidth, canvasHeight) {
    const list = getEntries();
    const x = canvasWidth - 240;
    const y = 18;
    const w = 220;
    const h = 230;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText('Top Runs', x + 12, y + 28);

    ctx.font = '13px monospace';
    list.forEach((entry, i) => {
      const rowY = y + 52 + i * 18;
      const label = `${i + 1}. ${entry.name.padEnd(10, ' ')} W${entry.wave}  ${entry.time.toFixed(1)}s`;
      ctx.fillText(label, x + 12, rowY);
    });

    ctx.restore();
  }

  global.Leaderboard = {
    addScore,
    getEntries,
    draw
  };
})(window);
