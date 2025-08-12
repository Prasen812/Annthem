'use client';

/**
 * AnimatedHeaderDivider Component
 *
 * This component creates a responsive, animated horizontal divider line.
 * It features a tapered thickness, a left-to-right gradient color animation,
 * and glowing wave effects both above and below the line.
 *
 * To customize:
 * - Colors: Modify the linear-gradient in the main divider style.
 * - Timing: Adjust the `animation-duration` for `animate-gradient-wipe` (color change speed)
 *   and `animate-wave` / `animate-wave-shadow` (wave motion speed) in `globals.css`.
 * - Thickness: Change the `mask-image` gradient values. The current pattern is `0 -> 3px -> 0`.
 */
export function AnimatedHeaderDivider() {
  const sharedGradient = 'linear-gradient(to right, var(--color-red), var(--color-blue), var(--color-yellow), var(--color-green), var(--color-red))';

  return (
    <div className="relative h-2 w-full" aria-hidden="true">
      {/* Glowing wave shadow (above) */}
      <div
        className="absolute inset-x-0 top-[-3px] h-[5px] w-full"
        style={{
          filter: 'blur(3px)',
          transform: 'translateY(-1px)',
        }}
      >
        <div
          className="h-full w-full"
          style={{
            background: sharedGradient,
            backgroundSize: '400% 100%',
            opacity: 0.4,
            maskImage: 'url(/wave.svg)',
            maskSize: '60px 5px',
            WebkitMaskImage: 'url(/wave.svg)',
            WebkitMaskSize: '60px 5px',
            animation: 'animate-gradient-wipe 8s linear infinite, animate-wave-shadow 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Tapered line with gradient wipe animation */}
      <div
        className="absolute inset-0 h-[3px] w-full"
        style={{
          background: sharedGradient,
          backgroundSize: '400% 100%',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
          animation: 'animate-gradient-wipe 8s linear infinite',
        }}
      />
      {/* Glowing wave (below) */}
      <div
        className="absolute inset-x-0 top-[1px] h-[5px] w-full"
        style={{
          filter: 'blur(4px)',
        }}
      >
        <div
          className="h-full w-full"
          style={{
            background: sharedGradient,
            backgroundSize: '400% 100%',
            opacity: 0.3,
            maskImage: 'url(/wave.svg)',
            maskSize: '60px 5px',
            WebkitMaskImage: 'url(/wave.svg)',
            WebkitMaskSize: '60px 5px',
            animation: 'animate-gradient-wipe 8s linear infinite, animate-wave 4s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
