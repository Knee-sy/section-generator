"use client";
// components/EditableText.tsx
// contentEditable wrapper for inline text editing.
//
// Behaviour:
//   1. Renders node.text as the initial DOM content; treated as UNCONTROLLED
//      (never calls setState per keystroke — avoids caret-jump issues).
//   2. Commits on blur and on Enter (Enter → preventDefault → blur).
//   3. Escape → restores original text, blurs, does NOT commit.
//   4. onPaste → preventDefault, inserts clipboardData.getText('text/plain')
//      so rich HTML from other pages never enters the JSON tree.
//   5. Skips the commit entirely when text is unchanged.
//   6. Shows hover outline + focus ring so editable elements are discoverable.
//   7. Empty commit is allowed; element gets a dashed amber ring via
//      data-empty="true" so users can see and click back into an empty node.
//
// The `tag` prop lets NodeRenderer pass the correct semantic element
// ("h1"–"h6", "p", "span", "button") without this file knowing about layouts.

import { useRef } from "react";
import React from "react";
import type { EditableNode } from "@/lib/schema";

export interface EditableTextProps {
  node: EditableNode;
  /** HTML tag to render — e.g. "h3", "p", "span", "button". */
  tag: string;
  /** Forwarded className (the node's Tailwind classes). */
  className?: string;
  /** Called once on commit with the node id and the new plain-text value. */
  onCommit: (id: string, text: string) => void;
}

export default function EditableText({
  node,
  tag,
  className,
  onCommit,
}: EditableTextProps) {
  const elRef = useRef<HTMLElement>(null);

  // Tracks the last successfully committed (or initial) text.
  // Used by the Escape handler to restore, and by blur to detect changes.
  // Stored in a ref so it is never stale inside event handlers yet never
  // causes a re-render when updated.
  const committed = useRef<string>(node.text);

  // ── Blur — commit if text changed ────────────────────────────────────────
  function handleBlur() {
    const el = elRef.current;
    if (!el) return;
    const current = el.textContent ?? "";
    if (current === committed.current) {
      el.dataset.empty = current === "" ? "true" : "false";
      return;
    }
    committed.current = current;
    // Show dashed amber ring when the element is left empty.
    el.dataset.empty = current === "" ? "true" : "false";
    onCommit(node.id, current);
  }

  // ── Keyboard — Enter commits, Escape restores ─────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      elRef.current?.blur(); // triggers handleBlur → commit
      return;
    }
    if (e.key === "Escape") {
      const el = elRef.current;
      if (!el) return;
      // Restore DOM to original text; subsequent blur will skip commit
      // because el.textContent === committed.current.
      el.textContent = committed.current;
      el.dataset.empty = committed.current === "" ? "true" : "false";
      el.blur();
    }
  }

  // ── Paste — strip markup, insert plain text only ──────────────────────────
  function handlePaste(e: React.ClipboardEvent<HTMLElement>) {
    e.preventDefault();
    const plain = e.clipboardData.getData("text/plain");
    if (!plain) return;
    // Use the Selection API to insert at the current caret position.
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    selection.deleteFromDocument();
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(plain);
    range.insertNode(textNode);
    // Move caret to after the inserted text.
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Merge the node's own className with the editing affordance classes.
  // The affordance classes are additive — they never override content colours.
  // data-[empty=true]: dashed amber ring when the element has been emptied.
  const mergedClass = [
    className ?? "",
    "cursor-text outline-none",
    "rounded-sm",
    "hover:ring-2 hover:ring-blue-200 hover:ring-offset-1",
    "focus:ring-2 focus:ring-blue-400 focus:ring-offset-1",
    "data-[empty=true]:ring-2 data-[empty=true]:ring-amber-400 data-[empty=true]:ring-offset-1 data-[empty=true]:ring-dashed",
  ]
    .filter(Boolean)
    .join(" ");

  // React.createElement is used here because the `tag` prop is a runtime
  // string — JSX would require an unsafe `as any` cast on a variable tag.
  return React.createElement(
    tag,
    {
      ref: elRef,
      id: node.id,
      className: mergedClass,
      contentEditable: true,
      suppressContentEditableWarning: true,
      // Initialise the placeholder attribute from the node's initial text.
      "data-empty": node.text === "" ? "true" : "false",
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
    },
    node.text
  );
}
