# Route Gates v1

Generated with GPT Image using the `imagegen` workflow, then separated from its
chroma background with the bundled chroma-key utility. The untouched generated
source is preserved beside this file; the production RGBA atlas lives at
`assets/environment/route-gates-v1.png`.

## Prompt

> Use case: stylized-concept game asset atlas. Create a clean 2x2 sprite atlas of four freestanding Japanese-fantasy spirit road gates for a premium colorful isometric action roguelite. Top-left: cyan combat road, top-right: magenta mystery/event road, bottom-left: gold treasure/merchant road, bottom-right: emerald healing shrine road. Each gate is an ornate timber-and-stone torii portal with animated-looking spirit flame, luminous runes, tiny hanging lanterns, painterly hand-inked edges, strong readable silhouette, and a transparent-ready flat solid #00ff00 chroma background. No text, no letters, no characters, no HUD, no floor, no drop shadow crossing cell boundaries. Center each complete gate in an equal square cell with generous padding. Consistent three-quarter front camera and lighting. Polished modern 2D game asset quality, crisp at gameplay scale, deep navy materials with neon cyan/magenta/gold/green accents.

## Production treatment

- Source: `route-gates-chroma-v1.png`
- Background removal: `remove_chroma_key.py`
- Output layout: 2 columns x 2 rows, RGBA
- Runtime use: physical route gates in the streamed expedition world
