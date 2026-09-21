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

## Architecture decisions

### 1. Next.js App Router with API routes

One process, one `npm run dev`, no CORS.  
No separate backend process or CORS configuration needed.

### 2. TypeScript with a discriminated-union node schema

The heart of the assignment is a nested UI-node tree.  
A discriminated union (`type: 'container' | 'heading' | 'text' | ...`) makes the recursive renderer self-documenting and catches missing cases at compile time.  
It is the first thing a reviewer reads — it had to be explicit.

### 3. Tailwind class strings live on the JSON nodes

Each node carries a complete literal `className` string.  
The backend owns all appearance decisions; the renderer stays fully generic — it reads `node.type` and `node.className` and emits the corresponding HTML tag, nothing more.  
Tailwind scans source text at build time, so class strings must be complete literals — never built by concatenation. All class strings live in `lib/templates/*.ts`, which is source and therefore scanned correctly.

---

## Node schema (`lib/schema.ts`)

```ts
export type NodeId = string;

interface BaseNode {
  id: NodeId;         // stable, server-generated, unique within a document
  className?: string; // full literal Tailwind class string
}

export interface ContainerNode extends BaseNode {
  type: 'container';
  tag?: 'section' | 'div' | 'header' | 'article'; // default 'div'
  children: UINode[];
}
export interface ListNode     extends BaseNode { type: 'list';     children: ListItemNode[] }
export interface HeadingNode  extends BaseNode { type: 'heading';  level: 1|2|3|4|5|6; text: string }
export interface TextNode     extends BaseNode { type: 'text';     tag?: 'p' | 'span';  text: string }
export interface ButtonNode   extends BaseNode { type: 'button';   text: string }
export interface ListItemNode extends BaseNode { type: 'listItem'; text: string; icon?: 'check' | 'dot' }
export interface DividerNode  extends BaseNode { type: 'divider' }

export type UINode =
  | ContainerNode | HeadingNode | TextNode | ButtonNode
  | ListNode | ListItemNode | DividerNode;

export type EditableNode = HeadingNode | TextNode | ButtonNode | ListItemNode;
export const isEditable = (n: UINode): n is EditableNode => 'text' in n;
```

### Example — the Pro pricing tier as JSON

```json
{
  "id": "n_tier_pro", "type": "container", "tag": "article",
  "className": "flex flex-col gap-5 rounded-2xl border-2 border-blue-400 bg-blue-50/40 p-6 shadow-md",
  "children": [
    { "id": "n_pro_name", "type": "heading", "level": 3, "text": "Pro",
      "className": "text-center text-xl font-bold text-slate-900" },

    { "id": "n_pro_price", "type": "container", "tag": "div",
      "className": "flex items-baseline justify-center",
      "children": [
        { "id": "n_pro_amount", "type": "text", "tag": "span", "text": "$29",
          "className": "text-4xl font-bold tracking-tight text-slate-900" },
        { "id": "n_pro_period", "type": "text", "tag": "span", "text": "/mo",
          "className": "text-lg text-slate-500" }
      ]
    },

    { "id": "n_pro_rule", "type": "divider", "className": "border-slate-200" },

    { "id": "n_pro_feats", "type": "list", "className": "flex flex-col gap-3",
      "children": [
        { "id": "n_pro_f1", "type": "listItem", "icon": "check",
          "text": "Unlimited projects",
          "className": "flex items-center gap-2 text-sm text-slate-700" }
      ]
    },

    { "id": "n_pro_cta", "type": "button", "text": "Choose Plan",
      "className": "mt-auto w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100" }
  ]
}
```

Two things the mockup forces that are visible in this example:

- **The price is two nodes, not one.** `$29` and `/mo` are different sizes on a shared baseline, so they are separate `span`s inside a flex container — and therefore two independently editable text units.
- **`divider`** exists only because the mockup shows a horizontal rule under every price. It carries no `text` field, so `isEditable` correctly excludes it from inline editing.

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

## API reference

### `POST /api/generate`

Accepts a prompt, returns a `SectionDocument`.

**Request body:**
```json
{ "prompt": "a pricing section with 3 tiers" }
```

**PowerShell:**
```powershell
Invoke-RestMethod -Method POST `
  -Uri http://localhost:3000/api/generate `
  -ContentType "application/json" `
  -Body '{"prompt":"a pricing section with 3 tiers"}'
```

**Response:** a `SectionDocument` — see schema above.  
**Errors:** `400` if `prompt` is missing, not a string, blank, or longer than 500 characters.

---

### `POST /api/sections`

Saves (or overwrites) a `SectionDocument`. Returns `{ id, savedAt }`.

**PowerShell:**
```powershell
# $doc must be a SectionDocument JSON string
Invoke-RestMethod -Method POST `
  -Uri http://localhost:3000/api/sections `
  -ContentType "application/json" `
  -Body $doc
```

**Errors:** `400` if the body is not a valid document (missing `root` field).

---

### `GET /api/sections/:id`

Returns the stored document, or `404` if not found.

**PowerShell:**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/sections/<id>
```

Use this to verify that edits were persisted after a save, and that they survive a dev-server restart.

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
