import type { ContainerNode } from "@/lib/schema";
import { buildHero } from "./hero";
import { buildPricing } from "./pricing";
import { buildFallback } from "./fallback";

export type TemplateName = "hero" | "pricing" | "fallback";

/**
 * Maps a raw prompt to a template name.
 * Order matters — pricing keywords are tested before hero keywords.
 * Comparison is always lowercase + trimmed.
 */
export function matchTemplate(prompt: string): TemplateName {
    const p = prompt.toLowerCase().trim();
    if (/pricing|price|tier|plan/.test(p)) return "pricing";
    if (/hero|landing|banner|headline/.test(p)) return "hero";
    return "fallback";
}

/**
 * Resolves a prompt to a template name and the built ContainerNode tree.
 * This is the single entry point the generate route will call.
 */
export function resolveTemplate(prompt: string): {
    template: TemplateName;
    root: ContainerNode;
} {
    const template = matchTemplate(prompt);

    const builders: Record<TemplateName, (p: string) => ContainerNode> = {
        pricing: buildPricing,
        hero: buildHero,
        fallback: buildFallback,
    };

    return { template, root: builders[template](prompt) };
}
