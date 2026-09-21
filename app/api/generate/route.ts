import { NextResponse } from "next/server";
import type { SectionDocument, UINode } from "@/lib/schema";
import { resolveTemplate } from "@/lib/templates/index";

const MAX_PROMPT_LENGTH = 500;

// Dev-only guard: walk the node tree and throw if any id appears more than once.
// Called after the template builds the tree, before the response is sent.
function assertUniqueIds(node: UINode, seen: Set<string> = new Set()): void {
    if (seen.has(node.id)) {
        throw new Error(`Duplicate node id detected: "${node.id}"`);
    }
    seen.add(node.id);

    if (node.type === "container") {
        for (const child of node.children) {
            assertUniqueIds(child, seen);
        }
    } else if (node.type === "list") {
        for (const child of node.children) {
            assertUniqueIds(child, seen);
        }
    }
}

// POST /api/generate
// Body: { prompt: string }
// Returns: SectionDocument
export async function POST(req: Request) {
    // 1. Parse body
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    // 2. Validate prompt field exists and is a string
    if (
        typeof body !== "object" ||
        body === null ||
        typeof (body as Record<string, unknown>).prompt !== "string"
    ) {
        return NextResponse.json(
            { error: "Missing field: prompt." },
            { status: 400 }
        );
    }

    const prompt = ((body as Record<string, unknown>).prompt as string).trim();

    // 3. Validate prompt value
    if (prompt.length === 0) {
        return NextResponse.json(
            { error: "Prompt must not be blank." },
            { status: 400 }
        );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
        return NextResponse.json(
            { error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` },
            { status: 400 }
        );
    }

    // 4. Resolve template
    const { template, root } = resolveTemplate(prompt);

    // 5. Assert id uniqueness in dev (catches copy-paste mistakes in templates)
    if (process.env.NODE_ENV === "development") {
        assertUniqueIds(root);
    }

    // 6. Assemble and return the SectionDocument
    const now = new Date().toISOString();
    const doc: SectionDocument = {
        id: crypto.randomUUID(),
        prompt,
        template,
        root,
        createdAt: now,
        updatedAt: now,
    };

    return NextResponse.json(doc);
}
