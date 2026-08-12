# BrawlPaws Asset Pack — Required Correction

Paste this message into the same ChatGPT conversation that generated `BrawlPaws_asset_pack.zip`. Reattach the original BrawlPaws references, `CHATGPT_ART_HANDOFF.md`, and the returned ZIP.

The returned artwork has promising character and VFX concepts, but it is currently a set of labeled presentation boards rather than implementation-ready game assets. Do not redesign the concepts. Re-export them as clean production atlases under the requirements below.

## Problems present in every returned file

- The PNG contains a colored/gradient backdrop instead of a fully transparent background.
- A title bar is rendered inside the image.
- Direction labels such as N, NE, E, SE, S, SW, W, and NW are rendered inside the atlas.
- Frames are not aligned to a guaranteed equal-size grid with exact cell boundaries.
- Several images visually contain fewer frames than the filename/title promises.
- The files are too small for clean extraction and downsampling.
- The sheets do not include machine-readable grid metadata.

No title, direction label, caption, backdrop, border, guide, or presentation decoration may be baked into a game atlas.

## File-specific corrections

### `01_wild_heart_cast.png`

- The board says six frames but visibly presents five compositions.
- Re-export exactly six centered effect-only frames in a 3-column × 2-row grid.
- Do not include Kitsune in this atlas.
- Each cell must have the same center, scale, padding, and dimensions.
- Sequence: seed heart → opening leaves → expanding heart → peak spirit bloom → petal breakup → sparse dissipation.

### `02_wild_heart_persistent_aura.png`

- Kitsune changes species, face, body shape, costume, and proportions between frames.
- Re-export the aura as an **effect-only** four-frame loop. The game will layer it behind the existing Kitsune sprite.
- Use a 4-column × 1-row grid with one identical center and radius in every frame.
- Keep the loop subtle: low protective ring, sparse leaves, gentle pulse. No large opaque green disk.

### `03_kitsune_ability_cast_8dir.png`

- The title promises six frames per direction, but the visible rows do not provide six clean equal cells.
- Kitsune's blaster size and pose continuity drift between frames.
- Re-export as exactly eight rows × six columns at no less than 3072 × 4096 pixels.
- Row order: N, NE, E, SE, S, SW, W, NW.
- Column order: anticipation 1, anticipation 2, energy gather, release, recoil/follow-through, recovery.
- Kitsune must retain the exact approved orange-fox gunner design, red/black outfit, proportions, and Spirit Blaster in all 48 cells.

### `04_spirit_blaster_firing_8dir.png`

- Re-export as exactly eight rows × four columns at no less than 2048 × 4096 pixels.
- Row order: N, NE, E, SE, S, SW, W, NW.
- Column order: aim/brace, muzzle ignition, shot/recoil, settle.
- The muzzle must stay attached to the barrel tip in every direction.
- No free-floating muzzle flash, changing weapon design, labels, or backdrop.

### `05_jadebreaker_hammer_slam_8dir.png`

- The overall hammer-brute concept is good, but the presentation board cannot be sliced reliably.
- Re-export as exactly eight rows × six columns at no less than 4096 × 4096 pixels.
- Row order: N, NE, E, SE, S, SW, W, NW.
- Column order: planted anticipation, overhead lift, committed downswing, hammer-ground contact, recoil, recovery.
- Jadebreaker must stay planted. Absolutely no charge, leap, slide, or dash frame.
- Keep the hammer, armor, body mass, facial markings, and scale identical throughout.
- Put the green ground impact into a separate effect-only six-frame atlas so code can align it with the hit radius.

### `06_spirit_archer_firing_8dir.png`

- Re-export as exactly eight rows × five columns at no less than 3072 × 4096 pixels.
- Row order: N, NE, E, SE, S, SW, W, NW.
- Column order: raise bow, pull string fully back, aim/hold, release, follow-through.
- The arrow must be nocked to the string, the drawing hand must visibly travel backward, and release must originate from the bow.
- No projectile floating separately before release.

### `07_combat_impact_vfx_pack.png`

- Do not return an irregular collage.
- Export each effect family as a separate transparent animation strip with equal cells.
- Required families: blaster impact, foxfire impact, tidal impact, spirit-inferno impact, hammer ground impact, dust puff, death-ink burst.
- Each family needs six frames: contact spark, expansion, peak, breakup, fragments, dissipate.
- No scenery, floor plane, smoke-board backdrop, labels, or cropping.

### `08_comic_impact_words_pack.png`

- The word designs are promising but must be individual transparent files, not one collage.
- Export separate tightly bounded transparent PNGs for: `SLASH!!`, `BAM!`, `ZAP!`, `CRASH!`, `WHAM!`, `BOOM!!`, `CRIT!`, `INFERNO!!`, `THOOM!!`, and `STUNNED!`.
- Preserve brush lettering, black ink splash, colored fill, readable outline, and asymmetry.
- No shared gradient backdrop and no neighboring word pixels.

## Mandatory technical delivery

1. Deliver a new ZIP containing only raw PNG assets plus one `atlas_manifest.json`.
2. Every PNG must use a genuinely transparent RGBA background. Corner pixels must have alpha 0.
3. No title bars, labels, captions, guides, or presentation backgrounds inside any PNG.
4. All atlas cells must be exactly equal in width and height.
5. Every subject must remain completely inside its cell with at least 8% transparent padding.
6. Do not trim frames independently; all frames in one atlas share the same registration point.
7. Character feet use one consistent ground-contact anchor across frames.
8. Do not place contact shadows in character atlases; the game renders shadows separately.
9. Do not combine effect art with character art unless the filename explicitly says so.
10. Do not upscale the existing presentation boards. Regenerate clean originals at the requested resolution.

The manifest must use this shape for every atlas:

```json
{
  "file": "kitsune_spirit_blaster_fire_8dir.png",
  "columns": 4,
  "rows": 8,
  "frame_width": 512,
  "frame_height": 512,
  "row_order": ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
  "column_order": ["aim", "ignition", "recoil", "settle"],
  "anchor": { "x": 0.5, "y": 0.82 },
  "recommended_frame_ms": [70, 45, 70, 90]
}
```

Generate and inspect one corrected file first: `kitsune_spirit_blaster_fire_8dir.png`. Confirm that it meets every technical requirement before generating the rest of the pack.
