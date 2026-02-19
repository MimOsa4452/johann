# Feature Landscape

**Domain:** Arcade hunting / shooting gallery game (browser, desktop)
**Project:** Franna — African antelope hunting game (Phaser 3)
**Researched:** 2026-02-19
**Confidence:** MEDIUM — derived from established arcade genre conventions and Phaser 3 capabilities; WebSearch unavailable during this session

---

## Table Stakes

Features users expect from any shooting gallery / arcade hunting game. Missing = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Mouse aiming cursor (custom crosshair) | Every shooter replaces the OS cursor with a crosshair; absence feels unpolished | Low | Hide default cursor via CSS; render Phaser sprite at pointer position |
| Click / spacebar to shoot | Core interaction loop; nothing works without this | Low | Spacebar mapped to fire already per spec |
| Scope / zoom view | Hunting game genre staple; Shift-to-scope already in spec | Medium | Render a circular masked viewport overlay; apply camera zoom inside mask |
| Targets that move across the screen | Static targets feel like a slideshow, not a game | Medium | Tweened paths or physics-lite movement for antelopes |
| Hit detection feedback | Players must know immediately if they hit or missed | Low | Flash/shake on hit; dust puff or "miss" text on miss |
| Score display (HUD) | Player needs to track performance mid-round | Low | Phaser text object in fixed camera layer |
| Round timer | Timed rounds are the defining constraint of arcade games | Low | Countdown timer in HUD; end-round trigger on zero |
| Correct target vs wrong target distinction | Spec calls for distractor animals; player must be able to tell what they're aiming at before shooting | Medium | Clear silhouette differences; brief name labels optional |
| Penalty for shooting wrong targets | Distractors need mechanical consequence or players ignore them | Low | Score deduction and/or time penalty |
| Game-over / round-end screen | Closure moment showing final score; entry point for replay | Low | Scene transition; display score + "Play again" |
| Sound effects (gunshot, hit, miss) | Silence makes the game feel dead; audio is load-bearing in arcade games | Low | Phaser Sound; single-shot audio pool to avoid lag |
| Basic difficulty ramp | Pure flat difficulty kills replayability fast | Medium | Increase target speed / decrease window over rounds or time |

---

## Differentiators

Features that set Franna apart from generic shooting galleries. Not expected, but provide competitive/experiential advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Authentic African bush atmosphere | Specific setting creates mood that generic galleries lack | Medium | Layered parallax background (grass, acacia, sky); ambient sound (insects, wind) |
| Species identification challenge | Knowing which antelope is a valid target adds cognitive layer beyond reflex | Medium | Multiple antelope sprites with different silhouettes; maybe brief name flash |
| Scope sway / rifle drift | Simulates real rifle physics; raises skill ceiling and tension | Medium | Apply sinusoidal offset to scope position when held; reduce sway over time |
| Reload mechanic (limited shots per mag) | Forces cadence; prevents spam shooting | Low-Medium | Magazine counter in HUD; reload animation/sound on empty |
| Environmental distractors (birds flushing, dust clouds) | Makes scene feel alive; creates uncertainty about movement | Medium | Short-lived sprite animations triggered on timer or near-miss |
| Combo / streak multiplier | Rewards accurate burst performance; classic arcade hook | Low | Track consecutive hits; multiply score; visual combo counter |
| High score / session leaderboard | Replay driver; gives the score meaning | Low-Medium | LocalStorage for personal best; optional in-session leaderboard |
| Wind indicator affecting bullet path | Adds environmental simulation layer unique to hunting games | High | Visual wind meter; offset bullet trajectory on fire |
| Antelope behaviour states (grazing, alert, fleeing) | Animals react to shots and noise; ecosystem feel | High | State machine per animal; alert state triggers faster movement |
| Golden hour / time-of-day lighting pass | Visual differentiation; mood and legibility challenge | High | Phaser pipeline or tint cycling; affects target visibility |

---

## Anti-Features

Features to explicitly NOT build for Franna — they would add scope without adding value, or actively harm the experience.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Multiplayer / networked play | Massive infrastructure scope; not aligned with single-player arcade feel | Keep single-player; leaderboard via LocalStorage |
| Procedurally generated terrain | Terrain is atmospheric backdrop, not a gameplay system; proc-gen adds complexity for no player-facing gain | Author 1-3 hand-crafted bush scene compositions |
| Inventory / loadout menus | RPG/sim scope creep; interrupts arcade pacing | Single rifle, maybe one scoped upgrade unlocked by score |
| Realistic ballistics (drop, wind deflection full sim) | Correct simulation requires tutorial investment; arcade players want feel not accuracy | Wind sway on scope is enough; no true parabolic bullet drop |
| Story mode / cutscenes | Narrative framing costs production time and breaks arcade loop | Score screen flavour text at most |
| Microtransaction / unlock economy | Project scope and context (browser arcade) doesn't warrant this | Cosmetic variety baked into base game if needed |
| Mobile touch controls | Rifle scope + mouse aim is fundamentally pointer-device UX; touch degrades the core mechanic | Desktop-only; no responsive breakpoints required |
| Animal gore / realistic hit effects | Polarising; limits audience; out of scope for arcade tone | Stylised puff/dust hit effect; no blood |

---

## Feature Dependencies

```
Round timer → Round-end screen (timer expiry triggers end)
Round timer → Difficulty ramp (ramp tied to elapsed time or round number)
Scope/zoom view → Scope sway (sway only meaningful inside scope)
Correct/wrong target distinction → Penalty for wrong target (penalty requires distinction to exist)
Hit detection feedback → Combo/streak multiplier (streak requires hit state tracking)
Reload mechanic → Shoot action (shoot must check ammo before firing)
Score display → High score / leaderboard (leaderboard needs score system)
Targets that move → Antelope behaviour states (states extend movement system)
```

---

## MVP Recommendation

**Minimum playable experience (prioritised order):**

1. Custom crosshair cursor + mouse aim
2. Targets moving across bush scene background
3. Click/spacebar to shoot with hit detection
4. Correct antelope targets + 1-2 distractor species with penalty
5. Round timer (60 seconds)
6. Score display + wrong-target penalty
7. Scope zoom on Shift-hold
8. Hit/miss sound effects and visual feedback
9. Round-end screen with score + replay

**Defer to post-MVP:**

- Scope sway (adds polish, not blocking)
- Combo/streak multiplier (nice, but score already meaningful without it)
- Reload mechanic (adds tension but complicates first build)
- Ambient environmental distractors (birds, dust) — background feel, not core loop
- High score / LocalStorage leaderboard (trivial to add but not blocking MVP)
- Antelope behaviour states — use simple tween paths in MVP, states later
- Wind indicator — Medium-High complexity; defer until core loop is solid

---

## Sources

- Genre conventions derived from Duck Hunt (Nintendo), Cabela's hunting games, browser shooting galleries — MEDIUM confidence (training data, no live verification available)
- Phaser 3 capabilities (camera zoom, pointer events, sound, tween system) — MEDIUM confidence (well-established framework; Context7 unavailable this session)
- Scope sway and reload patterns: standard in hunting simulation sub-genre — LOW confidence (genre convention, unverified against current browser game landscape)
