# AGENTS.md

Guidance for AI coding agents working in this repo. Human overview: [README.md](README.md).

## What this is

An interactive 3D map of the 14-stop Tree Walk at BC Children's / BC Women's campus. Audience: hospital staff on phones, often for a spare minute. Priorities: fast load, obvious navigation, no motion discomfort.

## Current phase

Mostly Blender modeling. A plain Three.js viewer already exists in `docs/` and works. Keep it small. **Do not** propose app architecture, frameworks (no React), state management, or build tooling unless asked.

## Repo map

- `docs/` the static web viewer: `index.html`, `main.js`, `trees.js`, `style.css`, `models/map.glb`.
- `source/` Blender sources (`source/trees/<species>_lowpoly.blend`, `source/map/map_v*.blend`). **Gitignored**, local only.
- Gitignored, local only (live in the shared drive): `source/`, `osm/map.osm` (OSM extract the base map came from), `treetour_marker_coords.csv` (the 14 stops in local metres), `tree tour revised.pdf` (tree guide source), `tree pictures/`, and `Claude outputs/`. Do not commit them.

## Hard rules

- **Ask before** adding dependencies, adding multi-MB binaries, or restructuring folders.
- The viewer is vanilla Three.js loaded from a CDN import map (pinned version in `docs/index.html`). No bundler or `package.json` unless the user approves.
- **The repo is code only**, plus `docs/models/map.glb`, which the viewer needs. Do not commit `.blend`/`.blend1`, `osm/`, the coordinates CSV, the guide PDF, `tree pictures/`, `Claude outputs/`, or `.DS_Store`. They are in `.gitignore`; keep it that way, and ask before adding any other non-code file.
- `docs/models/map.glb` is build output (~8 MB). Re-export from Blender rather than hand-editing. Ask before changing it.

## Coordinates and orientation

1 Blender unit = 1 m, Z-up, local origin lat 49.24435997, lon -123.12417984. Stops are `x_m, y_m` from that origin in `treetour_marker_coords.csv` (local file, not in git). **Never move the origin.** Three.js is Y-up; the swap happens at export/import, not in the source files.

## Model style (trees)

Hand-modeled low poly, solid geometry canopies. **No alpha planes, no foliage cards, no image textures.**

- Flat shading, no UV maps. Color comes from **vertex colors** into a Principled BSDF. Vertex colors must survive export.
- Names: empty `<Species>_LowPoly` parents meshes `<Species>LP_Foliage` and `<Species>LP_Trunk_Branches`; materials `<Species>LP_Foliage` and `<Species>LP_Wood`.
- Trunk base at the origin (z = 0), real-world height. Reference: `deodar_cedar_lowpoly.blend` (~2.5k tris).
- The silhouette must identify the species at a glance on a phone. Use the photos in `tree pictures/`.
- `<species>_lowpoly.blend` is the one that ships. High-detail sources (e.g. `deodar_cedar.blend`, 27 MB) are for reference only.

## Model style (base map)

Preserve the object prefixes: `BLD_*` buildings (hero materials for Teck Acute Care, Shaughnessy, BCCH, BC Women's, Ambulatory Care), `GND_*` ground/roads/paths, `TREE_####` OSM filler trees (replaced as tour trees are modeled), `TREETOUR_01`-`14` stop empties, `TT_PIN_01`-`14` visible markers, `profile_*` road/path sweep curves (keep, used to regenerate geometry). Materials are flat `M_*` colors, no textures. `GND_base` is the first thing to decimate if the map gets heavy.

## Export

Blender is the source of truth. Export `.glb` Y-up, +Z forward, modifiers and transforms applied, selected objects only. Leave out preview/lighting collections (`Preview_Environment`). Each tree object must keep its `tour_stop` custom property (1 to 14); the viewer finds trees by it.

## Viewer behavior to preserve

- Stop content lives in `docs/trees.js`. `stop` must match the model's `tour_stop`. Optional `view: { theta, phi, zoom }` sets a stop's camera angle.
- The walk is a loop (14 links to 1). The URL hash (`#stop-N`) selects a stop.
- Rendering is on demand (only when something changed). Keep it that way for battery.
- No auto-spin or aggressive camera motion. Respect `prefers-reduced-motion`.
- Users must be able to jump straight to a stop from the list, not only fly there manually.
- Phone first: thumb-reachable controls, readable labels, fast first paint. Do not block first paint on loading the whole map.
- Tree guide text comes from Oliver McDermott's guide (`tree tour revised.pdf`, local file). Do not rewrite facts without the user's say-so.

## Working in Blender

Use the Blender connection on the user's machine. Do not hand the user scripts to paste. If Blender isn't running, say so and let the user open it.

## Local check

```bash
python3 -m http.server 8000 --directory docs
```

Open `http://localhost:8000`. Test on a real phone when the change affects touch, layout, or performance.

## Style of work

Short answers. Iterate rather than present long plans.
