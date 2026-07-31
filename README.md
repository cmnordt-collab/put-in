# Put-In

A searchable guide to paddling access in North Carolina, for boards, kayaks and canoes.

## What is in this folder

    site/
      index.html          the whole website, one file
      data/spots.json     the spot data the site reads
    make_spots.py         rebuilds spots.json from the spreadsheet
    put-in-v1-data.xlsx   the working data file, the real source of truth

## The editing loop

Edit spots in the spreadsheet, never in the JSON. Then run:

    python3 make_spots.py

That rewrites `site/data/spots.json`. Upload the new JSON and the site updates.
Editing the JSON by hand works right up until the next time you run the script,
which will quietly overwrite it.

## Looking at it on your own machine

Double-clicking `index.html` will not work, and this is normal. Browsers refuse to
let a page read neighbouring files when the address starts with `file://`. To view
it locally, open a terminal in the `site` folder and run:

    python3 -m http.server

Then go to `http://localhost:8000` in your browser. Press Ctrl+C to stop.

## Putting it online

1. Create a free account at github.com.
2. Make a new repository. Name it `put-in`. Set it to Public. Tick "Add a README".
3. Open the repository, click "Add file", then "Upload files".
4. Drag in the **contents** of the `site` folder, so that `index.html` sits at the
   top level and `data/spots.json` sits in a `data` folder beneath it.
5. Go to Settings, then Pages in the left sidebar.
6. Under "Build and deployment", set Source to "Deploy from a branch", branch to
   `main`, folder to `/ (root)`. Save.
7. Wait two or three minutes. The address appears on that same page and looks like
   `https://yourname.github.io/put-in/`.

To update later, upload the changed file to the same place. The site refreshes on
its own within a minute or two.

You do not need to learn git for any of this. If you would rather not use the
website interface, GitHub Desktop is an ordinary app with a sync button.

## Rules this project follows

**A blank field means unverified, not absent.** This matters most for hazards and
dams. The site says "Not recorded yet" rather than leaving a gap that reads as No.

**Every spot carries its source.** Each record stores the agency page it was
checked against, and the date. Anything that cannot be sourced stays blank.

**No safety score.** A single number would flatten facts that paddlers need to
weigh themselves, and would imply a confidence the data does not have.

## Credit where it is owed

Spot data comes from NC State Parks, the NC Wildlife Resources Commission, Durham
Parks and Recreation, and the Lower Haw River State Natural Area. Water quality and
river safety knowledge comes from the Haw River Assembly and the Eno River
Association. Live conditions come from the National Weather Service and the USGS.

Riverkeepers and water nonprofits do the monitoring that makes this site possible.
They should be contacted and credited before this goes anywhere public.
