# BrawlPaws layered map pipeline

BrawlPaws maps are Tiled JSON maps rendered by the pinned local Phaser 3.90 runtime. Jade Grove, Bamboo Hollow, and Crimson Dojo each ship with ten 6144×3840 layered templates loaded by one reusable runtime. Their source generators live in `scripts/build-*-maps.mjs` plus the original `build-shrine-map.mjs`.

## Jade Grove template library

- `shrine-courtyard.json` — open shrine plaza and tutorial approach
- `moonbridge-crossing.json` — narrow broken bridge with river-bank blockers
- `root-covered-plaza.json` — four corner islands and a solid root heart
- `bell-terraces.json` — stepped lateral platforms and a central bell dais
- `lantern-canals.json` — split canal lanes and alternating crossings
- `warden-processional.json` — long northbound gauntlet with guardian plinths
- `jadebreaker-courtyard.json` — large boss court, intro trigger, entrance seal, and victory exit
- `broken-pavilion.json` — optional event template with collapsed architecture
- `spirit-crystal-clearing.json` — optional elite clearing with crystal masses
- `abandoned-training-yard.json` — optional combat template with equipment rows

The six main chapter regions are selected in authored campaign order. Optional templates are registered for later branch selection. Every combat region owns its own collision, spawn, trigger, gate, interactive, foreground, and VFX data; no region uses its old generated painting as the active gameplay floor.

## Bamboo Hollow template library

- `hollow-gate.json` — broad opening woodland corridor
- `moonlit-reedbridge.json` — narrow bridge between deep river blockers
- `spore-shrine-marsh.json` — split marsh pools and a central spore isle
- `moonlotus-reservoir.json` — reservoir shores, piers, and ward island
- `sporelight-monastery.json` — large monastery hall and meditation court
- `moonstone-causeway.json` — fortified late-run causeway and moon-chain pillars
- `moonfang-burrow.json` — Moonfang Komainu guardian court and boss trigger
- `whispering-grotto.json` — optional event cavern and echo chamber
- `lotus-sanctuary.json` — optional recovery/shrine region
- `reedblade-hunter-camp.json` — optional elite/shop hunting camp

Bamboo’s main and optional routes use separate enemy spawn geometry, destructibles, moon gates, collision silhouettes, VFX anchors, and story triggers. Spore Bloom pressure remains a combat system and now lands inside real navigable geometry.

## Crimson Dojo template library

- `first-bell-dojo.json` — opening dojo and twin bell towers
- `ember-bell-court.json` — bell galleries, ember trenches, and the great dais
- `ashen-war-yard.json` — barracks, armories, and central duel ring
- `cinder-pagoda-rooftops.json` — narrow roof path over blocked drop zones
- `ashen-drum-foundry.json` — forge wings, drum presses, and molten hammer
- `shogun-war-processional.json` — late-run fortified Oni processional
- `oni-gate-throne.json` — Pyreclaw Shogun’s guardian court
- `foxfire-archive.json` — optional story/event archive
- `ancestor-flame-shrine.json` — optional recovery and shrine route
- `execution-yard.json` — optional elite and shop war camp

The Ember Corridor battlefield hazard cuts across these authored layouts rather than an empty ellipse. Pyreclaw’s boss court includes its own guardian trigger, entrance geometry, combat seal, and storm-bound exit.

The current migration keeps the proven combat/HUD canvas above Phaser while Phaser owns tilemap loading, camera culling, map art, authored world objects, collision geometry, gates, VFX anchors, and the F3 debug view. Combat actors consume the same map collision data now; actors, projectiles, and remaining effects move into Phaser incrementally without throwing away working game logic.

## Open and edit a room in Tiled

1. Install the free Tiled editor from mapeditor.org.
2. Open `assets/maps/jade-grove/shrine-courtyard.json`.
3. Keep tile size at 256 × 256 and preserve the map's relative asset paths.
4. Export as JSON over the same file. Do not enable compressed layer data; Phaser's Tiled parser deliberately receives readable integer arrays.
5. Run `npm.cmd test` and load `?system=tutorial&step=6` for a combat check.

Running `npm.cmd run build:maps` regenerates all current ten-map biome packs and will overwrite manual Tiled edits. Once a room becomes hand-edited, copy or retire its generator first.

Enemy creation consumes the `Enemy Spawns` layer in authored order, cycling through those points with small offsets only when a wave contains more enemies than points. Clearing combat opens the physical north gate; progression waits until the player walks through its exit trigger.

## Required layers

Every map must contain these exact names:

- `Ground`
- `Ground Detail`
- `Walls`
- `Props Below Player`
- `Collision`
- `Props / Interactive`
- `Doors / Gates`
- `Enemy Spawns`
- `Player Spawn`
- `Triggers`
- `Foreground / Occlusion`
- `VFX Anchors`

The runtime fails loudly when any required layer is absent. Visible artwork never determines collision.

## Object conventions

Use clear IDs such as `player_spawn`, `enemy_wave_1_a`, `gate_north`, and `cutscene_intro`.

Enemy spawn properties:

```text
enemyType: groveMinion
wave: 1
delay: 0.6
```

Door properties:

```text
state: combat-sealed | locked | open
destination: jade_bamboo_bridge
collision: true
sealColor: #45f0e3
```

Trigger properties:

```text
triggerType: cutscene | encounter | camera | reward
cutsceneId: jade_arrival
once: true
```

Prop crop properties select a transparent item from `jade-props.png`: `cropX`, `cropY`, `cropW`, `cropH`, `scale`, and `originY`. Interactive/destructible props add `interaction`, `destructible`, `health`, and `collisionRadius`.

VFX anchors use `effect`, optional `color`, and optional `radius`. Ambient sprites should be subtle and use additive blending only where it improves readability.

## Collision and depth

Author intentional rectangles or polygons in `Collision`; do not trace every visible pixel. Leave small flowers, petals, and floor clutter non-solid. Buildings use a solid base plus separate roof/canopy art. Actors and lower props sort from their feet (`depth = feetY` conceptually); roof edges, tree canopies, hanging banners, and tall bamboo live in `Foreground / Occlusion` so the player can pass behind them.

Closed combat gates add collision. When combat clears, their seal VFX fades and the blocker is removed. Destructibles remain separate objects with their own health and loot state.

## Room testing

- Normal play must contain no collision/spawn rectangles.
- Press F3 to show collision, gate state, spawn points, and trigger bounds.
- Test all room edges, every gate, building corners, and both sides of each occluder.
- Verify that characters remain small relative to the region and that the camera scale is unchanged.
- Verify that effects remain behind readable bodies and do not hide attackers or targets.
- Run `npm.cmd test` before publishing.

## Adding a room

Create a new Tiled JSON file under `assets/maps/<biome>/`, use every required layer, add a data-driven room definition in `src/data.js`, and give it a distinct silhouette. Procedural routing may select handcrafted regions, but it must never generate featureless rectangular geometry. Connected expedition regions will stream through physical gates rather than representing disconnected flat screenshots.
