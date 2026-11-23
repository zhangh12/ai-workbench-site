# AI Workbench: page prototype

A prototype of a product page that plays short animations where the reader scrolls to them. Nothing on the page
is a video file: each block is drawn live in the browser by animation code, and plays when its region has been
held in the middle of the screen for a moment.

Two blocks for now. The page is not final.

## Run it
```sh
cd video && npm ci && cd ..          # fonts and KaTeX
python3 -m http.server 8137          # from the repository root
```
Then open http://localhost:8137/video/site/index.html

Values to try in the address: `?tol=12&dwell=400` (how near the middle, in percent of the screen height, and for
how many ms), `?snap=0` (no snapping to the middle), `?guide=1` (shows where the middle is).

## Files
- `video/site/`: the page (`index.html`, `page.css`, `page.js`) and its browser check (`check.py`).
- `video/src/`: the animation code the blocks are drawn with. `shots.js` has the words.
- `video/data/data.js`: the numbers shown, from public and synthetic data.
- `.github/workflows/site-check.yml`: runs the check on Windows in Chrome, Edge, Firefox and WebKit.

The data on screen is public (the `lung` data set of R's survival package, PubMed, ClinicalTrials.gov) or synthetic.
