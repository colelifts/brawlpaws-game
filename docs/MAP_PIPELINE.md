# BrawlPaws layered map pipeline

BrawlPaws maps are Tiled JSON maps rendered by the pinned local Phaser 3.90 runtime. The first vertical slice is `assets/maps/jade-grove/shrine-courtyard.json`; its source generator is `scripts/build-shrine-map.mjs`.

The current migration keeps the proven combat/HUD canvas above Phaser while Phaser owns tilemap loading, camera culling, map art, authored world objects, collision geometry, gates, VFX anchors, and the F3 debug view. Combat actors consume the same map collision data now; actors, projectiles, and remaining effects move into Phaser incrementally without throwing away working game logic.

## Open and edit a room in Tiled

1. Install the free Tiled editor from mapeditor.org.
2. Open `assets/maps/jade-grove/shrine-courtyard.json`.
3. Keep tile size at 256 × 256 and preserve the map's relative asset paths.
4. Export as JSON over the same file. Do not enable compressed layer data; Phaser's Tiled parser deliberately receives readable integer arrays.
5. Run `npm.cmd test` and load `?system=tutorial&step=6` for a combat check.

Running `node scripts/build-shrine-map.mjs` regenerates the initial authored map and will overwrite manual Tiled edits. Once a room becomes hand-edited, copy or retire its generator first.

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
