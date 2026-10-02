# Tree Walk 3D Map

An interactive 3D map of the **C&W Campus Tree Walk**: 14 numbered trees around the BC Children's Hospital and BC Women's campus in Vancouver. Visitors, mostly hospital staff on their phones, open it in a browser, see the walk on a stylized model of the grounds, and tap a stop to read about the tree.

Made by [Mellenger Interactive](https://github.com/Mellenger-Interactive) with the BC Children's Hospital Centre for Mindfulness. Tree guide text by Oliver McDermott, UBC Urban Forestry student.

## What's in the repo

```
docs/                          the web viewer (static site)
  index.html                   page shell
  main.js                      Three.js scene, camera, stop selection
  trees.js                     the 14 stops: names, features to observe, fun facts
  style.css
  models/map.glb               the campus map with all 14 trees (exported from Blender)
```

The repo holds code and the one built model the site needs. Everything else is kept local in the team's shared drive and gitignored: the Blender `.blend` files (`source/`), the OpenStreetMap extract (`osm/map.osm`), the stop coordinates (`treetour_marker_coords.csv`), the tree guide source (`tree tour revised.pdf`), and the on-site reference photos (`tree pictures/`).

## Run the viewer locally

The viewer is plain HTML and JavaScript (ES modules), so it needs a local web server rather than opening the file directly:

```bash
python3 -m http.server 8000 --directory docs
```

Then open <http://localhost:8000>. To check it on a phone, open the same address from your computer's local network IP. Please test on a real phone, not just a resized desktop window.

Three.js (v0.170.0) is loaded from a CDN through an import map in `index.html`. There is no build step, bundler, or `package.json`.

## The 14 stops

| # | Tree | # | Tree |
| --- | --- | --- | --- |
| 1 | London plane | 8 | Juniper |
| 2 | Cherry blossom tree | 9 | European beech |
| 3 | Northern catalpa | 10 | Oriental plane |
| 4 | Copper beech | 11 | Blue spruce |
| 5 | Deodar cedar | 12 | Norway spruce |
| 6 | English oak | 13 | Scots pine |
| 7 | Narrow-leaved ash | 14 | Chinese fir |

The walk is a loop: stop 14 links back to stop 1.

## How it's made

```
Blender (.blend, source of truth)  →  export map.glb  →  Three.js viewer in docs/
```

- **Trees** are hand-modeled low poly, one `.blend` per species (`source/trees/<species>_lowpoly.blend`). Solid geometry canopies with flat shading and **vertex colors**. No foliage cards, no image textures.
- **The campus map** (`source/map/map_v*.blend`) holds buildings, ground, roads, paths, and the stop markers. It was built from the OSM extract.
- **The viewer** loads one file, `docs/models/map.glb`, and finds each tree through a `tour_stop` property (1 to 14) on the tree objects in the file. Stop text in `trees.js` is matched to the model by that number.
- **Coordinates:** 1 Blender unit = 1 metre, Z-up, local origin at lat 49.24435997, lon -123.12417984. Three.js is Y-up, so the swap happens at export. Keep the origin fixed: the trees, markers, and map all depend on it.

### Blender files

Source files (`.blend`, the OSM extract, the coordinates CSV, reference photos, and the guide PDF) are intentionally **not committed** (see `.gitignore`). They live in the Design Exploration shared drive. To change a model, get the latest files from there, edit in Blender 5.x, and export `map.glb` into `docs/models/`.

## Design goals

- Loads fast and is obvious to use for someone with a spare minute.
- Gentle camera: no auto-spin or aggressive motion, and it respects the reduced-motion setting.
- Jump straight to any stop from the list; stops can also be tapped on the map.
- Readable labels and thumb-reachable controls on a phone.

## Credits

- Tree guide: Oliver McDermott, UBC Urban Forestry student.
- In partnership with the [BC Children's Hospital Centre for Mindfulness](https://centreformindfulness.kelty.link/).
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

## Contributing

Ask before adding dependencies or restructuring folders. AI coding agents: see [AGENTS.md](AGENTS.md).
