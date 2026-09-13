# Stonetop Adventures

Adventure sites for the [Stonetop](https://stonetop-wiki.github.io/welcome-to-stonetop.html)
tabletop RPG, written to be run straight off the screen: prep, travel, room-by-room
notes and stat blocks on one sheet, with clickable dice, HP trackers and hover
previews of the rulebook pages each site draws on.

Published at <https://bryan-legend.github.io/stonetop-adventures/>.

| Sheet | Where | Run at a table |
|---|---|---|
| [Underfalls](https://bryan-legend.github.io/stonetop-adventures/Underfalls.html) | A Rime Lord shrine under the ice falls, Whitefang Mountains | yes |
| [Vasilya’s Grove](https://bryan-legend.github.io/stonetop-adventures/Vasilyas-Grove.html) | A corrupted Forest seed, deep in the Great Wood | yes |
| [The Drowned Choir](https://bryan-legend.github.io/stonetop-adventures/Drowned-Choir.html) | A Suarachan lair in a Green Lord hall on the Fen’s one hill, Ferrier’s Fen | yes |
| [The Green Lord’s Tomb](https://bryan-legend.github.io/stonetop-adventures/Green-Lords-Tomb.html) | Sajra the swyn’s lair, a day and a half into the Great Wood | not yet |
| [Kneeroot](https://bryan-legend.github.io/stonetop-adventures/Kneeroot.html) | The Willow Witches’ abode, somewhere in Ferrier’s Fen | not yet |
| [The Sealed Cave](https://bryan-legend.github.io/stonetop-adventures/Sealed-Cave.html) | The hills above Stonetop; a Peacebond discovery | not yet |
| [The Quern](https://bryan-legend.github.io/stonetop-adventures/The-Quern.html) | A prophecy plotline from Stonetop to Gordin’s Delve | not yet |

## How the sheets work

Every sheet is one hand-written HTML file. The shared chrome is `site.css` and
`site.js` beside them; the rest — palette, faces, dice rollers, HP trackers,
hover previews, campaign sync — is the [Stonetop Wiki](https://stonetop-wiki.github.io/)'s
own `css/wiki.css` and `js/wiki.js`, loaded from the published wiki by absolute
URL, so the sheets need a connection to look right and the wiki's chrome never
has to be copied here.

A sheet's `<body>` carries:

| Attribute | Purpose |
|---|---|
| `data-wiki-root` | The wiki's URL, for hover previews, icons and dice sounds |
| `data-hp-storage` | The `localStorage` key its HP trackers write under (unique per site) |
| `data-notes-slug` | The key its written answers are kept under (`sites/<Name>`, kept from when the sheets lived under the wiki) |
| `data-playtested` | `"true"` once the site has been run at a table |

Links into the rulebook are `<a class="wiki-link" data-slug="…">` pointing at
`https://stonetop-wiki.github.io/<slug>.html`; the wiki's script turns them into
hover cards.

Ticked boxes, HP and written answers are kept in the browser and can be shared with
the whole table through the wiki's campaign sync (the **Campaign** panel in the
sidebar).

A sheet can carry a small **three.js model** of the site under its map: a
`div.site-map-3d` in the map sidebar, an import map for three, `site-model.js`
(the shared mount: renderer, orbit, labels, fullscreen button), and a short inline
script that builds the geometry and returns the camera. The labels are the same
room links as the SVG. Underfalls, Vasilya’s Grove and the Drowned Choir have one.

## Rulebook text

The books' text quoted on these sheets is from *Stonetop* and *Stonetop: The Wider
World and Other Wonders* by Jeremy Strandberg (Lampblack & Brimstone), released under
CC BY-SA 4.0. No book artwork is reproduced.
