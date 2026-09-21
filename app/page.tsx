"use client";

import { useState } from "react";
import type { SectionDocument } from "@/lib/schema";
import { updateNodeText } from "@/lib/tree";
import TopBar from "@/components/TopBar";
import NodeRenderer from "@/components/NodeRenderer";

type SaveState = "idle" | "saving" | "saved" | "error";

interface SavedInfo {
  time: string; // "HH:MM"
  id: string;
}

export default function Home() {
  const [doc, setDoc] = useState<SectionDocument | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedInfo, setSavedInfo] = useState<SavedInfo | null>(null);

  async function handleGenerate(prompt: string) {
    setGenerating(true);
    setGenerateError(null);
    setSaveError(null);
    setDirty(false);
    setSaveState("idle");
    setSavedInfo(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setGenerateError(json.error ?? `Server error ${res.status}`);
        return;
      }
      const json = (await res.json()) as SectionDocument;
      setDoc(json);
    } catch {
      setGenerateError("Network error — could not reach the server.");
    } finally {
      setGenerating(false);
    }
  }

  function handleEditText(id: string, text: string) {
    if (!doc) return;
    const newRoot = updateNodeText(doc.root, id, text);
    if (newRoot === doc.root) return;
    setDoc({ ...doc, root: newRoot });
    setDirty(true);
    // Reset save label so it doesn't show stale "Saved HH:MM" after new edits.
    setSaveState("idle");
  }

  async function handleSave() {
    if (!doc || saveState === "saving") return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setSaveError(json.error ?? `Save failed (server error ${res.status})`);
        setSaveState("error");
        return;
      }
      const json = (await res.json()) as { id: string; savedAt: string };
      // Format time as HH:MM in the user's local timezone.
      const time = new Date(json.savedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSavedInfo({ time, id: json.id });
      setSaveState("saved");
      setDirty(false);
    } catch {
      setSaveError("Network error — changes could not be saved.");
      setSaveState("error");
    }
  }

  function getSaveLabel(): string {
    switch (saveState) {
      case "saving":
        return "Saving…";
      case "saved":
        return savedInfo ? `Saved ${savedInfo.time}` : "Saved";
      case "error":
        return "Save failed";
      default:
        return "Save Changes";
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopBar
        onGenerate={handleGenerate}
        generating={generating}
        onSave={handleSave}
        canSave={dirty && saveState !== "saving"}
        saveLabel={getSaveLabel()}
        saveState={saveState}
        savedId={savedInfo?.id ?? null}
      />

      <main className="flex flex-1 flex-col items-center">

        {/* Generate error banner */}
        {generateError && (
          <div
            role="alert"
            className="mx-auto mt-6 w-full max-w-xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {generateError}
          </div>
        )}

        {/* Save error banner */}
        {saveError && (
          <div
            role="alert"
            className="mx-auto mt-6 w-full max-w-xl rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700"
          >
            ⚠️ {saveError}
          </div>
        )}

        {/* Empty state */}
        {!doc && !generateError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-12 py-16 shadow-sm">
              <p className="text-4xl">✨</p>
              <h1 className="mt-4 text-xl font-semibold text-slate-800">
                Generate your first section
              </h1>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Type a prompt above — try{" "}
                <em className="not-italic font-medium text-slate-700">&ldquo;a pricing section with 3 tiers&rdquo;</em>{" "}
                or{" "}
                <em className="not-italic font-medium text-slate-700">&ldquo;hero banner for a SaaS&rdquo;</em>.
              </p>
            </div>
          </div>
        )}

        {/*
            key={doc.id}: when Generate produces a new document, this div and
            all descendants unmount + remount. That resets the `committed` ref
            inside every EditableText instance to the new node.text values,
            preventing stale Escape-restore targets.
        */}
        {doc && (
          <div key={doc.id} className="w-full">
            <NodeRenderer node={doc.root} onEditText={handleEditText} />
          </div>
        )}

      </main>
    </div>
  );
}
