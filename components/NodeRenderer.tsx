// components/NodeRenderer.tsx
// The recursive rendering engine.
//
// Rules:
//  - switch(node.type) → emit the matching HTML tag + className
//  - Container/list nodes recurse over children via <NodeRenderer>
//  - listItem emits <li> with CheckIcon outside the editable span
//  - divider emits <hr>
//  - default: returns null and warns — unknown types must degrade, not crash
//  - NO layout name (hero / pricing / tier / …) is used in this file
//
// Any isEditable(node) is wrapped in <EditableText> when onEditText is
// supplied. listItem uses EditableText with tag="span" around the text only;
// the CheckIcon stays outside.

import type { UINode } from "@/lib/schema";
import { isEditable } from "@/lib/schema";
import CheckIcon from "./CheckIcon";
import EditableText from "./EditableText";

interface NodeRendererProps {
  node: UINode;
  /** Called when the user commits an inline edit. */
  onEditText?: (id: string, text: string) => void;
}

export default function NodeRenderer({ node, onEditText }: NodeRendererProps) {
  switch (node.type) {
    // ── Container ──────────────────────────────────────────────────────────
    case "container": {
      const Tag = node.tag ?? "div";
      return (
        <Tag className={node.className}>
          {node.children.map((child) => (
            <NodeRenderer key={child.id} node={child} onEditText={onEditText} />
          ))}
        </Tag>
      );
    }

    // ── Heading ────────────────────────────────────────────────────────────
    case "heading": {
      const tag = `h${node.level}`;
      if (onEditText) {
        return (
          <EditableText
            node={node}
            tag={tag}
            className={node.className}
            onCommit={onEditText}
          />
        );
      }
      const Tag = tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <Tag id={node.id} className={node.className}>
          {node.text}
        </Tag>
      );
    }

    // ── Text (p | span) ────────────────────────────────────────────────────
    case "text": {
      const tag = node.tag ?? "p";
      if (onEditText) {
        return (
          <EditableText
            node={node}
            tag={tag}
            className={node.className}
            onCommit={onEditText}
          />
        );
      }
      const Tag = tag;
      return (
        <Tag id={node.id} className={node.className}>
          {node.text}
        </Tag>
      );
    }

    // ── Button ─────────────────────────────────────────────────────────────
    case "button": {
      if (onEditText) {
        return (
          <EditableText
            node={node}
            tag="button"
            className={node.className}
            onCommit={onEditText}
          />
        );
      }
      return (
        <button id={node.id} type="button" className={node.className}>
          {node.text}
        </button>
      );
    }

    // ── List ───────────────────────────────────────────────────────────────
    case "list": {
      return (
        <ul className={node.className}>
          {node.children.map((child) => (
            <NodeRenderer key={child.id} node={child} onEditText={onEditText} />
          ))}
        </ul>
      );
    }

    // ── ListItem — icon outside the editable span ───────────────────────────
    case "listItem": {
      return (
        <li id={node.id} className={node.className}>
          {node.icon === "check" && <CheckIcon />}
          {node.icon === "dot" && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
              aria-hidden="true"
            />
          )}
          {onEditText ? (
            <EditableText node={node} tag="span" onCommit={onEditText} />
          ) : (
            <span>{node.text}</span>
          )}
        </li>
      );
    }

    // ── Divider ────────────────────────────────────────────────────────────
    case "divider": {
      return <hr id={node.id} className={node.className} />;
    }

    // ── Unknown — degrade gracefully, never crash ──────────────────────────
    default: {
      if (process.env.NODE_ENV === "development") {
        const unknown = node as { type: string };
        console.warn(
          `[NodeRenderer] Unknown node type: "${unknown.type}". Returning null.`
        );
      }
      return null;
    }
  }
}
