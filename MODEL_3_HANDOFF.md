# MODEL 3 — Cinematic Showcase (Handoff)

## What this is

A new third page (`/our-model-3`) that maximizes the "Pyramids of Meroë feeling" within the constraints of the current GLB. Model 1 and Model 2 remain as you had them (walkthrough + Drake-style explorer). Model 3 is the polished cinematic version.

## Files added (5)

```
src/lib/cinematic-chapters.js                    (timeline)
src/components/our-model-3/CinematicScene.js     (Three.js scene + post FX)
src/components/our-model-3/CinematicJourney.js   (page UI + scroll/swipe)
src/components/our-model-3/TrACModelLight.js     (model wrapper)
src/app/our-model-3/page.js                      (Next.js route)
```

## Files changed (1)

```
src/lib/site-content.js          (added "Our Model 3" to navLinks)
```

## The cinematic ingredients

Model 3 has everything I listed in the plan, implemented as real Three.js / GLSL:

1. **Eleven chapters, scroll-driven** — not pinned-scroll like Model 1. The page uses a fixed-position stage with its own wheel/touch/key listener. One gesture = one chapter (280ms gesture-gap detection, same fix as Model 1). After the last chapter, normal scroll falls through to the footer panel.

2. **Camera drift** — every chapter declares (ax, az, ay, speed) and the scene rig adds a continuous sinusoidal offset to camera position. The frame is never frozen. This is the single biggest "feels alive" lever; Pyramids of Meroë uses it heavily.

3. **Bloom-glow post-processing** — custom Three.js effect chain (bright pass → 2-pass gaussian blur → composite). No external lib, no extra dependency. Bloom strength and threshold are chapter-driven so titles and the highlight ring catch fire on cue.

4. **Vignette + film grain** — fullscreen composite shader. Vignette is also chapter-driven (deeper on the prologue and finale, lighter mid-experience). Grain is animated against time so it shimmers like film stock.

5. **Drifting dust motes** — 220 additive-blended particles with a custom shader, slow drifting motion driven by time. Catches the warm lighting and reads as atmosphere.

6. **Golden-hour to dusk lighting** — directional sun position, color, and intensity all interpolated per chapter. Hero shots are warmer/lower; finale fades into deep dusk.

7. **Gradient sky-dome** — full sphere shader, top + bottom colours per chapter. Replaces the flat solid background. Fog colour matches the sky bottom for a clean haze blend.

8. **"Ignite" title animation** — each new active chapter title runs a keyframe animation that ramps a warm `text-shadow` bloom over ~900ms. Pyramids' move exactly.

9. **Right-rail with progress fill** — dots + an animated gradient bar that tracks chapter progress.

10. **Ambient drone audio** — built in WebAudio at runtime (no asset needed). Two detuned sines + filtered noise. Muted by default; toggle top-right. If the user enables it, it ducks softly in.

## Chapter map (11)

```
0  Prologue       — ignite, dark to dawn, title fade-up
1  Hero           — slow orbital wide of the whole site
2  Approach       — dolly in toward the entrance
3  Signpost       — eye-level on the signage pillar
4  From above     — high aerial descent (only top-down)
5  Middle room    — angled aerial through the missing roof
6  Orange counter — tight diagonal
7  Blue counter   — tight diagonal mirror
8  Every room     — slow lateral pan, highlight slides across rooms
9  Tank & solar   — push-in close-up on AQUASOL logo
10 Finale        — long slow pull-back, title fade
```

Each chapter declares its own camera, target, FOV, drift amplitudes/speed, key-light direction & colour, ambient tint, sky top+bottom, bloom strength/threshold, vignette, fog. All in `cinematic-chapters.js`. To re-tune, edit the values and the scene picks them up — no other changes needed.

## What this is NOT

Read these out loud before pitching to Hana:

- **It is not a first-person walk-through.** With the current GLB (open-top architectural plan, knee-height partition walls, top-down silhouette furniture), no amount of code can produce a Pyramids-style "I'm standing inside the room" shot at eye level. Model 3 instead gives the impression of a *cinematographer flying around the model*, which is what Pyramids of Meroë spends ~80% of its runtime doing anyway. The "interior" beats are angled aerials through the missing roof + room highlights, framed so they read as the camera descending into a space.

- **Model 1 and Model 2 are unchanged.** Both still try to do their "walk inside" thing within the same constraints, as you asked. Model 3 is the additional showcase angle, not a replacement.

## Performance note

Bloom + blur is half-res (cheaper). DPR is capped at 1.5 to keep iPhones happy. Expect ~50–60 FPS on a 2022 MacBook, ~30–45 FPS on modern iPhones. If a particular target struggles, the easy lever is in `CinematicScene.js`: drop the bloom's blur passes from 2 to 1, or scale rtBright/rtBlurA/rtBlurB at 1/4 instead of 1/2.

## Mood choice (my call, as you said)

Magic hour transitioning to dusk. Warm amber key light + cool teal/violet ambient. Each chapter pushes the colour balance slightly forward — the prologue is dark indigo, hero is amber/warm, mid-experience is full evening warmth, finale fades into deep dusk indigo. Choice was made because:
- Maximum atmospheric contrast for the dust particles + bloom to catch
- Hides the missing roof (warm rim-light from sky + cool fog blur the building edges naturally)
- Matches the emotional brief (community + warmth + a place that draws you in)

If you want to retune the palette toward neutral daylight, change the `key.color` and `bg` fields in each chapter to lighter values — the rest of the code follows.

## Open items (carried over from prior rounds)

- `BUILDING_ROT_Y` (in `TrACModel.js`) — Model 1 and Model 2 still depend on this; Model 3's `TrACModelLight.js` shares the auto-fit but applies no rotation since the cinematic angles work from any orientation.
- Karim suit photo — still pending from Hana. Drop at `public/images/about/leader-karim.jpg` when she sends it.
- The handoff doc for Models 1+2 (CAMERA_AUDIT.md, the previous HANDOFF.md) is unchanged. Their state is what it was.

## What I have NOT done

Same caveat as every round: I cannot open a browser and click through Model 3 to verify. The build was implemented against the same Three.js / React 19 / Next 16 toolchain you already have; static syntax and brace balance are clean. Test locally before pushing.

The most likely first-fix needed: if the bloom is too strong (whites blow out) tune `bloom.strength` down 0.2 across the chapters; if too weak, push the `threshold` down by 0.05.
