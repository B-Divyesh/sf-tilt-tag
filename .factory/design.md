# Tilt Tag visual thesis

## Direction

Tilt Tag is a cinematic environmental arcade game set inside a vast, abandoned magnetic observatory. A small copper magnet travels across a slate instrument table while amber targets glow like captured signals and red interference fields cut through the dark. The scale contrast makes phone movement feel consequential without hiding the game board.

The interface is single-mode and dark by design. Deep surfaces reduce glare during motion play, and bright copper and mint marks remain readable outdoors. The generated scene is subordinate background art; every control and sentence sits on an opaque slate plate.

## Palette

The palette comes from oxidised copper, dark stone, fog, and warning lamps in the hero scene.

| Token | Value | Use |
| --- | --- | --- |
| night | `#071417` | Page background |
| basin | `#102529` | Raised surface |
| plate | `#173438` | Controls and panels |
| chalk | `#F3F0DF` | Primary text |
| mist | `#B7CBC6` | Secondary text |
| copper | `#F4A261` | Primary action and magnet |
| ink | `#132022` | Text on copper |
| signal | `#76E6C4` | Targets and success |
| flare | `#FF6B5E` | Hazards and errors |

Body copy on night and plate exceeds 4.5:1. Ink on copper exceeds 7:1. Status never relies on colour alone; targets use rings, hazards use triangles, and every state has text.

## Type and spacing

Fraunces SemiBold is the display face. Its soft, carved forms suit the observatory's physical instruments. Atkinson Hyperlegible is the body face because tilt play demands quick reading at arm's length. Both are OFL-licensed and self-hosted as WOFF2 files, with `font-display: swap`.

Spacing follows an 8 px scale: 8, 16, 24, 32, 48, 64, and 96 px. Body text stays within 66 characters. Buttons are at least 48 px tall; game controls are at least 56 px.

## Layout and shape language

The first screen is an asymmetric two-part stage: a concise task plate overlaps the environmental scene, while a running portrait game board remains visible beside it. On phones, the task plate stays compact so the real canvas and its touch pad enter the 390 × 844 cold viewport. Panels use clipped corners inspired by instrument plates. Targets are circular; hazards are sharp; buttons use a copper lower edge that reads as a physical control.

## Game feedback and difficulty

A run lasts 90 seconds. Targets appear in deterministic positions from the displayed daily seed. The opening 20 seconds use wide lanes and slower hazards. Hazard speed and count rise at 30 and 60 seconds. Each target scores 100 points plus a short streak bonus. Hitting a hazard removes one of three shields and briefly pushes the magnet away. Losing all shields or reaching zero time ends the run. Seated mode lowers acceleration and hazard speed; touch mode provides full parity.

## Motion policy

The signature motion is magnetic pull: nearby target rings lean and contract toward the player. UI changes use 180–240 ms opacity and transform transitions. The background drifts by no more than 12 px in response to pointer or device tilt. Hit shake is limited to 160 ms and can be switched off. With `prefers-reduced-motion`, seated mode, or reduced motion enabled, parallax, shake, particles, and translating entrances stop; feedback changes instantly with opacity and outlines. Nothing flashes faster than 3 Hz.

## Art plan and provenance

The main asset is a wide cinematic observatory interior with an oversized copper magnet suspended above a stone instrument basin. The centre-right area stays quiet for interface overlap. A derived crop supplies the 1200 × 630 social preview. Game objects and icons are original Canvas 2D geometry, not raster sprites.

Prompt sheet: “Cinematic environmental concept art of an abandoned magnetic observatory at night, monumental circular stone instrument basin, one oversized horseshoe magnet made from weathered copper floating above it, tiny mint signal lights, soft mineral fog, deep blue-black slate, warm amber rim light, realistic tactile materials, 28 mm lens, wide composition, generous dark negative space on the left and calm centre, no people, no text, no numbers, no logos, no watermark, no interface, no brands, no extra magnets, no neon gradient.”

The hero image is generated for this product with the factory image model on 2026-09-01. Source PNG and prompt metadata live in `assets/src/`. Shipped WebP crops are optimized below 300 KB. Generated imagery is disclosed in the footer.
