// lib/schema.ts — The single authoritative contract for the UI node tree.
// Every other file — templates, renderer, editor, store — imports from here.

// ─── Node id ─────────────────────────────────────────────────────────────────
/** An opaque string that uniquely identifies one node within a SectionDocument.
 *  Generated once on the server; never recomputed on the client. */
export type NodeId = string;

// ─── Base ─────────────────────────────────────────────────────────────────────
interface BaseNode {
  /** Stable, server-generated, unique within the document. */
  id: NodeId;
  /** Complete literal Tailwind class string.
   *  Must never be built by concatenation — Tailwind scans source text. */
  className?: string;
}

// ─── Structural nodes ─────────────────────────────────────────────────────────
export interface ContainerNode extends BaseNode {
  type: 'container';
  /** Defaults to 'div' when omitted. */
  tag?: 'section' | 'div' | 'header' | 'article';
  children: UINode[];
}
export interface ListNode extends BaseNode {
  type: 'list';
  children: ListItemNode[];
}

// ─── Leaf nodes with text (inline-editable) ───────────────────────────────────
export interface HeadingNode extends BaseNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}
export interface TextNode extends BaseNode {
  type: 'text';
  /** Defaults to 'p' when omitted. */
  tag?: 'p' | 'span';
  text: string;
}
export interface ButtonNode extends BaseNode {
  type: 'button';
  text: string;
}
export interface ListItemNode extends BaseNode {
  type: 'listItem';
  text: string;
  icon?: 'check' | 'dot';
}

// ─── Decorative leaf (no text) ────────────────────────────────────────────────
/** Renders as <hr>. Has no text field, so isEditable correctly excludes it. */
export interface DividerNode extends BaseNode {
  type: 'divider';
}

// ─── Union ────────────────────────────────────────────────────────────────────
export type UINode =
  | ContainerNode
  | HeadingNode
  | TextNode
  | ButtonNode
  | ListNode
  | ListItemNode
  | DividerNode;

// ─── Editability ──────────────────────────────────────────────────────────────
/** Any node that carries a plain-string `text` field is inline-editable.
 *  DividerNode, ContainerNode and ListNode are intentionally excluded. */
export type EditableNode = HeadingNode | TextNode | ButtonNode | ListItemNode;

/** Type guard — true iff the node has a `text` field and may be edited inline. */
export const isEditable = (n: UINode): n is EditableNode => 'text' in n;

// ─── Document ─────────────────────────────────────────────────────────────────
/** The top-level object exchanged between client and server.
 *  The root ContainerNode owns the entire rendered UI tree. */
export interface SectionDocument {
  /** Stable id minted by the generate route via crypto.randomUUID(). */
  id: string;
  /** The raw prompt string the user submitted. */
  prompt: string;
  /** Which template was matched by the keyword router. */
  template: 'hero' | 'pricing' | 'fallback';
  /** The root of the UI node tree. */
  root: ContainerNode;
  /** ISO 8601 timestamp — set when the document is first created. */
  createdAt: string;
  /** ISO 8601 timestamp — updated on every save. */
  updatedAt: string;
}
