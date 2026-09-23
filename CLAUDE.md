# Tree Walk 3D Map — BC Children's Hospital

Interactive 3D map of the Tree Walk on the BCCH / BC Women's campus. A Three.js web
viewer moves a camera around a stylized model of the grounds; 14 numbered stops mark the
trees on the tour. Primary audience is hospital staff, on their phones.

Repo: `Mellenger-Interactive/tree-walk`

## Current phase

Modeling. The work right now is Blender: the campus base map exists, and tree species are
being modeled one at a time. There is no web app in the repo yet. Don't propose app
architecture, frameworks, or build tooling unless asked — when the viewer starts, it's
plain Three.js loading `.glb`, no React.

## Layout

```
source/map/map_v1.blend       campus base map (buildings, ground, roads, markers)
source/trees/<species>.blend  high-detail source model
source/trees/<species>_lowpoly.blend   game-res version, the one that ships
osm/map.osm                   OpenStreetMap extract the base map was built from
tree pictures/                on-site reference photos of the real trees
treetour_marker_coords.csv    the 14 stops in local metres
3d_tiles/                     empty; placeholder for Google 3D Tiles
```

## Coordinates

Everything is metric, 1 Blender unit = 1 m, Z-up. Local origin is
lat 49.24435997, lon -123.12417984; `treetour_marker_coords.csv` gives each stop as
`x_m, y_m` from that origin. Keep that origin fixed — trees, markers and the base map all
depend on it. Three.js is Y-up, so expect a swap at export/import, not in the source files.

## Style: low poly, no foliage cards

The trees are **hand-modeled low poly with solid geometry canopies** — no alpha planes, no
leaf cards, no textures. `deodar_cedar_lowpoly.blend` is the reference for how this looks:

- `Deodar_Cedar_LowPoly` (empty) parents `DeodarLP_Foliage` (1,860 tris) and
  `DeodarLP_Trunk_Branches` (682 tris) — about 2.5k tris for the whole tree, ~22 m tall,
  base at z = 0.
- Flat shading throughout. No UV maps on the tree meshes.
- Color comes from **vertex colors** feeding Base Color on a Principled BSDF
  (`DeodarLP_Foliage`, `DeodarLP_Wood`). There are no image textures anywhere in the
  project and it should stay that way — it keeps the load tiny and the look consistent.
- The `Preview_Environment` collection (camera, sun, ground plane) is lighting setup for
  looking at the model. It is not part of the asset and must not be exported.

New species follow the same shape: one empty named `<Species>_LowPoly`, meshes named
`<Species>LP_Foliage` / `<Species>LP_Trunk_Branches`, materials `<Species>LP_Foliage` and
`<Species>LP_Wood`, trunk base at the origin, real-world height. Silhouette carries the
species — a deodar cedar should read as a deodar cedar from a phone screen at a glance.
Use the photos in `tree pictures/` as reference.

## Base map conventions

`map_v1.blend` is ~100k tris. Object prefixes are meaningful and should be preserved:

- `BLD_*` buildings. Campus buildings use `M_wall_campus` / `M_roof`; the ones people
  navigate by (Teck Acute Care, Shaughnessy, BCCH, BC Women's, Ambulatory Care) use the
  `_hero` materials instead.
- `GND_*` ground, roads, paths, parking, helipad. `GND_base` alone is 53.7k tris — more
  than half the scene — and is the first thing to decimate if the map gets heavy.
- `TREE_####` 44-tri filler trees from OSM, not tour trees. The 14 tour species replace
  these as they're modeled.
- `TREETOUR_01`–`14` empties mark the stops; `TT_PIN_01`–`14` are the visible markers.
- `profile_*` curves are the road/path sweep profiles the `GND_` road meshes were built
  from — keep them, they're how the geometry gets regenerated.
- Materials are all `M_*` flat colors. Same rule as the trees: no textures.

## Pipeline

`.blend` is the source of truth; `.glb` is build output and can always be re-exported.
Export Y-up, +Z forward, apply modifiers and transforms, selected objects only, and leave
preview/lighting collections out. Vertex colors must survive the export — that's the
entire material.

## Notes

- Blender 5.x wrote these files.
- The 27 MB high-poly `deodar_cedar.blend` is committed, so the repo is already large.
  Ask before adding more multi-MB binaries; consider whether the high-poly source needs
  to be in git at all.
- There's no `.gitignore` yet.

## Working with me

- Ask before adding dependencies or restructuring folders.
- For Blender work, drive Blender directly through the connection on my machine rather
  than handing me scripts to paste. If Blender isn't running, say so and I'll open it.
- Keep answers short. I'd rather iterate than read a plan.
