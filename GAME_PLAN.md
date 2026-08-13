# BrawlPaws Production Plan

This document turns the master brief and concept art into a staged production plan. The concept images remain the visual source of truth. Every phase must preserve the distant 3/4 camera, small detailed fighters, saturated Jade Grove lighting, brush-edged UI, readable telegraphs, and comic-impact combat language.

## Combat balance contract

- Opening time-to-kill target: 1.6â€“2.4 seconds of sustained starter weapon fire against a basic scout.
- Standard pursuit: close enough to pressure walking, slow enough that committed sprinting creates escape space.
- Burst pursuit: assassins may exceed walk speed only behind a visible windup and remain below sprint escape speed.
- Telegraph floors: every enemy role retains a minimum readable warning even when late difficulty and elites stack.
- Damage budget: standard, heavy, specialist, boss, and ambient-hazard hits each have a maximum share of current hero max health.
- Late challenge: denser combinations, formations, status interactions, and shorter safe windowsâ€”not simultaneous exponential health, speed, damage, count, and spawn-rate inflation.
- Relic rewards: always a three-choice build decision with exact effects and build-fit feedback; never an invisible random grant.

## Implemented milestone: Arsenal Awakening

- Level 3 forces a clear, non-skippable run-weapon decision: Frostbite Needle, Oni Mortar, or Gale War Fan.
- Frostbite builds visible Chill and freezes the whole enemy body; Freeze pauses normal AI and briefly interrupts guardians.
- Oni Mortar has a true impact/expiry area detonation with authored Oni blast art and weapon-specific scaling.
- Gale War Fan pierces outward, turns at maximum reach, clears its hit history, and damages/knocks back again on return.
- Each arsenal has two dedicated upgrade paths, survives checkpoints, and is transmitted with co-op attacks.
- Authored production atlases and exact generation notes live in `assets/source-art/arsenal-v1/` and `assets/vfx/`.
- Level 7 adds the Legend Arsenal: Embercoil Repeater, Tempest Chakram, and Moonpiercer Railbow replace the current run weapon with burst-Burn, returning lane-control, or charged execution play. Six exclusive upgrade branches and persistent collection discovery deepen weapon progression; authored source and alpha atlases live in `assets/source-art/arsenal-v2/` and `assets/vfx/arsenal-tier2-v1.png`.

## Current playable baseline

The current Visual Combat Prototype V2 provides the first quality gate:

- One large Jade Grove courtyard with a fixed wide 3/4 camera
- Kitsune and Bamboo with selectable, data-driven eight-direction idle, run, and ranged firing presentation
- Slow Grove Minions, a committed lunge brawler, two spirit archers, and one armored hammer brute introduced in stages
- Eight-direction draw/release, windup/strike, and windup/slam enemy attacks
- Tight contact shadows, telegraphs, recoil, knockback, hit-stop, camera shake, damage numbers, impact words, death bursts, and magnetizing XP shards
- A 4800×2700 Jade Grove room with a quiet opening beat and enemy arrivals spread across the first 17 seconds
- Jadebreaker's slow planted hammer slam with a large warning radius and a unique player-stun consequence
- Spirit Blaster primary fire and Fox Step at level one; Undertow Well, Foxfire Volley, Wild Heart, and Shock Paws are earned during the run
- Rising XP thresholds, a combat-pausing three-card level-up screen, 45 upgrade choices, repeatable ranks, Dual-Wield, hero-specific build paths, piercing, critical-draw mastery, conductive chaining, and five earned weapon capstones
- Dedicated six-frame travel, impact, enemy-attack, elemental-status, and ambient-environment atlases
- Animated lantern flames, drifting spirit wisps, water ripples, moving petals, and swaying environment props
- Gameplay HUD, title screen, level-up flow, two chapter story scenes, chapter clear, defeat, and restart loop
- Six escalating Jade Grove waves culminating in a 72-enemy siege
- A dedicated multi-phase Jadeguard Tanuki with production sprite atlas, boss HUD, planted sweep, stunning slam, radial jade fire, phase reinforcements, enrage, and defeat sequence
- A complete second chapter transition that carries Kitsune's level, health upgrades, unlocked abilities, relics, gold, and Dual-Wield build through the moon gate
- Bamboo Hollow's animated moonlit arenas, six escalating 14/14/22/30/84/112-enemy waves, and a distinct Stalker/Spore Archer/Moss Brute enemy family
- Moonfang Komainu, a second 5,200-HP guardian with six authored animation states, crescent sweeps, stunning cleaves, moon projectiles, phase summons, and enrage
- Crimson Dojo's circular mountain arenas, dedicated Ember Akita/Gongwing/Ironhorn combat atlas, dedicated six-effect VFX atlas, and 12/20/30/42/112/150-enemy escalation
- Pyreclaw Shogun Tora, a third 7,600-HP guardian with a six-state giant atlas, flaming sword sweeps, gong slams, fire lanes, summons, and Nightmare scaling above 10,000 HP
- Spirited, Ferocious, and Nightmare difficulty modes that scale health, pursuit speed, damage, and run rewards
- Versioned local profile data for spirit shards, campaign clears, best difficulty, highest level, and small capped legacy health/gold bonuses
- A walkable Spirit Lantern Village with seven spatially marked services, persistent four-track upgrade spending, campaign records, training instructions, and a portal into Chapter I
- Weighted upgrade rarity, free and gold-funded rerolls, a recovery skip, four live elemental/weapon synergy recipes, and four authored event/secret encounters with consequential next-wave modifiers
- Jade Grove now has six distinct pre-boss arenas ending at Jade Warden Processional plus a separate Jadeguard Approach guardian court
- Bamboo Hollow and Crimson Dojo match that structure with new Moonlotus Reservoir, Sporelight Monastery, Hollow Moonstone Causeway, Cinder Pagoda Rooftops, Ashen Drum Foundry, and Shogun War Processional locations plus dedicated guardian courts
- Spirit Lantern Village's Dojo is now an interactive, progression-isolated combat laboratory with real enemy AI, target armor tiers, status inspection, dual-wield switching, fast cooldown recovery, and rolling damage metrics
- Bamboo is now the first complete alternate hero: a slower cannon tank with 185 base health, inherent damage/knockback resistance, a stationary Iron Belly brace, a heavy three-pellet ranged volley, distinct dash tuning, portrait, and full directional movement/firing art
- Hero choice persists in the profile and is available on both the title screen and at the Hero Shrine; all HUD labels, animation assets, weapon behavior, and contact shadows resolve from the selected hero definition
- Five reusable elite mutations now escalate deterministically from zero in the opening wave to dense late-game packs: Swift speed/cooldowns, Bulwark shields, Frenzied warning/damage pressure, delayed Volatile death blasts, and Splitter reinforcements
- Elite mutations have dedicated aura/label/shield presentation, bonus gold and XP, eight counter-build upgrades/relics, a shared damage resolver, and an isolated `?system=elites` validation route
- Burn, Wet, Shock, Stun, Bleed, Curse, and Ward now have shared data definitions, explicit player/enemy ownership, centralized application paths, body-readable reactions, checkpoint migration, Codex guidance, and run-build hooks
- Bellweaver Cat, Powderkeg Toad, and Gatewarden Rhino now form a reusable authored specialist family with dedicated 24-cell directional/action atlases and a separate six-frame ritual, bomb, explosion, and shield-impact VFX sheet
- Specialist mechanics now add bounded reinforcements, predictive delayed area denial, and front-only regenerating guard counterplay to later waves without changing the intentionally simple opening encounter
- The title screen now compares the selected hero and starting weapon using data-driven power, toughness, mobility, control, weapon tags, damage, fire rate, projectile count, and critical chance
- Guardian timing, damage identity, phase labels, and phase schedules now live in reusable BossPattern and BossProfile definitions consumed by all six current boss fights
- Guardian profiles now also own per-phase tempo and recurring arena-domain cadence: predictive Bellstorms, persistent Moonblooms, Oni-fire corridors, Tempest Eyes, and Firewall Overrides create five mechanically distinct late-fight pressure tests
- Mistclaw Lynx is the fourth authored specialist: a full directional movement/strike atlas, visible destination mark, fading windup, committed blink relocation, and readable twin-dagger follow-through
- Storm, Neon, and Shadow now gain their own authored specialists from room three onward: Tidechant Heron conducts a warned moving surge lane, Kernel Hacker Tanuki plants a predicted sprint-draining snare, and Moonveil Seer applies a visible sprint-cleansable curse. All three use full 24-cell idle/run/attack atlases and world-space effects behind character bodies.
- The Spirit Archive Codex is playable from the title, Mission Board, and `K` pause shortcut; its hero, enemy, guardian, and status panels consume live definitions while encounter discoveries persist in the profile
- Sealing Crossfire is the fourth reusable guardian pattern, with profile-specific lane count, width, damage, later-phase schedules, diagonal counterplay, and a full warning/action presentation
- Hopscotch is the third production hero and first earned roster unlock: a rabbit archer with portrait, 16-cell directional movement and draw/release sheets, a timed Moonstring Longbow release, piercing projectiles, and a dedicated six-frame rose/cyan arrow/impact atlas
- The run pool now contains 37 upgrades and 12 relics, adding Kitsune gunner, Bamboo fortification, Hopscotch bow, and Rusty trickshot branches plus Phase Nova, Siege Lotus, Moon Constellation, and Deadeye Circuit capstones
- Full active runs now have versioned, room-safe continuation snapshots that restore hero, difficulty, build, unlocks, relics, currency, chapter, story/route state, and elapsed time
- Title and in-run pause flows now expose persistent accessibility controls for screen shake, full-screen flashes, damage numbers, and ambient scenery motion
- Rusty is the fourth production hero and second earned roster unlock: a directional raccoon trickshot with portrait, 16-cell movement and double-gun attack sheets, inherent twin-revolver volleys, target-seeking Bank Shot ricochets, dedicated cyan/gold projectile VFX, and three hero-specific upgrade tracks
- Zap is the fifth production hero and a two-campaign earned unlock: a directional rabbit Techie with portrait, movement, paired-caster attack, authored ability/reaction atlases, and dedicated arc VFX. Its low opening damage builds Conductive marks, the third hit chains into nearby bodies with individual shock reactions, and three focused upgrades lead into Thunderhead Array rather than another dash mechanic.
- Ascension is the post-clear difficulty ladder: ten persistent ranks compound enemy health, pursuit speed, damage, pack size, spawn cadence, and shard rewards; its first clear unlocks Rusty

This build is the combat laboratory. New systems should be integrated into it only after they can meet the same visual-readability bar.

## Non-negotiable quality gates

Every milestone is reviewed against the supplied gameplay, loadout, hub, hero-roster, shop, level-up, boss, and route-screen references.

1. **Camera and scale:** player remains about 4–7% of viewport height; normal play never permanently zooms in.
2. **Animation:** every playable attack and dangerous enemy attack reads correctly in eight directions with anticipation, action, and follow-through.
3. **Grounding:** tight foot-contact shadows, correct depth sorting, foreground occlusion, and no floating sprites.
4. **Combat feedback:** visible attack shape, impact spark, recoil, damage number, hit-stop, particles, sound, and proportional camera reaction.
5. **Readability:** player, enemies, attacks, loot, and telegraphs are brighter and clearer than decorative scenery.
6. **Visual identity:** no generic dashboard UI, programmer art, flat gray arenas, auto-fire survivor gameplay, or oversized characters.
7. **Performance:** target stable 60 FPS with bounded particles, reusable effects, and efficient collision queries.

## Phase 1 — Core combat (complete baseline)

- Responsive acceleration-based movement and full directional facing
- Wide camera, combat bounds, collision props, and depth sorting
- Primary attack input, projectiles/hit detection, health, damage, knockback, death, room-clear flow
- Melee, ranged, heavy, summoner, bomber, and directional-shield enemy controllers with fair telegraphs
- One handcrafted Jade Grove test room

**Exit gate:** movement, aiming, dash, and enemy avoidance feel responsive without enlarging the characters or moving the camera closer.

## Phase 2 — Combat presentation (current validation)

- Eight-direction character rendering and attack atlases
- Archer visibly draws, aims, releases, and follows through in all directions
- Brawlers wind up and commit to weapon strikes; boar visibly prepares and slams
- Contact shadows reduced to soft ellipses directly under the feet
- Muzzle flashes, trails, impact stars, elemental colors, comic words, XP shards, and enemy death bursts
- Recorded Mixkit audio layers now cover weapons, dash, light/heavy impacts, enemy strikes, elemental abilities, healing, upgrades, boss slams, and soft background music; independent music/SFX controls and anti-stacking mix limits keep large armies clean
- Browser startup uses a critical-art priority gate, cached-image and load-error handling, deferred later-chapter sheets, and a 3.2-second maximum overlay so Chrome reaches play without waiting on the entire campaign asset library
- All six playable heroes now own production-painted eight-pose state atlases: distinct Undertow, Foxfire, Wild Heart, and Shock Paws casts plus authored hit recoil, stun, defeat, and victory silhouettes. These frames are routed from live combat state and preserve the existing eight-direction primary-fire sheets.

**Exit gate:** screenshots and live motion plausibly belong to the same game as the concept art. No attack can look like a static sprite sliding into a target.

## Phase 3 — Abilities (playable baseline complete; content polish next)

Current unlockable loadout:

- **Undertow Well:** aimed pack trap that pulls enemies together, applies a five-second 40% Wet slow, and explicitly primes Foxfire Steam Bursts plus empowered Shock damage
- **Foxfire Volley:** five-shot directional flame fan, direct damage, visible four-second burn, 6-second cooldown
- **Wild Heart:** instant heal, green aura, temporary 35% damage reduction, 12-second cooldown
- **Shock Paws:** 4.2-second global storm with repeated links and impacts against every active enemy; deals 50% bonus damage to Wet targets
- **Ability evolutions:** level-9+ Epic capstones now turn each invested ability into a new behavior: Undertow collapses twice, Foxfire becomes a nine-flame spreading inferno, Wild Heart ends in a life-draining bloom, and Shock Paws delivers a final room-wide judgment strike

Next ability work:

- Balance the completed nine-condition registry across later chapter armies, guardians, and co-op snapshots. Burn, Wet, Shock, Chill, Freeze, Stun, Bleed, Curse, and Ward now share data-driven duration, reaction, expiry, Codex, enemy, player, guardian, and co-op serialization contracts.
- Add per-ability upgrade hooks rather than branching logic inside the player controller. **Implemented:** every ability definition declares a cast and evolution hook; the input controller now validates and dispatches through the hook registry, and Wild Heart's evolved expiry is routed through the same data contract.
- Move remaining duration ticks and VFX routing fully behind the shared status registry. **Duration and expiry routing complete:** all non-damage-over-time conditions tick through one registry loop; Burn and Bleed retain their shared damage tick handlers, while Chill-to-Freeze now applies through the same status API.
- Extend the landed hero state atlases into multi-frame cast/action/recovery sequences after gameplay timing is locked. **Timing complete:** every ability now declares cast duration and release time; its effect fires on that visible release, while the dedicated hero silhouette moves through anticipation, commit, recoil, and recovery without surrendering aim-facing to movement.
- Continue balancing evolution availability and damage against chapter corruption, guardian health, and high-rank Ascension armies
- Online party combat now transmits authored weapon timing, ability anticipation/release, live aim, movement cadence, and the resulting shared projectiles/status effects. Remote allies use their own directional fire and state atlases instead of appearing as non-combat moving avatars.
- Host-authoritative enemy targeting now treats every living party member as a valid combatant. Standard attacks, specialist blinks/bombs, projectiles, guardian sweeps, slams, crossfires, and signatures select and damage remote allies through the same invulnerability and status contract; guests reject duplicate local damage prediction.
- Shared online progression now awards each ally host-issued kill gold, XP, and elite road resources while retaining individual level-up drafts. Guest shots transmit a bounded build signature so damage, extra projectiles, critical chance, pierce, and ricochet choices remain mechanically real under host authority.
- Co-op defeat is party-based: a fallen BrawlPaw becomes untargetable and can be revived in-world by an ally holding interact nearby. Revive progress is visible above the body, health restoration is synchronized, and the expedition only ends when the entire connected party is down.

**Exit gate:** abilities are mechanically distinct, readable at game scale, aim correctly in eight directions, and display clear cooldown states.

## Phase 4 — Roguelite systems (expanded playable layer)

- XP thresholds, level progression, and combat pause during selection are playable
- Three-card level-up presentation, weighted Common/Rare/Epic rarity, keyboard/mouse selection, one free reroll, escalating gold rerolls, and a recovery skip are playable. Every offer now labels its role/rank, states the concise effect, compares the live current and resulting stat, and previews any immediately unlocked synergy.
- All six chapters now carry four checkpoint-safe narrative beats—opening, post-seal-two revelation, post-seal-four escalation, and guardian confrontation—with visible seal progress and a concise next objective
- 45 meaningful upgrade definitions now cover five hero weapon capstones, four ability evolutions, weapon evolution, four ability unlocks, hero-specific mastery, damage, speed, health, per-ability ranks, shield breaking, elite and guardian hunting, critical mastery, piercing, Conductive chaining, economy, and bonus projectiles
- Twelve functional relics: Lucky Coin, Spirit Mask, Thunder Seal, Blood Vial, Dragon Scale, Rainbow Feather, Ward Bell, Oni Contract, Moon Pearl, Phoenix Plume, River Mirror, and Guardian Fang
- Four automatic recipe synergies are playable and visible in the HUD: Steam Burst, Storm Current, Guardian Tempest, and Twin Cinders
- Gold, spirit shards, keys, hero tokens, loot tables, pickup bursts, and reward summaries
- Synergy resolver built from tags and recipes: fire + dash, water + electric, critical + bleed, spirit + clone

Initial upgrade set:

1. Abyssal Grip — larger Undertow Well, stronger pull, and a deeper collapse hit
2. Drowning Hold — Undertow pins Wet enemies near its center long enough to line up the next attack
3. Flame Wake — wider and longer burn trail
4. Cinderbite — burn can critically strike
5. Heart Bloom — stronger heal and max-HP bonus
6. Second Pulse — Wild Heart emits a healing pulse on expiry
7. Quick Paws — attack speed
8. Critical Claws — critical chance and damage
9. Spirit Chamber — projectile count or piercing
10. Foxfire Magazine — elemental burst after a firing streak
11. Perfect Step — heal or empower on perfect dash
12. Storm Current — Shock Paws gains another jump and consumes Wet to release a secondary burst

**Exit gate:** at least three noticeably different viable builds can emerge from one short run; choices are more interesting than tiny percentage-only increases.

## Phase 5 — Rooms, routes, and rewards (six-chapter multi-room foundation complete)

- Handcrafted room-template data separated into floor, collision, walls, props, decorations, foreground, lights, gates, spawns, and interactables
- Forty-two production-painted combat rooms are playable across six chapters: every one of the thirty-six pre-boss waves has its own location and all six giant guardians have dedicated courts.
- Six escalating combat seals per chapter now create thirty pre-boss encounters, scaling from four opening scouts to 72/112/150/186/218-enemy chapter finales before difficulty multipliers. A staged chapter-, wave-, difficulty-, route-, and co-op-scaled active budget grows from an eight-enemy tutorial ceiling into high-pressure late-chapter armies. Golden-angle arrival distribution and continuous reserves preserve the full army without an instant unreadable pileup.
- All thirty combat seals now have authored objectives: named elimination packs, destructible curse anchors, spatial spirit rescues, and timed wards with real health. Objectives own HUD progress, arena actors, completion gates, rewards, checkpoint state, and ward-break failure consequences. Ward missions use a brief grace window, an eight-attacker pressure budget, and a duration-scaled maximum DPS so they demand active defense without mathematically failing before the player can react.
- Route-selected Sacred Springs, Spirit Vaults, and Hero Shrines now exist as physical room objectives, while breakable pots and crates provide optional gold and experience
- Minimum eight Jade Grove templates: courtyard, bamboo bridge, ruined shrine, root garden, lantern crossroads, crystal terrace, flooded gate, guardian approach
- Room state machine: enter → lock → spawn → fight/event → reward → unlock → route choice
- Branching procedural route of roughly 10–15 rooms plus boss
- Combat, elite, treasure, shop, shrine, heal, authored event, authored secret, and boss nodes are playable
- Route constraints guarantee useful pacing, one shop, one heal opportunity, elite risk/reward, and a boss approach
- Physical shop room, shrine interactions, treasure chest animation, destructible pots/crates/lanterns, secret triggers, and rewards
- Full brush-styled route selection screen with progress track, build summary, three-way node choices, and keyboard/mouse selection is playable
- Circular in-run minimap now tracks the player, active threats, co-op allies, mission targets, physical rewards, village services, and giant guardians without revealing unreleased army reserves
- Functional Moon Market spends run gold on healing, Dual-Wield, weapon, health, and ability upgrades

**Exit gate:** two consecutive runs differ meaningfully while every room still feels handcrafted and visually dense.

## Phase 6 — Jadeguard Tanuki boss (first complete fight playable)

- Large dedicated arena and staged entrance
- Top-center boss health bar and Spirit Fury/enrage messaging are playable
- Seven patterns: staff sweep, ground slam, circular shockwave, spirit zones, charge, radial projectiles, low-HP enrage
- Telegraph grammar shared with normal enemies but larger and more dramatic
- Pattern scheduler prevents unfair overlaps and protects recovery windows
- Boss damage reactions, two phase transitions, guardian summons, enrage, and defeat sequence are playable. Every guardian now opens a checkpoint-safe three-choice blessing chest; Pyreclaw’s chest branches into three authored final vows, epilogues, and reward payouts.

**Exit gate:** every lethal action is understandable before impact, the boss is 3–7 times player scale without obscuring Kitsune, and the fight tests movement, dash timing, ranged pressure, and build power.

## Phase 7 — Spirit Lantern Village hub (playable baseline complete)

- Fully walkable hub rather than a menu backdrop is playable
- Hero Shrine, Forge, Relic Altar, Dojo, Shopkeeper, Mission Board, and Portal Gate are spatially readable and interactive
- Permanent health, weapon, ability, and starting-gold ranks can be purchased with banked Spirit Shards
- Campaign records, difficulty record, controls, locked-ability rules, and campaign portal flow are playable
- The Mission Board now hosts five persistent, claimable campaign contracts tied to real kill, elite, Burn-finish, seal-clear, and guardian-defeat events; each rewards spirit shards plus one restrained future-run modifier
- Animal NPCs, ambient dialogue, lantern lighting, navigation signs, and interaction prompts
- Dojo supports damage testing, ability preview, and input practice
- Portal opens hero/loadout/difficulty selection and starts a run

**Exit gate:** all major services are readable spatially and can be reached without a full-screen menu replacing the world.

## Phase 8 — Permanent progression and save (baseline playable)

- Versioned profile v4 includes explicit v1→v4 migrations, untrusted-data sanitization, guarded reset, and portable JSON export/import
- Persist settings, key bindings, spirit shards, unlocks, hub ranks, discoveries, realm seals, expedition milestones, Ascension state, hero mastery, weapon collections, and campaign-contract progress/claim records; cosmetics remain expansion work
- Separate resumable-run snapshot with room seed, route, build, health, currency, and active room
- Death rewards progress without making permanent power invalidate combat mastery
- Corruption recovery and explicit reset/export/import options

**Exit gate:** closing/reloading preserves progression, failed runs award expected resources, and old saves survive schema updates.

## Phase 9 — Complete UI flow

- Main menu and settings
- Hero roster and character detail panel
- Play/loadout screen with hero, weapon, starting ability, charms, relics, biome, difficulty, and run summary
- In-run HUD, pause, codex, minimap, objective tracker, shop, level-up, route selection, death, victory, and results
- Brush-edged dark panels, neon borders, illustrated cards, controller/keyboard prompts, and accessibility settings
- Keyboard remapping, twin-stick controller combat/menu navigation, hold/toggle fire, and patterned high-contrast combat markers are playable and profile-persistent

**Exit gate:** every screen matches the concept's visual hierarchy, remains usable at supported resolutions, and can be navigated with mouse/keyboard and controller.

## Phase 10 — Content expansion

Only after the complete Jade Grove run is fun and stable:

- Heroes after completed Bamboo, Hopscotch, and Rusty: Zap and Nomi
- Weapons: Katana, Bo Staff, Shuriken, Blaster, Paint Roller, Gauntlets, Spear, Twin Daggers
- Enemy archetypes: summoner, bomb hopper, authored shield bearer, and destination-marked assassin are playable with dedicated assets and behaviors; five elite modifiers apply across the full roster
- All six biome chapters now own complete enemy families, story beats, layered combat regions, optional routes, and dedicated guardian courts; the next phase is continuous-world streaming and cross-chapter visual polish
- Additional bosses, relics, abilities, synergies, events, missions, cosmetics, difficulties, and challenge modes

Each new hero requires complete directional movement, primary attacks, ability casts, hit/death/victory states, portrait/loadout art, VFX, audio, and gameplay tuning before release.

## Data and code architecture

Definitions should be immutable content data; runtime state should remain separate.

- `HeroDefinition`: stats, resources, controller profile, animation set, passive, loadout rules
- `WeaponDefinition`: combo/projectile sequence, timing, damage, range, knockback, crit, rarity, tags, VFX/audio
- `AbilityDefinition`: input, cooldown, targeting, effects, status payloads, upgrade hooks, tags
- `EnemyDefinition`: stats, behavior profile, attacks, telegraphs, drops, elite modifiers, animation set
- `RelicDefinition`: triggers, modifiers, stacks, tags, synergy hooks
- `BiomeDefinition`: palette, rooms, encounter tables, music, boss, prop set
- `RoomDefinition`: layers, bounds, navigation, gates, spawns, rewards, node eligibility
- `RunState`: seed, route, room index, hero build, health, currency, objectives
- `ProfileState`: version, unlocks, permanent resources, settings, discoveries

Systems communicate through gameplay events such as `attackStarted`, `hitResolved`, `enemyKilled`, `dashCompleted`, `statusApplied`, `roomCleared`, and `rewardChosen`. This keeps weapons, abilities, relics, and synergies composable and prevents hero-specific switch statements from taking over the main loop.

## First complete-build target

- 4 fully playable heroes: Kitsune, Bamboo, unlockable Hopscotch, and Ascension-unlocked Rusty
- 1 biome: Jade Grove
- 5 normal enemy types, 1 elite treatment, 1 boss
- 8+ handcrafted rooms arranged into a 10–15-room procedural route
- Combat, elite, treasure, shop, shrine, heal/event, and boss nodes
- 12+ upgrades, 6+ relics, XP/level-up, loot, gold, and synergy support
- Walkable hub, character/loadout selection, full HUD and route/minimap UI
- Death, victory, permanent unlocks, and versioned save system

## Immediate next milestone

Implemented pressure milestone: a measured chapter/wave curve now increases the active army ceiling, reserve release, distant pursuit, attack tempo, and recovery speed without changing Jade's four-scout opening. Late fronts maintain a browser-tested 24 simultaneous animated attackers with hundreds still reinforcing, and spatial crowd partitioning prevents dense combat from doing all-pairs collision work.

Implemented audio milestone: all six realms now select their own licensed combat music, guardian encounters switch to realm-tuned heavy variants, and the persistent master/music/SFX/ability/UI mix remains fully adjustable.

Implemented Arsenal blueprint milestone: all six authored Arsenal weapons are permanently discovered through their actual run drafts, displayed as production-art contracts in the Spirit Forge and Portal loadout, persisted per hero, and guaranteed only at level 3 or level 7. Binding never changes the level-1 hero weapon or ability locks, so earned choice expands replayability without weakening the intended low-power opening.

Expand the remaining weapon roster, deepen hero-specific upgrade trees, add further earned evolutions, and tune the full six-chapter difficulty curve from the low-power opening through Tsukiko and Ascension without weakening the current animation, telegraph, and combat-feedback bar. Nomi and her Moonreturn Glaive are complete; the next content milestone is broader arsenal choice and deeper mastery progression.

## Locked campaign direction — giant expedition worlds

The room-route prototype is now migration material, not the final campaign shape. Each campaign must become one very large continuous expedition map whose authored rooms are connected regions rather than disconnected stages.

- A run begins in a protected, low-threat landing area. Threat, XP value, loot rarity, enemy mechanics, and guardian pressure increase as the player travels farther from safety.
- One expedition contains multiple visually and mechanically distinct biomes, hidden routes, landmarks, roaming packs, treasure spaces, shrines, merchants, extraction gates, and a distant giant final guardian.
- Enemies reward XP and loot according to visible threat tier. Safer farming remains possible but inefficient; dangerous regions are the fastest route to power.
- Death returns the player to the village with permanent currencies and discoveries, while temporary run power is lost. Permanent progression is deliberately long: heroes, starting contracts, relic capacity, services, and later worlds require many successful expeditions rather than one clear.
- Defeating the world guardian offers an explicit choice: continue exploring the cleared world or extract to the village. The next giant world unlocks only after the prior world is cleared.
- Terrain must be constructed from layered ground, collision, architecture, foreground, ambient animation, interactables, and biome transitions. A single flat background image is never considered a finished map.
- First-launch onboarding uses skippable character-led cutscenes with typed dialogue, then tracked lessons for move, aim, fire, sprint, dash, loot, upgrades, and extraction. Every lesson verifies the action, offers Skip, and has a timeout/fallback so it cannot soft-lock.
- Combat readability is non-negotiable: world attacks render behind combatants, telegraph centers remain translucent, impacts animate on the body without replacing it, and a local silhouette plate guarantees that the player and enemies are never hidden by VFX.

### Migration order

1. Add the tracked tutorial director and character-led dialogue presentation.
2. Convert Jade's authored combat spaces into connected streaming regions with terrain layers and traversal corridors.
3. Add distance-based threat/XP/loot bands, exploration discoveries, extraction, and death banking.
4. Place Jade Grove, Bamboo Hollow, Crimson Dojo, Storm Coast, Neon City, and Shadow Realm as regions within Expedition World I, with a far-edge guardian citadel.
5. Gate Expedition World II behind the World I guardian clear and preserve the continue-or-extract choice. **Implemented:** the village portal now exposes a locked/unlocked expedition atlas; Hollow Moon Ascension is a finite 12-region run with fresh power, escalating pressure, guardian gates at 6 and 12, checkpoint-safe extraction, and its own permanent completion record. The uncapped Endless Road remains the optional post-World-I continuation.

Tutorial director milestone implemented: new profiles now receive six saved, character-led lessons for movement, ranged fire, sprinting, Fox Step, cache loot, and the first scouts. Dialogue types onto a portrait-led cutscene, live tasks track the actual input/result, enemies remain dormant until combat training, and every lesson has both a visible skip and a timeout fallback.

Hero mastery and endless-road milestone implemented: every hero now owns a persistent 50-rank mastery record with kills, guardians, best Endless Road, and deliberately restrained milestone bonuses that preserve the weak opening. Defeating Tsukiko banks the completed campaign immediately, then offers a clear extract-or-continue choice. Continuing keeps the exact run build through repeating six-realm trials with escalating health, damage, pursuit, pack size, spawn cadence, elite pressure, and an uncapped late-road health layer. Every sixth road is a guardian; banking saves all extra road shards, while falling saves half. Every decision, wave, and guardian is checkpoint-safe.

Prestige mastery milestone implemented: each hero now continues from the rank-50 gameplay-power cap to rank 100 through a cosmetic-only road. Hunter, Spirit Lantern, Guardian Oath, Astral Road, and Mythic Crown crests unlock at 5/25/50/75/100, equip independently per hero at the Spirit Forge, animate beneath the fighter without covering the body, and persist through profile v5 export/import. Ranks above 50 never add health, damage, gold, rerolls, or speed.
