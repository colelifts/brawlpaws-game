# BrawlPaws — Three-Chapter Roguelite Campaign

A dependency-free playable browser roguelite with a walkable hub, permanent profile progression, three escalating chapters, branching routes, four production heroes, post-clear Ascension ranks, and three giant guardian bosses.

## Run it

```powershell
npm.cmd start
```

Then open [http://127.0.0.1:4174](http://127.0.0.1:4174).

## Public hosting and co-op isolation

- The public build is hosted as its own free GitHub Pages project under `colelifts/brawlpaws-game`.
- Online parties use PeerJS/WebRTC: the free PeerJS Cloud service performs the connection handshake, then game data travels directly between the players' browsers.
- BrawlPaws does not use the BuxtonSign or SignFlow domain, Worker, Durable Objects, databases, storage, deployment pipeline, or Cloudflare quota.
- Solo play remains fully available if the peer-to-peer connection service is unavailable.

To play co-op, one player selects **Create Party** and shares the five-character code. Up to three allies enter that code and select **Join**. Party size automatically increases enemy health, damage, pack size, elite chance, reinforcements, corruption, and rewards.

## Controls

- `WASD` or arrow keys — move
- Hold `Space` while moving — Paw Sprint; briefly run 42% faster while the sprint meter drains, then let it recover
- `Shift` — use the selected hero's directional dash with invulnerability frames
- Hold left mouse or `J` — fire the selected hero's ranged weapon toward the pointer
- `E` — Undertow Well, earned at level 2; aim a violent whirlpool that drags a pack into one firing lane, holds, Soaks, slows, and crushes them before priming Foxfire Steam Bursts and empowered Shock damage. `E` also activates nearby route rewards.
- `E` also frees nearby captive spirits during rescue missions; the interaction takes priority over Undertow.
- `C` — Foxfire Volley, earned at level 4; a five-shot burning fan
- `F` — Wild Heart, earned at level 6; an instant heal plus temporary damage reduction
- `Q` — Shock Paws, earned at level 8; a 5.4-second storm that repeatedly hits every active enemy
- At level 9+, investing twice in an ability can surface its Epic evolution: Abyssal Maw double-collapses, Nine-Tail Inferno fires nine flames and spreads burn on death, Guardian Bloom life-drains nearby enemies when Wild Heart ends, and Heaven's Verdict finishes every surviving enemy with a global strike.
- `K` — open or close the Spirit Archive Codex; combat pauses while it is open
- `1` / `2` / `3` — choose an upgrade when a level-up pauses combat
- `R` — restart from a result screen
- `Esc` — pause active exploration or combat
- `O` — open persistent accessibility settings

## Save and accessibility

- Active campaigns save a versioned checkpoint at the beginning of every story beat, route choice, combat room, and guardian room.
- **Continue Run** restores the selected hero, difficulty, build, ability unlocks, relics, resources, chapter, and room. Combat restarts from the room boundary so enemy and projectile state is always safe.
- Screen shake and combat flashes support full, reduced, and off modes. Damage numbers and ambient scenery motion can be toggled independently.
- Settings persist locally and can be changed from the title or while the game is paused.

## Included in this visual correction pass

- Wide fixed 3/4 camera with subtle velocity look-ahead, kick, and impact shake
- Acceleration-based movement with quick drag and full directional facing
- Deliberately modest starting Spirit Blaster damage with directional gunner poses, muzzle flash, recoil, neon projectile trails, and ranged hit reactions
- Directional dash with i-frames, afterimages, streak particles, and cooldown UI
- Jade Brawler enemies with pursuit, separation, telegraphed lunges, health, knockback, and death
- Hit-stop, damage numbers, impact rings, sparks, comic attack words, recorded combat SFX, and a soft looping score (licensed sources are listed in `assets/audio/CREDITS.md`)
- Ability hits drive target-specific burn recoil, wet squash, and shock jitter/tint reactions instead of placing the whole effect over the enemy body
- Grounded fade-and-rise enemy entrances, reduced normal-enemy scale, and locomotion bob/lean cycles for every enemy family and all three guardians
- Compact illustrated upgrade cards with a dedicated nine-emblem atlas and one-line outcome summaries
- Responsive BrawlPaws HUD, title screen, room-clear screen, and death/restart loop
- Data definitions for the hero, weapon, enemy, and room
- Detailed eight-direction Kitsune gunner atlas with separate idle, sprint, firing, dash, cast, hit, and death state architecture
- Detailed raccoon bandit, spirit archer, and armored boar atlas with separate idle and running/charging frames
- Dedicated eight-direction attack atlases for Kitsune firing, archer draw/release, raccoon windup/strike, and boar windup/slam
- Tight, soft contact shadows sized to each fighter's feet instead of large circular ground discs
- Four melee raccoons, two ranged archers, and one tougher boar with distinct telegraphs
- A staged 15-second encounter opening: slow Grove Minions first, then a lunge brawler, archers, and the heavy
- A substantially larger Jade Grove arena with more running and kiting space at the same wide camera scale
- A four-location Jade Grove journey: Grove Ruins, Moonbridge Crossing, Corrupted Root Garden, and Jadeguard Approach, each with its own painted arena, combat bounds, entrance, spawn ring, and ambient treatment
- Brush-styled location transitions between waves and guaranteed Jadeguard routing into the dedicated guardian court
- Jadebreaker's planted sledgehammer slam replaces his charge and stuns Kitsune on a direct hit
- Depth-sorted Jade Grove prop atlas, prop collision, foreground occlusion, light pools, ambient petals, cracks, spirit gates, and haze
- Neon blaster trails, impact stars, elemental ability VFX, ink death bursts, enemy projectiles, and magnetizing XP shards
- Four unlockable active abilities with locked-slot HUD states, directional targeting, damage, healing, damage reduction, burn damage, and distinct VFX
- Eighteen escalating pre-boss combats across the campaign: Chapter I grows from 4 slow scouts to 72 enemies, Chapter II reaches 112, and Chapter III reaches a 150-enemy cataclysm before Pyreclaw
- Every pre-boss room now carries an authored mission: eliminate a named warband, shoot and shatter curse anchors, reach and free captive spirits, or defend a damageable ward until its seal stabilizes. Mission progress is visible in the HUD, gates room completion, grants gold/XP, fails the run when a ward breaks, and persists in room-safe checkpoints.
- Physical Sacred Springs, Spirit Vaults, and Hero Shrines selected from the route screen must be reached and activated inside combat rooms; destructible pots and crates provide optional gold and XP
- Real level progression with rising XP thresholds, combat-pausing three-card choices, 41 upgrade definitions, repeatable ranks, Dual-Wield, hero-specific branches, piercing, critical-draw, guardian-hunter, mobility, economy, four earned weapon capstones, and four behavior-changing ability evolutions
- Every chapter adds a distinct escalating arena threat: Jade Bell Echoes launch radial spirit volleys, Bamboo Spore Blooms create persistent slowing damage zones, and Crimson Ember Corridors cut temporary fire lanes through the battlefield.
- Faster enemy pursuit, shorter windups, and stronger pressure balanced against reduced player speed and starting damage
- Six escalating Jade Grove waves: 4 teaching scouts, then 10, 18, 30, 48, and a 72-enemy siege; Bamboo and Crimson finales reach 112 and 150 enemies before difficulty, corruption, and co-op multipliers
- Large armies use a difficulty-, chapter-, and party-scaled active combat budget. The entire authored army remains present as reinforcements, but excess enemies wait at the perimeter and replace defeated fighters instead of forming an unreadable instant pileup.
- Ward-defense missions have a short opening grace period, limited simultaneous ward attackers, and a survival-scaled damage ceiling. Ignoring the ward still loses the room, while active defense has a fair reaction window.
- Chapter story scenes before the first wave and before the guardian confrontation
- Dedicated Jadeguard Tanuki boss artwork, a 2,600-HP boss HUD, three phases, staff sweep, stunning ground slam, radial jade projectiles, phase summons, enrage, and chapter-clear story payoff
- A branching Choose Your Path screen between waves with Combat, Elite, Heal, Shop, Treasure, and Shrine nodes
- Enemy gold rewards, mutation-scaled elite routes, twelve run relics, and a functional Moon Market with persistent purchases
- Shop purchases include Dual-Wield, weapon damage, maximum health, ability-power improvements, and healing; active abilities remain tied to the level 2/4/6/8 earned ladder.
- Chapter 2: Bamboo Hollow, with build-preserving moon-gate transition, six unique pre-boss arenas ending at Hollow Moonstone Causeway, a separate Moonfang Burrow guardian court, and six escalating 14/14/22/30/84/112-enemy waves
- Bamboo Stalkers with twin-sickle attacks, Spore Archers with visible bow draw/release, and stun-maul Moss Brutes
- A dedicated 5,200-HP Moonfang Komainu boss atlas and fight with crescent sweeps, cleaves, moon projectiles, summons, and enrage
- Chapter 3: Crimson Dojo, with six unique pre-boss arenas ending at Shogun War Processional, a separate Oni Gate Throne guardian court, and six-wave 12/20/30/42/112/150-enemy escalation
- Ember Akita swordsmen, Gongwing ranged monks, and stunning Ironhorn pillar brutes with a dedicated combat/VFX atlas
- A giant 7,600-HP Pyreclaw Shogun Tora boss with flaming sweeps, gong impacts, fire lanes, summons, and enrage
- Every guardian death now opens a three-choice guardian chest instead of immediately skipping ahead. Jadeguard and Moonfang blessings create major offense, defense, economy, status, and mobility pivots for the next chapter; the unclaimed choice persists as a safe checkpoint.
- Pyreclaw’s defeat ends with three final vows—Mercy, Power, or Freedom—each granting a different permanent shard payout and a fully authored hero-specific epilogue before the result screen.
- Spirited, Ferocious, and Nightmare difficulty selection with real health, speed, damage, and reward scaling
- Ten post-clear Ascension ranks that compound enemy health, pursuit speed, damage, pack size, spawn cadence, and shard rewards after every successful clear
- Persistent spirit shards, campaign clears, best-difficulty records, highest level, and capped legacy health/gold bonuses
- A fully walkable Spirit Lantern Village hub with the Hero Shrine, Spirit Forge, Relic Altar, Mission Board, Dojo, Charm Shop, and Portal Gate
- A real Spirit Dojo combat laboratory with four target/armor tiers, passive or live enemy AI, temporary ability access, dual-wield switching, rolling DPS, total damage, best DPS, status timers, target breaks, and isolated progression-safe resets
- Two starting heroes with persistent title-screen and Hero Shrine selection: rapid precision gunner Kitsune and cannon-tank Bamboo
- A third earned hero, Hopscotch, unlocks after the first complete campaign clear: a production-painted directional rabbit archer with a delayed full bow draw, visible release follow-through, piercing Moonstring arrows, and dedicated rose/cyan travel and petal-shard impact VFX
- A fourth earned hero, Rusty, unlocks after the first Ascension clear: a production-painted directional raccoon trickshot with synchronized twin revolvers, paired recoil, dedicated cyan/gold rounds and impacts, and Bank Shot ricochets that seek another nearby enemy
- Bamboo's production-painted eight-direction movement/firing atlases, portrait, wide three-pellet Bamboo Cannon, heavier recoil and impacts, slower Iron Roll, 185 base health, damage/knockback resistance, and stationary Iron Belly brace
- Hero-driven HUD, portraits, weapon/dash names, animation sheets, contact-shadow scale, and Twin Spirits behavior; active abilities remain locked at the start for both heroes
- Live title-screen hero/weapon comparison with four five-pip role ratings, weapon identity tags, damage, fire rate, projectile count, and critical chance sourced directly from hero and weapon definitions
- Five deterministic elite mutations across later waves and elite routes: Swift, Bulwark, Frenzied, Volatile, and Splitter, each with visible labels, colored ground auras, mechanical counterplay, bonus rewards, and chapter-scaled appearance rates
- Breakable Bulwark shield bars, delayed Volatile death zones, Splitter reinforcements, shortened Frenzied warnings, faster Swift attack cycles, and eight new elite-focused upgrade/relic rewards
- Shared Burn, Wet, Shock, and Stun definitions with centralized application, status-duration scaling, shield-breaking damage, elite damage, critical chance, projectile-count, and bounty-healing build hooks
- Four authored specialist threats with full 24-cell directional/action atlases: Bellweaver Cat summoners, Powderkeg Toad bomb hoppers, Gatewarden Rhino shield bearers, and Mistclaw Lynx assassins
- Bellweavers perform two bounded jade rituals before switching to spirit fire; their portal VFX and summoned guard cap prevent runaway enemy counts
- Powderkegs lead moving players with dedicated paw-bomb fuse and detonation art, a readable one-second escape window, and a large delayed blast
- Gatewardens regenerate a breakable front-only guard, visibly turn their shield toward the player, and deliver a telegraphed stunning shield bash that rewards flanking
- Mistclaws fade while marking their exact destination, blink past the player, and commit to a high-speed twin-dagger strike; they first appear late in Bamboo Hollow and join the Crimson warhost
- Four five-rank permanent upgrade tracks for starting health, gun damage, ability power, and run gold; active abilities still begin locked every run
- Hub campaign records, control training, spatial interaction prompts, and a portal-driven campaign start
- Weighted Common, Rare, and Epic level-up offers with a guaranteed early ability option, one free reroll, escalating paid rerolls, and a recovery-focused skip choice
- Four combat-changing build recipes: Steam Burst, Storm Current, Guardian Tempest, and Twin Cinders, with persistent HUD badges
- Authored Story Event and Secret route nodes with branching costs, relics, weapon evolutions, ability-power rewards, curses, and harder high-reward follow-up waves
- Reusable boss-pattern and boss-profile data now owns windup/action/recovery timing, damage identity, phase labels, and per-phase schedules for Jadeguard, Moonfang, and Pyreclaw
- A persistent Spirit Archive Codex records enemies and guardians when first encountered, with data-driven hero/weapon stats, status interactions, enemy counterplay, and each guardian's actual phase patterns
- All three guardians now gain Sealing Crossfire in later phases: a profile-scaled set of intersecting floor lanes that locks to the player's position, clearly warns, then converges with a stunning impact

For direct boss QA, open `http://127.0.0.1:4174/?boss=1`; normal play always requires clearing the full chapter first.
Route QA checkpoints are available at `?route=1`, `?route=2`, and `?route=3`; they are not used during normal play.
Chapter 2 QA is available at `?chapter=2`, with `?chapter=2&boss=1` for Moonfang; these QA routes provide a reinforced test loadout and do not affect normal balance.
Chapter 3 QA is available at `?chapter=3`, with `?chapter=3&boss=1` for Pyreclaw. Add `&difficulty=nightmare` to validate maximum pressure.
Hub station QA is available at `?hub=heroShrine` or `?hub=portal`; normal play enters the village at its central plaza.
Systems QA is available at `?system=levelup`, `?system=event`, `?system=secret`, `?system=synergy`, `?system=elites`, `?system=specialists`, `?system=capstone`, `?system=evolutions`, `?system=pressure`, `?system=room6`, and `?system=codex`.
Mission QA is available at `?system=mission&mission=anchors`, `?system=mission&mission=rescue`, and `?system=mission&mission=defend`; add `&chapter=2` or `&chapter=3` to validate biome-specific mission schedules and palettes.
Guardian reward QA is available at `?system=guardianReward`; combine it with `&chapter=2` for Moonfang or `&chapter=3` for Pyreclaw’s final-vow and epilogue sequence.
Sealing Crossfire can be inspected immediately at `?system=crossfire`; combine it with `&chapter=2` or `&chapter=3` for each guardian's profile-scaled version.
Interactive Dojo QA is available at `?system=dojo`; normal play enters it spatially from the Dojo station in Spirit Lantern Village.
Hero QA can be forced with `?hero=kitsune`, `?hero=bamboo`, `?hero=hopscotch`, or `?hero=rusty`; combine one with `&system=dojo` to compare weapon animation, spread, draw timing, piercing, ricochets, DPS, Twin Spirits, and hit response.
Ascension QA can be forced with `?difficulty=ascension`; the production menu unlocks it only after one full campaign clear and raises the rank after every Ascension victory.
Jade route QA is available through `?route=1..5`; selecting a node enters the corresponding next painted room. Use `?system=room6` for the final pre-boss arena and `?boss=1` for the dedicated guardian court.
The same checkpoints work with `?chapter=2&route=1..5` and `?chapter=3&route=1..5` for the Bamboo and Crimson room sets.

The full production sequence for upgrades, procedural routes, boss, hub, progression, and content expansion is tracked in `GAME_PLAN.md`.

The current visual direction and production prompts for ChatGPT-generated ability artwork are in `CHATGPT_ART_HANDOFF.md`.

## Verify

```powershell
npm.cmd test
node --check src/game.js
```
