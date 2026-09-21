import { NextResponse } from "next/server";
import type { SectionDocument } from "@/lib/schema";
import * as store from "@/lib/store";

// ---------------------------------------------------------------------------
// POST /api/sections
// Body: SectionDocument (must include a root field)
// Returns: { id: string; savedAt: string }
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
    // 1. Parse body
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    // 2. Minimal validation — body must be an object with a root field.
    //    Full schema validation is out of scope for this prototype.
    if (
        typeof body !== "object" ||
        body === null ||
        typeof (body as Record<string, unknown>).root !== "object" ||
        (body as Record<string, unknown>).root === null
    ) {
        return NextResponse.json(
            { error: "Body must be a SectionDocument with a root field." },
            { status: 400 }
        );
    }

    const doc = body as SectionDocument;

    // 3. Save to store (stamps updatedAt)
    const saved = store.save(doc);

    // 4. Return a compact acknowledgement
    return NextResponse.json(
        { id: saved.id, savedAt: saved.updatedAt },
        { status: 201 }
    );
}
