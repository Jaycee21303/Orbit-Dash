# Echo Orbit: Endless Dash

Tiny colorful endless arcade game (Geometry Dash vibes) that runs in the browser.

- You orbit around a glowing center on one of several circular tracks.
- The game **starts immediately** when the page loads.
- Hazards spin around each orbit and will kill you on contact.
- **Gold orbs** trigger bullet-time and a speed boost.
- **Blue orbs** slow you down (Time Drag) and make dodging harder.
- Difficulty ramps up in **waves** over time. No rounds, no checkpoints. You go until you die.
- Local leaderboard stored in `localStorage`, ranked by **wave** and **time survived**.

## Controls

- Move: `← →` or `A / D`
- Jump to next orbit: `SPACE`

## Dev

This is a static game, no build step required.

```bash
# simplest way: open index.html in a browser
# or serve with any static server, for example:
npx serve .
```

Then go to `http://localhost:3000` (or whatever port) and play.

## License

MIT
