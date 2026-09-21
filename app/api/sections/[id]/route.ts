import { NextResponse } from "next/server";
import * as store from "@/lib/store";

// ---------------------------------------------------------------------------
// GET /api/sections/[id]
// Returns: SectionDocument or 404
// ---------------------------------------------------------------------------
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const doc = store.get(id);

    if (!doc) {
        return NextResponse.json({ error: `Section "${id}" not found.` }, { status: 404 });
    }

    return NextResponse.json(doc);
}
