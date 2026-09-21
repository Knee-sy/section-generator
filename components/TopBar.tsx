// components/TopBar.tsx
// Sticky top bar layout:
//   [Wordmark left] [prompt input + Generate button centre] [status · Save Changes right]
//
// Props:
//   - onGenerate(prompt): called when the user submits a non-blank prompt
//   - generating: disables the Generate button while the fetch is in flight
//   - onSave: called when the user clicks Save Changes
//   - canSave: enables/disables the Save Changes button
//   - saveLabel: text shown on the Save Changes button ("Save Changes", "Saving…", "Saved HH:MM", "Save failed")
//   - saveState: 'idle' | 'saving' | 'saved' | 'error' — controls button colour
//   - savedId: document id shown beside the button after a successful save (or null)

"use client";

import { useState, FormEvent, useRef } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";

interface TopBarProps {
  onGenerate: (prompt: string) => void;
  generating: boolean;
  onSave: () => void;
  canSave: boolean;
  saveLabel: string;
  saveState: SaveState;
  savedId: string | null;
}

export default function TopBar({
  onGenerate,
  generating,
  onSave,
  canSave,
  saveLabel,
  saveState,
  savedId,
}: TopBarProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || generating) return;
    onGenerate(trimmed);
  }

  // Derive Save button colour from saveState
  function saveButtonClass(): string {
    const base =
      "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40";
    switch (saveState) {
      case "saving":
        return `${base} bg-emerald-500 cursor-wait`;
      case "saved":
        return `${base} bg-emerald-600 hover:bg-emerald-700`;
      case "error":
        return `${base} bg-red-600 hover:bg-red-700`;
      default:
        return `${base} bg-emerald-600 hover:bg-emerald-700`;
    }
  }

  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur">
      {/* Wordmark */}
      <div className="flex shrink-0 items-center gap-2 select-none">
        {/* Blue "U" logo mark */}
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-extrabold text-white">
          U
        </span>
        <span className="text-base font-semibold tracking-tight text-slate-900">
          Section<span className="text-blue-600">Gen</span>
        </span>
      </div>

      {/* Prompt form (centre, grows) */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 items-center gap-2"
      >
        <input
          ref={inputRef}
          id="prompt-input"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Enter your prompt, e.g., "a pricing section with 3 tiers"...'
          disabled={generating}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
        />
        <button
          id="generate-btn"
          type="submit"
          disabled={generating || !prompt.trim()}
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon />
              Generating…
            </span>
          ) : (
            "Generate"
          )}
        </button>
      </form>

      {/* Save area (far right) */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Document id shown after a successful save */}
        {saveState === "saved" && savedId && (
          <span
            id="saved-id-label"
            className="max-w-[10rem] truncate font-mono text-xs text-slate-400"
            title={savedId}
          >
            id: {savedId}
          </span>
        )}

        <button
          id="save-btn"
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className={saveButtonClass()}
        >
          {saveState === "saving" ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon />
              {saveLabel}
            </span>
          ) : (
            saveLabel
          )}
        </button>
      </div>
    </header>
  );
}

// Tiny spinner SVG
function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
