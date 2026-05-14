/**
 * Layered animated background:
 * - Moroccan zellige-inspired SVG tile pattern (very subtle)
 * - Two slow floating gradient orbs (emerald + gold)
 * - Soft grid overlay
 * Pure decorative, pointer-events: none, fixed behind content.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Zellige SVG pattern */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.055] text-primary"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="zellige"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(15)"
          >
            <path
              d="M40 4 L52 28 L76 32 L58 50 L62 74 L40 62 L18 74 L22 50 L4 32 L28 28 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="40" cy="40" r="3" fill="currentColor" />
          </pattern>
          <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path
              d="M44 0 H0 V44"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#zellige)" />
      </svg>

      {/* Floating gradient orbs */}
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.55_0.13_150/0.35),transparent_70%)] animate-float-slow blur-3xl" />
      <div className="absolute -bottom-52 -right-32 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.78_0.15_85/0.30),transparent_70%)] animate-float-slower blur-3xl" />
      <div className="absolute top-1/3 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.70_0.12_90/0.18),transparent_70%)] animate-pulse-glow blur-3xl" />

      {/* Top sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    </div>
  );
}
