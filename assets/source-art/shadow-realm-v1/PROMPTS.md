# Shadow Realm v1 — Image generation record

Generated with OpenAI image generation in reference-guided production mode, then copied into the game as immutable source art. Character and VFX sheets were generated on a saturated green key background and converted to transparent PNGs with the bundled chroma-key utility.

## Seven environment paintings

Shared art direction: premium hand-painted 2.5D/isometric action-roguelite arena, Japanese folklore fantasy, midnight indigo and violet palette with cyan rim light, very large readable combat floor, ornate architecture and animated-light opportunities around the perimeter, no characters, no UI, no text, no watermark, 16:9.

- `obsidian-lantern-path.png`: immense obsidian road behind the moon, violet lanterns, broken torii, open central battle floor.
- `mirrorgrave-village.png`: deserted mirror village, reflective shrines and spectral windows, broad square for combat.
- `wraithwood-crossing.png`: black-barked forest crossing, cyan ghost streams, crescent bridges, large open junction.
- `eclipse-archive.png`: impossible moon archive, floating scroll halls and eclipse machinery, circular central arena.
- `moonless-processional.png`: royal processional without a visible moon, statues carrying empty mirrors, long palace court.
- `umbral-palace-steps.png`: monumental palace ascent, violet braziers and six broken seals, huge tiered combat terrace.
- `throne-beyond-moon.png`: colossal final throne arena suspended behind an eclipsed moon, six spectral-tail motifs and a vast readable floor.

## Enemy combat and locomotion sheets

`shadow-enemies-key.png` and `shadow-enemies-move-key.png`: strict 3×2 production sprite atlases. Columns are Shadowstep Ferret with twin crescent daggers, Veilwing Owl moon caster, and Graveback Bear with a tombstone hammer. Combat sheet top row is neutral/ready and bottom row is each archetype’s unmistakable full-body attack. Movement sheet provides two distinct running cycles per enemy. Consistent camera, scale, lighting, and saturated green key background; no labels, UI, shadows, or cropped silhouettes.

## Guardian combat and locomotion sheets

`tsukiko-empress-key.png`: strict 3×2 atlas for Tsukiko, snow-leopard Empress of the Hollow Moon, six spectral tails and crescent-chain glaive. Frames: sovereign idle, sweep windup, crescent sweep, throne slam, hollow-moon channel, moon-without-dawn enrage.

`tsukiko-empress-move-key.png`: strict 2×1 locomotion atlas with two clearly different regal run strides, matching the combat atlas exactly.

## Combat VFX sheet

`shadow-vfx-key.png`: strict 3×2 atlas with six independent effects: crescent slash, hollow-moon orb projectile, spectral chain sweep, eclipse warning seal, tombstone-hammer impact, and hollow-moon collapse. Transparent game-ready results are stored at `assets/vfx/shadow-realm-vfx-v1.png`.

## Conversion mode

The source-key sheets were converted with automatic border key detection, soft matte, transparent threshold 12, opaque threshold 220, edge feather 2, and green despill. Production outputs preserve the keyed sources so later revisions remain reproducible.
