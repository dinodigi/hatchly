# Design — file map

**Source of truth: `Hatchly.html` + `app/`.** That is v4. Build from it.

```
Hatchly.html      the app. open at http://localhost:8087/Hatchly.html
app/              its 11 jsx files, loaded in order by the html (globals, no modules)
direction/        WHERE IT'S GOING — newer than v4. Not built yet. See below.
brand/            logos (light, dark, gold-egg)
archive/          superseded. Do not build from these.
```

## Running it

Needs an HTTP server (the `<script type="text/babel" src=…>` tags break on `file://`)
and an internet connection (React 18.3.1 + Babel standalone come from unpkg, fonts
from Google). Config is in `.claude/launch.json`.

```
python -m http.server 8087 --directory Design
```

`app/` load order matters — `icons → ui → data → nav → stream → quick → idea →
workspace → hub → idea-tabs → app`. All state is seeded from `app/data.jsx`; there is
no backend. Persists to `localStorage`: `hatchly4-route`, `hatchly4-auth`,
`hatchly4-apikey`. Auth is faked — any credentials work.

## direction/

Screenshots of a Brand Kit surface **newer than v4**, whose code does not exist here.
Its nav shows destinations v4 doesn't have — Ideation, Mindmap, Structuring,
Validation (with a score of 84), Report, Launch plan, Launch ready, Tasks, Timeline,
AI Generator, Brand kit, Assets.

Note it reintroduces a **validation score**, which v4 removed. Reconcile before
building anything in this area. Red marks on the images are the founder's annotations.

## archive/

| | |
|---|---|
| `v3/` | The scorecard product: 13-dimension rubric, 4 phases with gates, archetype playbooks, brand kit, connectors + MCP, chat-history importer. `src/bundle.jsx` was its canonical build; `Hatchly.html`, `(standalone-src)`, and `(offline)` are all entry points onto it. `offline-src/` is what the 2.7 MB offline build decompresses to — identical to `src/bundle+apps+apps-tab`. |
| `spec-v1/` | The original Product & Screens Handoff. Excellent document, but it specifies v3. `handoff.txt` is a text extraction of it. |
| `refs/` | Pasted reference images — some are v4 screenshots, one is Replit's project gallery. |

**v4 deliberately dropped from v3:** the 13-dimension scorecard, versioned snapshots,
SWOT, competitive landscape, phase gates, archetype playbooks, the full brand kit,
connectors/MCP, and the "Seal" importer. Judgment was replaced by *completeness* — v4
never scores an idea, it asks whether you've said enough, and lets the crowd judge.
