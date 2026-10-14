# Display font candidates

The hero / section-title font is set by the `--display*` variables in `src/index.css` and loaded in
`index.html` (Google Fonts). **Current choice: Syne** (normal, 600 — the preloader word uses the same weight).

These were the other finalists from the font picker (removed 2026-10-11). To switch, change the
`--display*` variables and swap the family in the Google Fonts `<link>` in `index.html` (only weight 600
is needed).

| Font              | `--display`                                  | `--display-style` | `--display-stretch` | `--display-size`              | Google Fonts family param                 |
| ----------------- | -------------------------------------------- | ----------------- | ------------------- | ----------------------------- | ----------------------------------------- |
| Syne (current)    | `'Syne', system-ui, sans-serif`              | `normal`          | `100%`              | `clamp(44px, 8.8vw, 88px)`    | `family=Syne:wght@600`               |
| Sora              | `'Sora', system-ui, sans-serif`              | `italic`*         | `100%`              | `clamp(44px, 8.8vw, 88px)`    | `family=Sora:wght@600`               |
| Plus Jakarta Sans | `'Plus Jakarta Sans', system-ui, sans-serif` | `italic`          | `100%`              | `clamp(44px, 8.8vw, 88px)`    | `family=Plus+Jakarta+Sans:ital,wght@1,600` |
| Instrument Sans   | `'Instrument Sans', system-ui, sans-serif`   | `italic`          | `100%`              | `clamp(44px, 8.8vw, 88px)`    | `family=Instrument+Sans:ital,wght@1,600` |
| Archivo Expanded  | `'Archivo', system-ui, sans-serif`           | `italic`          | `125%`              | `clamp(38px, 7.6vw, 92px)`    | `family=Archivo:ital,wdth,wght@1,125,600` |

\* Sora has no true italic; the browser slants it (faux italic), which is how it looked in the picker.

`--display-weight` was `600` for all of them.
