# BrawlPaws — Six-Chapter Roguelite Campaign

A dependency-free playable browser roguelite with a walkable hub, permanent profile progression, six escalating regions, branching exploration, six production heroes, post-clear Ascension ranks, and six giant guardian bosses. All six realms now use ten 6,144×3,840 layered regions apiece—six campaign battlefields, one guardian court, and three optional branch destinations—with authored collision, spawns, gates, interactables, occlusion, and ambient anchors. The live minimap tracks threats, objectives, co-op allies, rewards, village services, and guardian territory, and can be disabled under Accessibility.

Runs begin with the selected hero's signature weapon and earned abilities. At level 3, Arsenal Awakening offers a mandatory three-way pivot: Frostbite Needle (Chill/Freeze), Oni Mortar (area demolition), or Gale War Fan (outward/return control). Level 7 forces a second Legend Arsenal pivot into Embercoil Repeater (burst Burn/rupture), Tempest Chakram (wide outbound/return control), or Moonpiercer Railbow (charged line execution). Each legend weapon has two exclusive upgrade branches and persistent collection discovery, while fresh runs still begin at base power.

Combat uses explicit balance contracts instead of unbounded stat stacking. Opening scouts take roughly 1.6â€“2.4 seconds of sustained starter fire; ordinary pursuers pressure walking but lose to a committed sprint; assassins can briefly exceed walking speed only after a readable warning; and single-hit damage is bounded by attack role as a share of current maximum health. Chapter, corruption, co-op, and difficulty multipliers are compressed before reaching health, speed, or damage, so late challenge comes from overlapping telegraphed threats and mixed enemy roles rather than unavoidable one-shots.

Treasure and relic events open a three-card Relic Draft with authored art, exact effects, role labels, and a real build-match cue. The chosen relic persists in run checkpoints; completing the relic pool converts future drafts to gold.

## Continuous expedition

The campaign now has one persistent 60-region Spirit Road topology spanning all six realms. Press `M` during exploration to open its expedition map; discovered and cleared regions persist in run checkpoints, and connected co-op players report their global world positions. Mouse aim owns body facing independently from movement, so strafing or retreating never flips a firing pose away from its target.

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

- `M` — open or close the persistent six-realm expedition map

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
- Keyboard commands can be rebound from Settings. Bindings persist with the profile and are included in save export/import.
- Controller: left stick moves, right stick aims independently, `RT` fires, `LT` dashes, `LB` Undertow/interacts, `X` Foxfire, `RB` Wild Heart, `Y` Shock Paws, left-stick click sprints, Menu pauses, and View opens the expedition map. D-pad/stick plus `A`/`B` navigates menus.

## Save and accessibility

- Active campaigns save a versioned checkpoint at the beginning of every story beat, route choice, combat room, and guardian room.
- **Continue Run** restores the selected hero, difficulty, build, ability unlocks, relics, resources, chapter, and room. Combat restarts from the room boundary so enemy and projectile state is always safe.
- Screen shake and combat flashes support full, reduced, and off modes. Damage numbers and ambient scenery motion can be toggled independently.
- Color Assist adds patterned high-contrast hero/enemy/danger markers without replacing the game's elemental palette, and Fire Input can switch between hold and toggle behavior.
- Settings persist locally and can be changed from the title or while the game is paused.
- Profile v4 adds explicit legacy migration, guarded reset, JSON export/import, persistent remapping, and controller preferences without invalidating older saves.
- Hero mastery now spans 100 ranks. Gameplay bonuses stop at rank 50; ranks 51–100 earn selectable animated prestige crests so the long grind stays visible without overpowering fresh runs.

## Included in this visual correction pass

- Wide fixed 3/4 camera with subtle velocity look-ahead, kick, and impact shake
- Acceleration-based movement with quick drag and full directional facing
- Deliberately modest starting Spirit Blaster damage with directional gunner poses, muzzle flash, recoil, neon projectile trails, and ranged hit reactions
- Directional dash with i-frames, afterimages, streak particles, and cooldown UI
- Jade Brawler enemies with pursuit, separation, telegraphed lunges, health, knockback, and death
- Hit-stop, damage numbers, impact rings, sparks, comic attack words, directional whole-body enemy reactions, speed-scaled run cycles, and recorded combat SFX with anti-stacking mix limits
- Adaptive licensed soundtrack with an upbeat menu, peaceful hub, six realm-specific combat identities—Jade orchestral, Bamboo melodic fantasy, Crimson percussion rush, Storm ocean tension, Neon aggressive machinery, and Shadow dark techno—and guardian-tuned heavy variants; master, music, weapon/impact, ability, and UI buses remain independently adjustable and persist across refreshes
- Chrome startup now prioritizes the opening hero, arena, enemy, and weapon art, then streams later-chapter sheets after the overlay clears; cached-image/error handling and a 3.2-second ceiling prevent one delayed asset from stranding the game
- New profiles receive six skippable, saved field lessons. Portrait-led cutscenes type out the instruction, then live play verifies movement, ranged fire, sprint, dash, loot, and the first scouts; every lesson includes a timeout fallback so onboarding cannot soft-lock.
- Ability hits drive target-specific burn recoil, wet squash, and shock jitter/tint reactions instead of placing the whole effect over the enemy body
- Grounded fade-and-rise enemy entrances, reduced normal-enemy scale, and authored locomotion cycles for every enemy family and all six guardians
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
- Thirty-six escalating pre-boss combats across six chapters: Chapter I grows from 4 slow scouts to 72 enemies, Chapter II reaches 112, Chapter III reaches 150, Storm Coast reaches 186, Neon City reaches 218, and Shadow Realm culminates in a 280-enemy Umbral Palace siege
- Every pre-boss room now carries an authored mission: eliminate a named warband, shoot and shatter curse anchors, reach and free captive spirits, or defend a damageable ward until its seal stabilizes. Mission progress is visible in the HUD, gates room completion, grants gold/XP, fails the run when a ward breaks, and persists in room-safe checkpoints.
- Physical Sacred Springs, Spirit Vaults, and Hero Shrines selected from the route screen must be reached and activated inside combat rooms; destructible pots and crates provide optional gold and XP
- Real level progression with rising XP thresholds, combat-pausing three-card choices, 45 upgrade definitions, repeatable ranks, Dual-Wield, hero-specific branches, piercing, critical-draw, conductive chaining, guardian-hunter, mobility, economy, five earned weapon capstones, and four behavior-changing ability evolutions
- Six permanent Arsenal blueprints are discovered by choosing their weapons during runs. The Spirit Forge and Portal loadout bind one blueprint per hero; the run still begins on the hero's low-power weapon with every ability locked, then the contract guarantees Frostbite Needle, Oni Mortar, or Gale War Fan at level 3, or Embercoil Repeater, Tempest Chakram, or Moonpiercer Railbow at level 7. Bound tiers return a normal build card instead of repeating the three-weapon draft.
- Every chapter adds a distinct escalating arena threat: Jade Bell Echoes launch radial volleys, Bamboo Spore Blooms create slowing zones, Crimson Ember Corridors cut fire lanes, Storm Coast Tidebreak Surges sweep walls of water, and Neon City Firewall Overrides build animated cyber lanes across the battlefield.
- Faster enemy pursuit, shorter windups, and stronger pressure balanced against reduced player speed and starting damage
- Six escalating Jade Grove waves: 4 teaching scouts, then 10, 18, 30, 48, and a 72-enemy siege; Bamboo and Crimson finales reach 112 and 150 enemies before difficulty, corruption, and co-op multipliers
- Large armies use a difficulty-, chapter-, wave-, and party-scaled active combat budget. The opening lesson remains four slow scouts with an eight-enemy ceiling, while late Shadow and high-rank/co-op battles maintain a browser-tested 24-enemy animated combat front with hundreds of rapid reinforcements. The budget ramps during each room, releases reserves faster by chapter, distributes arrivals around the arena, and keeps the rest of the authored army in perimeter reserves instead of forming an unreadable instant pileup. Spatial crowd resolution limits collision work to nearby enemies so dense battles remain practical in Chrome.
- Campaign pressure closes the gap between scheduled totals and live danger: later realms rally distant enemies into visible pursuit sprints, shorten recovery, accelerate attack cadence, and deploy warpacks while preserving full attack telegraphs.
- Ward-defense missions have a short opening grace period, limited simultaneous ward attackers, and a survival-scaled damage ceiling. Ignoring the ward still loses the room, while active defense has a fair reaction window.
- Each chapter has four checkpoint-safe story beats: the opening, revelations after seals two and four, and the guardian confrontation. Every scene carries seal progress plus a one-line next objective so the six-chapter plot remains legible between route choices.
- Dedicated Jadeguard Tanuki boss artwork, a 2,600-HP boss HUD, three phases, staff sweep, stunning ground slam, radial jade projectiles, phase summons, enrage, and chapter-clear story payoff
- Physical spirit-road gates between ordinary regions, with safe backtracking into cleared landmarks and full-screen world-map inspection kept as an optional planning tool
- Enemy gold rewards, mutation-scaled elite routes, twelve run relics, and a physical Moon Market stop: walk up to the animated shopkeeper, interact to open the compact purchase panel, then return to the in-world roads
- Story-event and hidden-secret roads now land in real safe landmarks with animated Lantern Spirit or sealed-spirit interactables; the compact consequence choice appears only after the player approaches and interacts
- Shop purchases include Dual-Wield, weapon damage, maximum health, ability-power improvements, and healing; active abilities remain tied to the level 2/4/6/8 earned ladder.
- Chapter 2: Bamboo Hollow, with build-preserving moon-gate transition, six unique pre-boss arenas ending at Hollow Moonstone Causeway, a separate Moonfang Burrow guardian court, and six escalating 14/14/22/30/84/112-enemy waves
- Bamboo Stalkers with twin-sickle attacks, Spore Archers with visible bow draw/release, and stun-maul Moss Brutes
- A dedicated 5,200-HP Moonfang Komainu boss atlas and fight with crescent sweeps, cleaves, moon projectiles, summons, and enrage
- Chapter 3: Crimson Dojo, with six unique pre-boss arenas ending at Shogun War Processional, a separate Oni Gate Throne guardian court, and six-wave 12/20/30/42/112/150-enemy escalation
- Ember Akita swordsmen, Gongwing ranged monks, and stunning Ironhorn pillar brutes with a dedicated combat/VFX atlas
- A giant 7,600-HP Pyreclaw Shogun Tora boss with flaming sweeps, gong impacts, fire lanes, summons, and enrage
- Guardian phases now accelerate through profile-specific tempos and add distinct recurring arena domains: Jadeguard predicts Bellstorm detonations, Moonfang grows slowing Moonbloom territory, and Pyreclaw cuts the court with alternating Oni-fire corridors. These layer with each guardian's authored patterns without replacing their readable windups.
- Every guardian death now opens a three-choice guardian chest instead of immediately skipping ahead. Jadeguard and Moonfang blessings create major offense, defense, economy, status, and mobility pivots for the next chapter; the unclaimed choice persists as a safe checkpoint.
- Chapter 4: Storm Coast, with six unique maritime arenas, Tideblade Otter, Galecrest Gull, and Reefbreaker Walrus armies, moving Tidebreak Surges, and a dedicated Eye of the Tempest guardian court.
- A giant 11,200-HP Raijin Kirin guardian with authored locomotion, sweep, slam, channel, crossfire, phase summons, Tempest Eye domains, and Heaven-Splitter Judgment.
- Chapter 5: Neon City, with six production-painted rain-soaked arenas; Circuit Jackal, Pulsewing Crow, and Chromeback Gorilla armies; animated rain and holograms; Firewall Override lanes; and a dedicated Shogun Core guardian court.
- A giant 14,800-HP Daikyo Oni guardian with authored movement, cyber-weapon attacks, phase legions, System Override domains, six-lane crossfire, and Oni Kernel Collapse.
- Chapter 6: Shadow Realm, with six large layered moonless arenas plus the Forsaken Mirror Vault, Eclipse Sanctuary, Dreadmoon Prison, and dedicated Throne Beyond the Moon guardian court; Shadowstep Ferret, Veilwing Owl, Graveback Bear, and Moonveil Seer armies; animated shadow fog; and predictive Eclipse Rifts.
- A giant 19,000-HP Tsukiko guardian with six spectral tails, authored movement, crescent-chain attacks, phase legions, Eclipse Sovereignty domains, seven-lane crossfire, and Hollow Moon Descent.
- Daikyo now grants a carry-forward Core Oath; Tsukiko’s defeat ends with three final vows—Mercy, Power, or Freedom—each granting a permanent shard payout and authored six-guardian epilogue.
- Spirited, Ferocious, and Nightmare difficulty selection with real health, speed, damage, and reward scaling
- Ten post-clear Ascension ranks that compound enemy health, pursuit speed, damage, pack size, spawn cadence, and shard rewards after every successful clear
- Persistent spirit shards, campaign clears, best-difficulty records, highest level, and capped legacy health/gold bonuses
- The Mission Board now offers five persistent campaign contracts for total spirit defeats, elite hunting, Foxfire burn finishes, seal clears, and guardian victories. Progress records at the real combat event, survives across runs, and opens a manual claim for shards plus one restrained permanent modifier without pre-unlocking abilities.
- A fully walkable Spirit Lantern Village hub with the Hero Shrine, Spirit Forge, Relic Altar, Mission Board, Dojo, Charm Shop, and Portal Gate
- A real Spirit Dojo combat laboratory with four target/armor tiers, passive or live enemy AI, temporary ability access, dual-wield switching, rolling DPS, total damage, best DPS, status timers, target breaks, and isolated progression-safe resets
- Two starting heroes with persistent title-screen and Hero Shrine selection: rapid precision gunner Kitsune and cannon-tank Bamboo
- A third earned hero, Hopscotch, unlocks after the first complete campaign clear: a production-painted directional rabbit archer with a delayed full bow draw, visible release follow-through, piercing Moonstring arrows, and dedicated rose/cyan travel and petal-shard impact VFX
- A fourth earned hero, Rusty, unlocks after the first Ascension clear: a production-painted directional raccoon trickshot with synchronized twin revolvers, paired recoil, dedicated cyan/gold rounds and impacts, and Bank Shot ricochets that seek another nearby enemy
- A fifth production hero, Zap, unlocks after two full campaign clears: a yellow rabbit Techie with authored movement, paired-caster firing, ability/reaction poses, portrait, and six-frame arc VFX. Low-damage pulses build Conductive marks; a third hit visibly chains through nearby enemies, while Capacitor Bank, Chain Logic, Rapid Cycle, and Thunderhead Array create an earned late-run control build.
- Bamboo's production-painted eight-direction movement/firing atlases, portrait, wide three-pellet Bamboo Cannon, heavier recoil and impacts, slower Iron Roll, 185 base health, damage/knockback resistance, and stationary Iron Belly brace
- Hero-driven HUD, portraits, weapon/dash names, animation sheets, contact-shadow scale, and Twin Spirits behavior; active abilities remain locked at the start for both heroes
- Live title-screen hero/weapon comparison with four five-pip role ratings, weapon identity tags, damage, fire rate, projectile count, and critical chance sourced directly from hero and weapon definitions
- Five deterministic elite mutations across later waves and elite routes: Swift, Bulwark, Frenzied, Volatile, and Splitter, each with visible labels, colored ground auras, mechanical counterplay, bonus rewards, and chapter-scaled appearance rates
- Breakable Bulwark shield bars, delayed Volatile death zones, Splitter reinforcements, shortened Frenzied warnings, faster Swift attack cycles, and eight new elite-focused upgrade/relic rewards
- Shared Burn, Wet, Shock, Stun, Bleed, Curse, and Ward definitions with explicit player/enemy ownership, centralized application, body-readable reactions, save-safe migration, status-duration scaling, shield-breaking damage, elite damage, critical chance, projectile-count, and bounty-healing build hooks
- Seven authored specialist threats with full 24-cell directional/action atlases: Bellweaver Cat summoners, Powderkeg Toad bomb hoppers, Gatewarden Rhino shield bearers, Mistclaw Lynx assassins, Tidechant Heron conductors, Kernel Hacker Tanuki controllers, and Moonveil Seer oracles
- Late chapters introduce their specialists only from room three onward: Tidechant warns a full moving tide lane, Kernel Hacker predicts and plants a sprint-draining snare, and Moonveil's visible curse can be sprint-cleansed before the next hit consumes it for bonus damage
- Bellweavers perform two bounded jade rituals before switching to spirit fire; their portal VFX and summoned guard cap prevent runaway enemy counts
- Powderkegs lead moving players with dedicated paw-bomb fuse and detonation art, a readable one-second escape window, and a large delayed blast
- Gatewardens regenerate a breakable front-only guard, visibly turn their shield toward the player, and deliver a telegraphed stunning shield bash that rewards flanking
- Mistclaws fade while marking their exact destination, blink past the player, and commit to a high-speed twin-dagger strike; they first appear late in Bamboo Hollow and join the Crimson warhost
- Four five-rank permanent upgrade tracks for starting health, gun damage, ability power, and run gold; active abilities still begin locked every run
- Hub campaign records, control training, spatial interaction prompts, and a portal-driven campaign start
- Weighted Common, Rare, and Epic level-up offers with a guaranteed early ability option, one free reroll, escalating paid rerolls, and a recovery-focused skip choice. Cards now prioritize offer class, rank, concise effect, and a live current-to-new stat comparison; relevant new synergies are called out directly on the choice.
- Four combat-changing build recipes: Steam Burst, Storm Current, Guardian Tempest, and Twin Cinders, with persistent HUD badges
- Authored Story Event and Secret route nodes with branching costs, relics, weapon evolutions, ability-power rewards, curses, and harder high-reward follow-up waves
- Reusable boss-pattern and boss-profile data now owns windup/action/recovery timing, damage identity, phase labels, and per-phase schedules for all six guardians
- A persistent Spirit Archive Codex records enemies and guardians when first encountered, with data-driven hero/weapon stats, status interactions, enemy counterplay, and each guardian's actual phase patterns
- All six guardians gain Sealing Crossfire in later phases: a profile-scaled set of intersecting floor lanes that locks to the player's position, clearly warns, then converges with a stunning impact

For direct boss QA, open `http://127.0.0.1:4174/?boss=1`; normal play always requires clearing the full chapter first.
Route QA checkpoints are available at `?route=1`, `?route=2`, and `?route=3`; they are not used during normal play.
Chapter 2 QA is available at `?chapter=2`, with `?chapter=2&boss=1` for Moonfang; these QA routes provide a reinforced test loadout and do not affect normal balance.
Chapter 4 QA is available at `?chapter=4`, with `?chapter=4&boss=1` for Raijin Kirin. Add `&difficulty=nightmare` to validate maximum pressure.
Chapter 5 QA is available at `?chapter=5`, with `?chapter=5&boss=1` for Daikyo Oni. Use `?chapter=5&system=pressure` and `?chapter=5&system=signature` for its arena systems.
Hub station QA is available at `?hub=heroShrine` or `?hub=portal`; normal play enters the village at its central plaza.
Systems QA is available at `?system=levelup`, `?system=legendArsenal`, `?system=legendCombat&weapon=embercoilRepeater`, `?system=arsenalLoadout&weapon=tempestChakram`, `?system=boundArsenal&weapon=oniMortar`, `?system=forgeCollection&weapon=embercoilRepeater`, `?system=statusDraft`, `?system=statuses`, `?system=story&beat=interlude2`, `?system=story&beat=interlude4`, `?system=contracts`, `?system=contracts&ready=1`, `?system=event`, `?system=secret`, `?system=synergy`, `?system=elites`, `?system=specialists`, `?system=specialists&set=late`, `?system=capstone`, `?system=evolutions`, `?system=pressure`, `?system=room6`, `?system=signature`, and `?system=codex`.
Endless Road QA is available at `?system=endlessDecision&road=5&bank=84`; `road` is the highest completed road and `bank` is the extra shard risk displayed. This test surface restores the profile after banking so it cannot grant permanent debug rewards.
Mission QA is available at `?system=mission&mission=anchors`, `?system=mission&mission=rescue`, and `?system=mission&mission=defend`; add `&chapter=2` or `&chapter=3` to validate biome-specific mission schedules and palettes.
Guardian reward QA is available at `?system=guardianReward`; combine it with `&chapter=2` for Moonfang or `&chapter=3` for Pyreclaw’s final-vow and epilogue sequence.
Sealing Crossfire can be inspected immediately at `?system=crossfire`; combine it with `&chapter=2` or `&chapter=3` for each guardian's profile-scaled version.
Interactive Dojo QA is available at `?system=dojo`; normal play enters it spatially from the Dojo station in Spirit Lantern Village.
Hero QA can be forced with `?hero=kitsune`, `?hero=bamboo`, `?hero=hopscotch`, `?hero=rusty`, or `?hero=zap`; combine one with `&system=dojo` to compare weapon animation, spread, draw timing, piercing, ricochets, Conductive chains, DPS, Twin Spirits, and hit response.
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
