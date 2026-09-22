# AI Section Generator

A mock AI-powered UI section generator built with Next.js.  
Type a prompt → get a rendered, editable section → save it to disk.

---

## How to run

**Prerequisites:** Node.js (LTS) and npm must be installed.

```
cd section-generator
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.  
The dev server runs on port 3000. No environment variables are required.

---

## What it does

| Step | Action |
|---|---|
| 1 | Type a prompt in the top bar and click **Generate** |
| 2 | The server matches keywords and returns a structured JSON node tree |
| 3 | The frontend renders the tree recursively — no hardcoded UI components |
| 4 | Click any text element to edit it inline |
| 5 | Click **Save Changes** to persist the edited tree to disk |

---

## Keyword routing

`lib/templates/index.ts` matches the prompt (lowercased, trimmed) with these rules, in order:

| Pattern matched | Template returned |
|---|---|
| `pricing`, `price`, `tier`, `plan` | `pricing` |
| `hero`, `landing`, `banner`, `headline` | `hero` |
| _(anything else)_ | `fallback` |

The fallback template renders a section that names the supported keywords, so an unrecognised prompt produces a usable result instead of an error.

---

## Storage

Saved documents are written to:

```
section-generator/.data/sections.json
```

This file is created automatically on the first save. It is a plain JSON object keyed by document id:

```json
{
  "<id>": { ...SectionDocument },
  "<id>": { ...SectionDocument }
}
```

The file is excluded from version control via `.gitignore`.

The in-memory map is cached on `globalThis` so that hot-reloads during development do not lose documents that have already been saved to disk.

---

## Known limitations

- **Concurrent saves are not serialised.** Two simultaneous `POST /api/sections` requests could interleave their file writes. Acceptable for a prototype; a lock queue would be needed in production.
- **No real AI model.** The "AI" is a keyword router — `pricing`, `price`, `tier`, `plan` → pricing layout; `hero`, `landing`, `banner`, `headline` → hero layout; anything else → fallback.
- **No real database.** Storage is a single JSON file on disk. A real deployment would use a database.
- **No authentication or multi-user support.**
- **No automated test suite.**
- **Only text is editable.** Adding, deleting, reordering, or restyling nodes is out of scope.
