# BrawlPaws — ChatGPT Artwork Handoff

Paste this entire document into the ChatGPT conversation that will create artwork. Attach the original BrawlPaws concept screenshots and the most recent running-game screenshot with it.

## Project context

We are building **BrawlPaws**, a premium-feeling top-down / three-quarter-view action roguelite beat-'em-up starring stylized animal fighters. The current build is a dependency-free browser game with one polished Jade Grove combat encounter. The original supplied concept images are the visual source of truth.

The intended look is vibrant, anime- and manga-inspired, neon supernatural Japanese fantasy: compact expressive animal fighters, oversized readable weapons, thick dark outlines, cel shading, saturated magenta/cyan/orange/green light, brush-edged interface cards, and explosive but readable combat effects. It must not look like generic browser-game clip art, flat vector icons, simple circles, soft gradients, mobile-game stickers, or placeholder VFX.

The normal gameplay camera is fixed, wide, and zoomed out at a 40–45 degree three-quarter angle. The hero is deliberately small, approximately 4–7% of viewport height. Artwork must remain readable at that scale through silhouette, value contrast, bright cores, dark outlines, and large directional shapes. Do not solve readability by making the character huge or changing the camera.

## Current approved gameplay direction — this overrides older prompts

Some old BrawlPaws prompts describe Kitsune as a katana fighter and include multiple dash attacks. That direction is no longer current.

- Kitsune is currently the **gunner version** using the older **Spirit Blaster** artwork.
- Primary attack is manual aimed blaster fire with muzzle flash, recoil, neon projectile trail, impact star, damage number, and hit reaction.
- **Fox Step on Shift is the only dash.**
- Do not turn Foxfire Volley or Spirit Inferno into movement skills.
- Do not reintroduce the Mega Paw katana unless the user explicitly changes direction again.

Current controls:

- Left mouse / J: Spirit Blaster
- E: Tidal Slash
- C: Foxfire Volley
- F: Wild Heart
- Q: Spirit Inferno
- Shift: Fox Step dash

## Current ability mechanics and required visual identities

### Tidal Slash — directional traveling wave

A wide cyan water crescent travels forward and pierces enemies. It needs an unmistakable traveling silhouette: sharp crescent leading edge, brilliant white-blue core, deep-cyan body, violet rim accents, separated spray droplets, ink-brush water fragments, and a directional wake. It must not be a circular bubble or a soft blue glow.

### Foxfire Volley — directional five-shot fan

Kitsune plants their feet and fires five foxfire bolts in a visible fan. Each bolt needs a bright hot core, orange-red flame body, purple spirit-flame tail, tapered speed shape, and a compact fox-tail or fox-head motif. The five shots must read individually while still forming one deliberate fan. It is not a dash and should not produce a body afterimage trail.

### Wild Heart — defensive heal and protection

A large green spirit-heart bloom opens around Kitsune, heals immediately, and leaves a temporary protective state. The cast needs a bold heart/leaf silhouette, bright mint-white center, layered jade-green petals, small spirit leaves, and one clean protective ring. The persistent state should be quieter than the cast. It must not look like a plain green circle or a generic medical icon.

### Spirit Inferno — stationary area ultimate

Kitsune plants their feet and detonates a large purple/orange spirit-fire field around them. It needs the strongest silhouette in the kit: a fox-spirit crest at the center, alternating purple and orange flame pillars, a broken brush-ring boundary, inward-to-outward eruption timing, a white-hot impact center, embers, and a brief screen-flash frame. It is not a dash. It must not look like a simple outlined circle, flower, flat starburst, or evenly repeated geometric pattern.

## Enemy and encounter context

The Jade Grove room is now much larger. Enemies arrive gradually instead of all at once:

1. Very slow Grove Minions teach movement and aiming.
2. A Jade Brawler introduces a fast committed lunge.
3. Spirit Archers add ranged pressure with visible bow draw, aim, release, projectile trail, and impact.
4. Jadebreaker, the large armored hammer brute, arrives last.

Jadebreaker must **not dash**. He walks slowly, raises the sledgehammer with a long readable anticipation, plants his feet, and slams the ground. The slam creates a heavy impact burst and a clear danger radius. A player hit by the hammer slam is stunned, shown with a strong yellow stun reaction and orbiting stars. Future hammer artwork should show anticipation, overhead lift, planted downswing, ground contact, recoil, and recovery in all eight directions.

## Production rules for every generated game asset

- Create one asset family per generation request; do not combine unrelated abilities into a decorative poster.
- Transparent background with no scenery, floor, UI, labels, captions, logos, borders, or drop-shadow rectangle.
- Orthographic three-quarter gameplay view matching the supplied character and arena references.
- Thick clean dark outline, cel-shaded internal rendering, controlled neon bloom, crisp edge definition.
- No motion blur that destroys the silhouette. Paint discrete animation poses and effect shapes.
- Keep the effect centered safely inside every frame with generous transparent padding and no cropping.
- Use an evenly spaced frame grid. Every frame cell must have identical dimensions.
- No duplicated subjects, stray limbs, extra weapons, partial characters, or inconsistent costume details.
- For directional character animation, use eight directions: N, NE, E, SE, S, SW, W, NW.
- For effect animation, use anticipation/build, release, peak, follow-through, and dissipate—not several nearly identical frames.
- Deliver a high-resolution PNG. Also state the exact grid dimensions, frame order, and intended playback timing in text outside the image.

## First production request: Tidal Slash VFX atlas

Use this prompt with GPT Image after attaching the BrawlPaws references:

```json
{
  "type": "production-ready transparent-background 2D game VFX sprite sheet",
  "style": "premium anime action-roguelite effect art, Japanese ink-brush energy shapes, thick controlled dark edging, crisp cel-shaded water, brilliant white core light, saturated cyan and electric blue with restrained violet accents, readable at a distant three-quarter gameplay camera",
  "subject": "BrawlPaws Tidal Slash, a fast directional water crescent projectile cast by the small fox gunner Kitsune; effect only, no character and no weapon",
  "canvas": {
    "aspect_ratio": "3:2",
    "background": "fully transparent",
    "safe_area": "all effect pixels remain at least 8 percent inside the outer canvas edge"
  },
  "layout": {
    "grid": "2 rows by 3 columns, six equal frame cells with no visible dividers",
    "frame_order": "left to right across the top row, then left to right across the bottom row",
    "frames": [
      "01 compact hooked cyan anticipation crescent with tiny suspended droplets",
      "02 crescent rapidly opens forward, white edge begins to ignite",
      "03 full traveling slash, dominant sharp crescent silhouette, brilliant white leading core and deep-cyan body",
      "04 peak-width traveling wave with separated spray fins and a violet brush-ink wake",
      "05 crescent breaks into directional water ribbons while preserving forward momentum",
      "06 dissipating droplets and thin cyan ink fragments, no solid central mass"
    ]
  },
  "shape_language": {
    "primary": "one asymmetric forward-facing crescent with a pointed leading tip and broad curved cutting edge",
    "secondary": "three to seven separated water droplets and tapered ink-brush wake fragments",
    "depth": "white-hot leading rim, cyan middle body, darker blue underside, narrow violet trailing accent"
  },
  "consistency": "same effect scale, travel direction, viewing angle, palette, and visual center across all six cells",
  "negative_constraints": [
    "no circles or bubble spell",
    "no character",
    "no text or icons",
    "no scenery or floor",
    "no UI card",
    "no soft amorphous cloud",
    "no photoreal water",
    "no cropped spray",
    "no frame borders"
  ]
}
```

## Then generate these asset families one at a time

1. Foxfire Volley projectile VFX atlas: six frames, one bolt traveling left-to-right, orange core plus purple fox-spirit tail. Code will rotate it to the aim angle and fire five instances.
2. Wild Heart cast VFX atlas: six frames, centered bloom from seed-heart to full jade spirit-heart to leaf dissipation; effect only.
3. Wild Heart persistent aura: four subtle looping frames with sparse leaves and a low protective ring.
4. Spirit Inferno ultimate atlas: eight frames in a 4×2 grid, centered stationary eruption from fox crest anticipation through asymmetric purple/orange flame pillars to broken-ring embers.
5. Kitsune ability-cast character atlas: eight directions, anticipation and release poses that preserve the approved Spirit Blaster costume and proportions.
6. Jadebreaker hammer-slam atlas: eight directions with overhead lift, planted impact, recoil, and recovery; absolutely no charge or dash pose.

Before generating each later asset, write a separate structured JSON production prompt at the same level of specificity as the Tidal Slash prompt. Do not redesign mechanics. Ask for clarification only if a required reference image is missing.
