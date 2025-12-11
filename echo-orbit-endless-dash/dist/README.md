# Echo Orbit: Endless Dash

A fast, circular endless runner that lives entirely in your browser. Orbit around a glowing core, dodge spinning hazards, and grab orbs to bend time. Everything is pure HTML5 canvas and JavaScript—no external assets or build tools required.

## How to play
- **Move:** `←` / `→` or `A` / `D`
- **Jump to next orbit:** `SPACE`
- **Goal:** Survive as long as possible. Gold orbs trigger bullet-time then a burst of speed; blue orbs slow you down. The game ramps up automatically in waves.

Your best runs are saved locally (per browser) in the top-right leaderboard.

## Run the game locally
This is a static site; you can open it directly or serve it from a tiny static server.

### Option 1: open the file
1. Clone or download this repo.
2. Open `index.html` in any modern browser.

### Option 2: use the built-in static build
1. Build the ready-to-ship site:
   ```bash
   npm run build
   ```
2. Serve the `dist/` folder (Python 3 included on most systems):
   ```bash
   npm run serve
   ```
3. Visit `http://localhost:3000` and start dodging.

The `dist/` output includes everything (`index.html`, CSS, JS, README, LICENSE`) so you can deploy it to any static host (GitHub Pages, Netlify, S3, etc.).

## Project layout
- `index.html` – Game canvas + HUD.
- `src/js/` – Game systems: player control, hazards, waves, and leaderboard.
- `src/css/style.css` – Visual styling.
- `tools/build.js` – Zero-dependency copier that prepares `dist/`.

## License
MIT
