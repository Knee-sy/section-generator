// lib/tree.ts — Pure, immutable tree utilities.
//
// Rules:
//  - updateNodeText returns a NEW root; only nodes on the path to the target
//    are cloned — every untouched subtree is reused by reference.
//  - No mutation anywhere. Returning the same reference when no change is
//    found is intentional for React bailout.
//  - findNode does a depth-first search; returns undefined when not found.

import type { UINode, ContainerNode, ListNode, NodeId } from "./schema";

// findNode — depth-first search; returns the first node matching id.
export function findNode(root: UINode, id: NodeId): UINode | undefined {
  if (root.id === id) return root;

  if (root.type === "container") {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  if (root.type === "list") {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

// updateNodeText — returns a new ContainerNode root with node `id` having
// its `text` field set to `text`. Clones only the path to the target.
export function updateNodeText(
  root: ContainerNode,
  id: NodeId,
  text: string
): ContainerNode {
  const updated = _update(root, id, text);
  // Root is always a ContainerNode — casting is safe.
  return updated as ContainerNode;
}

// Internal recursive helper. Returns a new node if a descendant (or the node
// itself) was changed; otherwise returns the original reference unchanged.
function _update(node: UINode, id: NodeId, text: string): UINode {
  // ── Exact match — update this node ──────────────────────────────────────
  if (node.id === id) {
    if (!("text" in node)) {
      // Should never happen (caller passes only editable ids), but be safe.
      console.warn(`[tree] updateNodeText: node "${id}" has no text field.`);
      return node;
    }
    // Skip clone if nothing changed
    if ((node as { text: string }).text === text) return node;
    return { ...node, text } as UINode;
  }

  // ── Container — recurse over children ───────────────────────────────────
  if (node.type === "container") {
    let changed = false;
    const newChildren = node.children.map((child) => {
      const next = _update(child, id, text);
      if (next !== child) changed = true;
      return next;
    });
    if (!changed) return node;
    return { ...node, children: newChildren } as ContainerNode;
  }

  // ── List — recurse over children ─────────────────────────────────────────
  if (node.type === "list") {
    let changed = false;
    const newChildren = (node as ListNode).children.map((child) => {
      const next = _update(child, id, text);
      if (next !== child) changed = true;
      return next as typeof child;
    });
    if (!changed) return node;
    return { ...node, children: newChildren } as ListNode;
  }

  // ── Leaf node, not a match — return as-is ──────────────────────────────
  return node;
}
