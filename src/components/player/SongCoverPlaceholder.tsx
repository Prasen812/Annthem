
'use client';

import type { Song } from "@/types";
import { useMemo } from "react";

/**
 * Creates a deterministic, seeded pseudo-random number generator.
 */
function createSeededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

/**
 * Generates two deterministic HSL colors based on a seed string.
 * @param seed - A string to seed the color generation (e.g., song title + artist).
 * @returns An object with two HSL color strings { color1, color2 }.
 */
function generateGradient(seed: string): { color1: string; color2: string } {
  const random = createSeededRandom(seed);
  const h1 = random() % 360;
  const s1 = 50 + (random() % 40); // Saturation between 50% and 90%
  const l1 = 30 + (random() % 20); // Lightness between 30% and 50%

  const h2 = (h1 + 90 + (random() % 60)) % 360; // Get a complementary-ish hue
  const s2 = 50 + (random() % 40);
  const l2 = 30 + (random() % 20);

  return {
    color1: `hsl(${h1}, ${s1}%, ${l1}%)`,
    color2: `hsl(${h2}, ${s2}%, ${l2}%)`,
  };
}

interface SongCoverPlaceholderProps {
    song: Song;
}

export function SongCoverPlaceholder({ song }: SongCoverPlaceholderProps) {
  const { gradient, firstLetter } = useMemo(() => {
    const placeholderSeed = song.title + song.artists.join(',');
    const { color1, color2 } = generateGradient(placeholderSeed);
    const letter = song.title ? song.title.charAt(0).toUpperCase() : '?';
    return {
        gradient: `linear-gradient(135deg, ${color1}, ${color2})`,
        firstLetter: letter,
    }
  }, [song]);
  
  return (
    <div
      className="w-full h-full flex items-center justify-center font-headline font-bold text-white/90"
      style={{ background: gradient }}
    >
        <span className="text-3xl md:text-5xl lg:text-7xl opacity-80">{firstLetter}</span>
    </div>
  );
}
