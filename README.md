# Warung Rush — Make the best cooking game

![Bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)
![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/zenfrog72/makefun-best-cooking-game/rank.svg)
![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/zenfrog72/makefun-best-cooking-game/reward.svg)

Entry for the make.fun bounty: [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)

## The game

**Warung Rush** — the busiest street-food stall in town. Orders land on the
board (fried rice, chicken noodles, chicken satay, iced tea); you grab ingredients from
the crates, work them at the right station — wok, grill, chopping board,
kettle — then feed the finished components to the waiting tickets and serve
before the customer walks out angry.

- 3 shifts (lunch, afternoon, dinner rush), rising order rate, shrinking patience
- Combo multiplier: serve in a row and every plate pays more
- Burn risk: food left sitting on the stove burns — scrape it off and start over
- Keyboard + mouse: crates on keys 1–8, stations on Q/W/E/R, P pause, M music
- All art drawn in code, all sound synthesised with WebAudio — zero network requests

## Play it

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

## Layout

- `main.ts` — the hand-in program (copies `game/` + `screenshots/` to `/output`, writes `dossier.json`)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `game/` — the playable game as static files (`index.html` + `js/`)
  - `js/recipes.js` — dishes, ingredients, station rules
  - `js/state.js` — shifts, tickets, stations, combos, cash
  - `js/render.js` — every pixel: kitchen, customers, food, effects
  - `js/audio.js` — synthesised sizzle, chops, dings, music
  - `js/main.js` — loop, input, screenshot staging
- `screenshots/` — 4 real renders of the game's own code

## License

MIT — see [LICENSE](LICENSE).
