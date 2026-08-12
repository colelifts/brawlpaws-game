# Arsenal Awakening v1

Generation mode: ImageGen direct (`image_gen`), authored as keyed raster atlases and converted to transparent PNG production assets.

## Weapon and projectile atlas

Output: `arsenal-key.png` → `../../vfx/arsenal-weapons-v1.png`

Prompt: Create a polished premium action-roguelite VFX/weapon sprite sheet on a single perfectly flat bright chroma-green background (#00ff00), 3 columns by 2 rows, no grid lines, no text, no UI, each asset isolated and centered with generous transparent-looking green padding. Match a painterly anime-comic Japanese spirit-fantasy game: crisp dark ink contours, luminous cyan/orange energy, high-end concept art, readable at small gameplay scale. Top row: ornate Frostbite Needle ice crossbow-rifle; heavy Oni Mortar cannon; elegant Gale War Fan. Bottom row: flying ice needle projectile; flaming Oni mortar bomb projectile; spinning gale fan projectile. Consistent three-quarter/isometric game view, strong silhouettes, no characters, no scenery, no shadows touching cell boundaries.

## Reaction atlas

Output: `arsenal-reactions-key.png` → `../../vfx/arsenal-reactions-v1.png`

Prompt: Create a premium action-roguelite combat reaction sprite sheet on a single perfectly flat bright chroma-green background (#00ff00), 3 columns by 2 rows, no grid lines, no text, no UI. Each VFX isolated and centered with generous green padding, painterly anime-comic Japanese spirit-fantasy style, crisp ink contours, luminous energy, readable in isometric gameplay. Top row: first Chill hit with ice shards and a ground ring; second Chill stage as a taller spiraling ice body-wrap; full Freeze prison as a dramatic crystalline cocoon with a clearly empty transparent center so the enemy body remains visible. Bottom row: explosive Oni mortar impact with red-orange demon seal and debris; sharp crescent gale hit with white feathers; elegant gale return/catch vortex. No characters, scenery, typography, or frame separators.

Transparency conversion used `remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --edge-feather 2 --despill --force`.
