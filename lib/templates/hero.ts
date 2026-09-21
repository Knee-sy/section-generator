/**
 * Builds the hero section UI node tree.
 * The prompt parameter is accepted to satisfy the uniform template function
 * signature — this is a mock backend so the layout is predefined.
 */
import type { ContainerNode } from "@/lib/schema";

export function buildHero(_prompt: string): ContainerNode {
    return {
        id: "n_hero_root",
        type: "container",
        tag: "section",
        className: "flex min-h-screen items-center justify-center bg-white px-6 py-24",
        children: [
            {
                id: "n_hero_inner",
                type: "container",
                tag: "div",
                className: "flex max-w-3xl flex-col items-center gap-8 text-center",
                children: [
                    {
                        id: "n_hero_title",
                        type: "heading",
                        level: 1,
                        text: "Build beautiful landing pages — fast",
                        className: "text-5xl font-extrabold leading-tight tracking-tight text-slate-900",
                    },
                    {
                        id: "n_hero_subtitle",
                        type: "text",
                        tag: "p",
                        text: "Describe what you need and the AI generates a fully editable section in seconds. No code required.",
                        className: "max-w-xl text-xl leading-relaxed text-slate-500",
                    },
                    {
                        id: "n_hero_actions",
                        type: "container",
                        tag: "div",
                        className: "flex flex-wrap items-center justify-center gap-4",
                        children: [
                            {
                                id: "n_hero_cta_primary",
                                type: "button",
                                text: "Get started free",
                                className: "rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700",
                            },
                            {
                                id: "n_hero_cta_secondary",
                                type: "button",
                                text: "See how it works",
                                className: "rounded-lg border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50",
                            },
                        ],
                    },
                ],
            },
        ],
    };
}
