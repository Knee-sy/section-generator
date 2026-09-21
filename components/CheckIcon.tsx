// components/CheckIcon.tsx
// Inline SVG circle-check icon for listItem nodes.
// Rendered outside the editable span so the SVG markup never ends up inside node.text.

export default function CheckIcon({
  className = "h-4 w-4 shrink-0 text-blue-500",
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Circle */}
      <circle cx={12} cy={12} r={10} />
      {/* Check mark */}
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
