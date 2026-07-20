# Spec — voice input & file upload in the idea composer

> Status: **specced, not built.** The mic and link buttons in
> [`web/src/components/Composer.tsx`](../web/src/components/Composer.tsx) are currently no-ops
> (`title="coming soon"`). This doc is the plan for wiring them.

## Context

Both features feed the same place: the **agent chat → memory extraction** loop (M2). The data model
already anticipates voice — memories carry `source_type: "voice"` and the memory card renders a mic
icon for it ([`ideas/[id]/page.tsx`](../web/src/app/ideas/[id]/page.tsx), the `source_type === "voice"`
branch). So the schema is ready; only the capture path is missing.

The governing constraint is **BYOK**: the chat model runs on the user's own key, decrypted per request
in the agent layer, never stored in Pluggie. Any feature that spends against that key has to answer:
*whose key, and is it metered?*

---

## 1. Voice input

### Option A — Web Speech API (browser-native) — **recommended to ship first**
- `SpeechRecognition` transcribes live, in-browser, as the user speaks.
- **Cost: none.** No API call, no BYOK spend, no metering question. This is why it goes first.
- Output is plain text dropped into the composer draft — identical to typing. No new server path.
- Trade-offs: quality varies by browser (strong in Chrome, absent in Firefox), weaker on long or
  technical speech, needs a mic-permission prompt. Feature-detect and hide the mic button where unsupported.
- `source_type` for resulting memories stays `"chat"` (it became text before the agent saw it), **or**
  we tag the message `voice` so the memory is stamped `source_type: "voice"` and gets the mic icon.
  Recommend the latter — it's the only thing that lights up the existing voice affordance.

### Option B — record → model transcription (Whisper-class)
- Record with `MediaRecorder`, POST the audio blob to a transcription endpoint, insert the returned text.
- Higher quality, browser-agnostic.
- **Cost: real, and it's a second spend.** Transcription is billed separately from chat completion.
  - If it runs on the user's BYOK key: their provider must offer transcription (Anthropic does not today —
    this would mean a second provider key, or a platform-funded fallback). This is the crux of the
    "not counted for" gap — a BYOK chat key does not automatically cover audio.
  - If platform-funded: we pay per minute of audio and must rate-limit it.
- Defer until there's a reason to — Option A covers the 80% case for free.

**Decision needed before building B:** whose key pays for transcription, and is it metered per minute.

---

## 2. File upload

Flow: attach button → file picker (accept `.txt`, `.md`, `.pdf`) → upload → parse text server-side →
feed the agent.

Two ways to feed it:

- **(a) As chat context** — inject the file's text into the next turn's context only. Ephemeral,
  simple, no new persistence. Good for "read this and react."
- **(b) Through memory extraction** — **recommended** — run the parsed text through the same extraction
  path a chat turn uses, so a pasted spec becomes durable memories with provenance
  (`source_type: "upload"`, `source_label: <filename>`). Fits the "memory is the spine" model and makes
  uploads first-class knowledge, not throwaway context.

### Guards
- **Over-capture** (the M2 failure mode): a long document can flood the memory tab. Cap extracted
  memories per upload and/or summarize-then-extract rather than extract-per-paragraph.
- **Size / type limits**: reject non-parseable types up front; cap file size (e.g. a few MB); PDF text
  extraction only, no OCR in v1.
- **Cost**: extraction spends the BYOK chat key — same meter as a normal turn, so no *new* billing
  question here (unlike voice Option B). A large doc = a large turn; surface that.
- `source_type: "upload"` is a **new enum value** on the `memories` collection — add it before building (b).

---

## Recommended path
1. **Voice → Option A (Web Speech).** Free, no metering question, ships the mic button now.
2. **Upload → Option (b), feeding memory extraction**, with an over-capture cap and a new
   `source_type: "upload"`.
3. **Voice Option B** only if users hit the quality ceiling — and only after the "whose key / is it
   metered" call is made.

## Open questions for the owner
- Voice: accept Web Speech's browser-limited quality for v1, or hold out for model transcription?
- Upload: cap on extracted memories per file — a fixed number, or summarize-first?
- Do voice-sourced messages get stamped `source_type: "voice"` (lights up the existing icon) or left as `"chat"`?
