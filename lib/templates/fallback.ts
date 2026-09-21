/**
 * Fallback template — shown when no keyword matches.
 * Renders a real section (same pipeline as hero/pricing) that tells
 * the user which keywords are supported.
 */
import type { ContainerNode } from "@/lib/schema";

export function buildFallback(_prompt: string): ContainerNode {
    return {
        id: "n_fallback_root",
        type: "container",
        tag: "section",
        className: "flex min-h-64 items-center justify-center bg-white px-6 py-24",
        children: [
            {
                id: "n_fallback_inner",
                type: "container",
                tag: "div",
                className: "mx-auto max-w-lg text-center",
                children: [
                    {
                        id: "n_fallback_title",
                        type: "heading",
                        level: 2,
                        text: "No matching template found",
                        className: "text-2xl font-bold text-slate-900",
                    },
                    {
                        id: "n_fallback_body",
                        type: "text",
                        tag: "p",
                        text: "Try a prompt that includes one of the supported keywords.",
                        className: "mt-3 text-slate-500",
                    },
                    {
                        id: "n_fallback_keywords",
                        type: "list",
                        className: "mt-6 flex flex-col gap-2 text-left",
                        children: [
                            {
                                id: "n_fallback_kw1",
                                type: "listItem",
                                icon: "dot",
                                text: "pricing, price, tier, plan — generates a pricing section",
                                className: "flex items-center gap-2 text-sm text-slate-700",
                            },
                            {
                                id: "n_fallback_kw2",
                                type: "listItem",
                                icon: "dot",
                                text: "hero, landing, banner, headline — generates a hero section",
                                className: "flex items-center gap-2 text-sm text-slate-700",
                            },
                        ],
                    },
                ],
            },
        ],
    };
}
