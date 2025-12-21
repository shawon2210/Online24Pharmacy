/**
 * SkipLink - Accessibility component for keyboard navigation
 * Allows keyboard users to skip directly to main content
 */
export default function SkipLink({ targetId = "main-content", children = "Skip to main content" }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-emerald-600 focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg"
    >
      {children}
    </a>
  );
}
