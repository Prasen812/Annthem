'use client';

/**
 * AnimatedHeaderDivider Component
 *
 * This component creates a responsive, animated horizontal divider line.
 * It features a tapered thickness, color cycling animation, and a glowing wave effect.
 *
 * To customize:
 * - Colors: Modify the --color-* variables and the `animate-color-cycle` keyframes in `globals.css`.
 * - Timing: Adjust the `animation-duration` in `animate-color-cycle` and `animate-wave` keyframes.
 * - Thickness: Change the `mask-image` gradient values. The current pattern is `0 -> 3px -> 0`.
 *   The gradient stops create the tapered effect: transparent at edges, opaque (3px thick) at the center.
 */
export function AnimatedHeaderDivider() {
    return (
      <div className="relative h-2 w-full" aria-hidden="true">
        {/* Tapered line with color cycling animation */}
        <div
          className="absolute inset-0 h-[3px] w-full"
          style={{
            backgroundColor: 'var(--divider-color)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
            animation: 'animate-color-cycle 16s linear infinite',
          }}
        />
        {/* Glowing wave effect */}
        <div
          className="absolute inset-0 w-full overflow-hidden"
          style={{
            filter: 'blur(4px)',
          }}
        >
          <div
            className="h-[5px] w-full"
            style={{
              backgroundColor: 'var(--divider-glow-color)',
              opacity: 0.3,
              maskImage: 'url(/wave.svg)',
              maskSize: '60px 5px',
              WebkitMaskImage: 'url(/wave.svg)',
              WebkitMaskSize: '60px 5px',
              animation: 'animate-color-cycle 16s linear infinite, animate-wave 4s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    );
  }
