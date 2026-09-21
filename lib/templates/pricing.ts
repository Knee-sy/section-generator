import type { ContainerNode, ListItemNode } from "@/lib/schema";

// ---------------------------------------------------------------------------
// Internal helper types
// ---------------------------------------------------------------------------

interface TierOptions {
    id: string;              // short key used to namespace all node ids, e.g. "starter"
    name: string;            // display name, e.g. "Starter"
    amount: string;          // price amount, e.g. "$10"
    period: string;          // price period, e.g. "/mo"
    features: readonly string[]; // exactly 5 coherent feature strings
    cta: string;             // CTA button label
    featured: boolean;       // true → blue border + tint (Pro card)
}

// ---------------------------------------------------------------------------
// tier() — builds one pricing card as a ContainerNode.
// Emits data, not React. The three tiers call this so nothing is copy-pasted.
//
// Per-tier node order:
//   heading → price container [span amount + span period] → divider
//   → list of 5 listItems → button
// ---------------------------------------------------------------------------

function tier({
    id,
    name,
    amount,
    period,
    features,
    cta,
    featured,
}: TierOptions): ContainerNode {
    // Both branches are complete literal strings — Tailwind can scan them.
    const cardClass = featured
        ? "flex flex-col gap-5 rounded-2xl border-2 border-blue-400 bg-blue-50/40 p-6 shadow-md"
        : "flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

    const listItems: ListItemNode[] = features.map((text, i) => ({
        id: `n_${id}_f${i + 1}`,
        type: "listItem",
        icon: "check",
        text,
        className: "flex items-center gap-2 text-sm text-slate-700",
    }));

    return {
        id: `n_tier_${id}`,
        type: "container",
        tag: "article",
        className: cardClass,
        children: [
            {
                id: `n_${id}_name`,
                type: "heading",
                level: 3,
                text: name,
                className: "text-center text-xl font-bold text-slate-900",
            },
            {
                id: `n_${id}_price`,
                type: "container",
                tag: "div",
                className: "flex items-baseline justify-center",
                children: [
                    {
                        id: `n_${id}_amount`,
                        type: "text",
                        tag: "span",
                        text: amount,
                        className: "text-4xl font-bold tracking-tight text-slate-900",
                    },
                    {
                        id: `n_${id}_period`,
                        type: "text",
                        tag: "span",
                        text: period,
                        className: "text-lg text-slate-500",
                    },
                ],
            },
            {
                id: `n_${id}_rule`,
                type: "divider",
                className: "border-slate-200",
            },
            {
                id: `n_${id}_feats`,
                type: "list",
                className: "flex flex-col gap-3",
                children: listItems,
            },
            {
                id: `n_${id}_cta`,
                type: "button",
                text: cta,
                className:
                    "mt-auto w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100",
            },
        ],
    };
}

// ---------------------------------------------------------------------------
// buildPricing — the exported template function.
// Returns a ContainerNode tree whose root wraps the section heading and the
// three-column card grid.
// ---------------------------------------------------------------------------

export function buildPricing(_prompt: string): ContainerNode {
    return {
        id: "n_pricing_root",
        type: "container",
        tag: "section",
        className: "bg-white px-6 py-24",
        children: [
            {
                id: "n_pricing_header",
                type: "container",
                tag: "div",
                className: "mx-auto mb-12 max-w-2xl text-center",
                children: [
                    {
                        id: "n_pricing_title",
                        type: "heading",
                        level: 2,
                        text: "Simple, transparent pricing",
                        className: "text-4xl font-extrabold tracking-tight text-slate-900",
                    },
                    {
                        id: "n_pricing_subtitle",
                        type: "text",
                        tag: "p",
                        text: "Choose the plan that fits your team. Upgrade or downgrade at any time.",
                        className: "mt-4 text-lg text-slate-500",
                    },
                ],
            },
            {
                id: "n_pricing_grid",
                type: "container",
                tag: "div",
                className:
                    "mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3",
                children: [
                    tier({
                        id: "starter",
                        name: "Starter",
                        amount: "$10",
                        period: "/mo",
                        features: [
                            "Up to 5 projects",
                            "10 GB storage",
                            "Basic analytics dashboard",
                            "Email support",
                            "API access",
                        ],
                        cta: "Choose Plan",
                        featured: false,
                    }),
                    tier({
                        id: "pro",
                        name: "Pro",
                        amount: "$29",
                        period: "/mo",
                        features: [
                            "Unlimited projects",
                            "100 GB storage",
                            "Advanced analytics and reports",
                            "Priority support",
                            "Custom domain",
                        ],
                        cta: "Choose Plan",
                        featured: true,
                    }),
                    tier({
                        id: "enterprise",
                        name: "Enterprise",
                        amount: "$50",
                        period: "/mo",
                        features: [
                            "Unlimited projects",
                            "1 TB storage",
                            "Enterprise analytics and exports",
                            "Dedicated account manager",
                            "99.9% uptime SLA",
                        ],
                        cta: "Contact Us",
                        featured: false,
                    }),
                ],
            },
        ],
    };
}
