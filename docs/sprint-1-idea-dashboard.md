# Sprint 1 — Idea dashboard: guided onboarding, chats, and management

> Depends on [Sprint 0](sprint-0-mcp-config-bugs.md). Supersedes the earlier
> `sprint-guided-onboarding.md` draft, which is folded in here.
>
> **Everything else in Hatchly stays as built.** Stream, quick ideas, wallet, spotlight, community,
> economy and admin console are untouched. The validation landing page stays **parked**.

---

## 1. What we're building

The idea workspace is missing its **feeding mechanism** — a new idea drops you into an empty hub called
"Untitled idea" and waits for you to know what to ask. This sprint replaces that with a guided
onboarding and a chat experience that behaves like a co-founder, plus the **management layer** that lets
us change the questions without a deploy.

### Locked decisions
| Decision | Choice |
|---|---|
| Pre-made chats at creation | **Placeholders** — zero model calls until opened |
| Onboarding surface | **Dedicated step**, then into the existing workspace |
| Pill answers | **Send immediately**; depth comes from the agent's follow-up |
| Brief writing | **Agent proposes, user confirms** |
| Question source | **Templated bank (3–5/chat) + model follow-ups** |
| Question resolution | **Against live state at open time** — not frozen at onboarding |
| Config | **Pluggie collections**, admin-editable, no deploy |

---

## 2. The guided turn

```
1. OPEN      Opening line + question 1 resolve from CURRENT memory + brief.     0 calls
             Already answered elsewhere? It confirms instead of asking.
2. ANSWER    Tap a pill (submits the full expanded sentence, not the label)
             · type freely · or "Help me decide"
3. REPLY     Agent acknowledges, extracts, asks the next banked question         1 call
             or a generated follow-up.
4. ENOUGH?   Agent proposes the brief text → you confirm → field written,
             card turns green, artifact unlocks.
```

**Green means "has enough," never "closed."** Chats stay open forever.

**Cost shape:** opening 0 · each answer 1 · a chat completes in ~4–6 · a full idea ~40–50.
This is the input to any BYOK-subsidy decision.

**Every answer writes:** a topic-tagged **memory** (with provenance) and an **activity** entry.
**Only foundation chats write the brief**, and only after confirmation. That asymmetry is what keeps the
brief authored rather than scraped.

**The loop:** memory + brief feed back into step 1, so a chat opened on day five asks sharper questions
than the same chat on day one — and never re-asks what you already said elsewhere. It's interpolation
from stored state, so it stays free.

---

## 3. The chat set

Eight chats plus free-form. Each maps to exactly one existing `ARTIFACT_TYPES` entry. **Positioning has
no chat** — it derives from Problem + Audience + Competition.

| Chat | Role | Signal topic | Writes brief | Unlocks |
|---|---|---|---|---|
| The problem | foundation | `problem` | Problem | Problem statement |
| Who it's for | foundation | `customer` | Audience | ICP & personas |
| What it does | foundation | `product` | Core value + First feature | MVP scope |
| Who else is doing this | sharpen | `competition` | — | Competitive landscape |
| Name & brand | sharpen | `brand` | — | Name & brand |
| First 100 users | sharpen | `gtm` | — | Go-to-market |
| How it makes money | sharpen | `pricing` | — | Pricing model |
| How you'll know it's real | sharpen | `risk` | — | Landing page copy |
| Think out loud | free | — | — | — |

`create_when` prunes per idea, so any founder sees **5–7** of them.

---

## 4. Slices

### 4.1 · Config foundation
Two new Pluggie collections, seeded.

**`chat_templates`** — `key` · `name` · `icon` · `role` · `order` · `signal_topic` ·
`feeds_brief` · `produces` · `create_when` · `system_prompt` · `opening` · `questions` (json) ·
`completion` · `active`

```jsonc
// questions
[{ "key":"sharpest_pain", "text":"Which pain is sharpest?",
   "options":[{ "label":"Restaurants get squeezed",
                "expands_to":"Independent restaurants hand a third of every order to a platform they don't control." }],
   "allow_free":true, "allow_help":true,
   "show_when":null,        // condition on onboarding answers
   "skip_when":null }]      // don't ask if this is already known
```

**`onboarding_questions`** — `key` · `order` · `text` · `sub` · `type` (`text|pick|multi`) ·
`options[]` · `show_when` · `maps_to`. Firas's "intake questions are templated, not model-generated"
is satisfied structurally: they live in data.

Template variables in `opening` and question text: `{idea_title}` `{raw}` `{broken}` `{kind}` `{who}`
`{already_done}` — plus live values resolved from memory and brief at open time.

**Done when:** all nine chats and the intake questions exist as data and are editable in the admin.

### 4.2 · Management *(the admin layer)*

**Phase 1 — Pluggie admin (this sprint).** Config lives in the two collections above, so changing a
question, reordering the deck, rewording a mentor prompt, or switching a chat off is a **data edit, not
a deploy**. Ship a short internal guide covering: how to add a chat, how to write `expands_to` so
memories read well, and what `create_when` / `show_when` / `skip_when` accept.

**Guardrails, because config can now break the product:**
- `active: false` retires a chat without deleting it (existing ideas keep their history)
- Changing a template must **not** rewrite chats already created — templates are copied at creation
- Every chat's `produces` must reference a real `ARTIFACT_TYPES` key — validate on write
  (a `beforeCreate` hook is the natural place once Sprint 0 lands)

**Phase 2 — in-app builder (not this sprint).** A visual editor in Hatchly's own `/admin` for
non-technical editing, with preview and versioning. Worth scoping only once the Pluggie-config phase
has been lived with.

**Also in scope:** the existing `/admin` console gains a read-only view of chat templates so an operator
can see what founders are being asked without opening Pluggie.

### 4.3 · Onboarding flow
- New dedicated onboarding route replacing instant idea creation
- `POST /api/ideas` extended: `{raw, answers}` → **model-generates the title** → creates the idea →
  creates placeholder chats from templates filtered by `create_when`
- Touches `NewIdeaButton`, `/api/ideas/route.ts`, new onboarding components

**Done when:** a new idea is never called "Untitled idea" and lands in a workspace with 5–7 placeholder
chats already waiting.

### 4.4 · Guided chat runtime *(the real work)*
- Render opening + question 1 from template resolved against live state — no model call
- Evaluate `skip_when` on open; confirm rather than ask when already known
- Pill → `expands_to` submission · free text · "Help me decide"
- Bank progression + model follow-ups
- Completion rule → propose-and-confirm → write brief → unlock artifact
- Touches `ChatPanel`, `/api/chat/route.ts`, `lib/agent.ts`

**Open item:** *thinness thresholds.* `completion: artifact_ready` needs a definition per artifact.
There's an existing `thin` / `thinReason` check in `ArtifactPicker` to build on, but nobody has defined
what thin means. **Settle this before starting 4.4.**

**Done when:** a founder completes a foundation chat end to end and sees the brief field written after
confirming.

### 4.5 · Workspace layout
Left icon rail nav · **Chats** as its own tab · scrollable card deck above the conversation,
collapsible upward · brief panel showing **real content** instead of empty checkboxes, with each blank
line naming the chat that fills it. **Signal map unchanged.** No progress rings or percentages anywhere.
Touches `ideas/[id]/page.tsx` plus new deck/rail components.

### 4.6 · Feedback widget
In-app widget → `shareholder_feedback` Pluggie collection (**`publicWrite: true`**, no login to submit),
stamped with the screen it came from, viewable in the admin.

**Sequencing:** 4.1 → 4.3 → 4.4 is the critical path. 4.2 follows 4.1. 4.5 runs alongside 4.4.
4.6 anytime — do it early so stakeholders can react to everything else.

---

## 5. Not in this sprint
- **BrandBucket token receiver** — Firas: connection last, after the experience is refined
- **Validation landing page** — parked
- **Voice / file upload** — see [voice-and-upload-spec.md](voice-and-upload-spec.md)
- **Monetization / BYOK subsidy** — the §2 cost shape is the input when it's picked up
- **Naming** — "stream" vs "quick ideas" unresolved from the meeting; a decision, not a build
- **Phase 2 in-app config builder**

## 6. Open items
1. **Thinness thresholds** per artifact — blocks 4.4
2. Should a completed chat **re-open a question** when the idea changes? The activity trail already
   tracks "changed my mind," and live-state resolution makes this more likely, not less
3. Do intake questions need branching beyond the digital-app case?
