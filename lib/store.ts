// lib/store.ts — SERVER ONLY (uses Node.js fs / path)
//
// Storage layout:
//   <cwd>/.data/sections.json  —  Record<id, SectionDocument>
//
// Hot-reload safety:
//   Next.js dev-server can re-evaluate module files on change, resetting
//   module-level variables. The in-memory map is cached on `globalThis` so
//   it survives hot-reloads without a file re-read on every request.
//
// Windows paths:
//   All paths use path.join() — never string concatenation with '/'.
//
// Concurrent writes:
//   Not serialised — acceptable for a prototype; noted in README.

import path from "path";
import fs from "fs";
import type { SectionDocument } from "./schema";

// ── Constants ────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "sections.json");

// ── In-memory cache type ─────────────────────────────────────────────────────

type StoreMap = Record<string, SectionDocument>;

// Extend globalThis so TypeScript knows about the cache key.
declare global {
  // eslint-disable-next-line no-var
  var __sectionStore: StoreMap | undefined;
}

// ── Internal: load or initialise the in-memory map ──────────────────────────

function getMap(): StoreMap {
  // Return the cached map if it already exists on globalThis.
  if (global.__sectionStore) return global.__sectionStore;

  // Ensure the storage directory exists (mkdir -p).
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Read and parse the JSON file. Tolerate three failure modes:
  //   (a) file does not exist  → ENOENT caught → start from {}
  //   (b) file is empty        → JSON.parse throws → start from {}
  //   (c) file is corrupt JSON → JSON.parse throws → start from {}
  let map: StoreMap = {};
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      map = parsed as StoreMap;
    }
  } catch {
    // Any of the three failure modes — start from an empty map.
    map = {};
  }

  global.__sectionStore = map;
  return map;
}

// ── Internal: flush the in-memory map to disk ────────────────────────────────

function flush(map: StoreMap): void {
  // Re-ensure the directory exists in case it was deleted at runtime.
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(map, null, 2), "utf-8");
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Saves (or overwrites) a document.
 * Stamps `updatedAt` with the current UTC time before writing.
 * Returns the stamped document.
 */
export function save(doc: SectionDocument): SectionDocument {
  const map = getMap();
  const stamped: SectionDocument = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };
  map[stamped.id] = stamped;
  flush(map);
  return stamped;
}

/**
 * Returns the document with the given id, or undefined if not found.
 */
export function get(id: string): SectionDocument | undefined {
  return getMap()[id];
}

/**
 * Returns all saved documents as an array (order is insertion order).
 */
export function list(): SectionDocument[] {
  return Object.values(getMap());
}
