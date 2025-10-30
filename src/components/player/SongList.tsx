'use client';

import { useState } from 'react';
import type { Song } from '@/types';
import { SongCard } from './SongCard';
import { Recommendations } from './Recommendations';
import { AnimatePresence, motion } from 'framer-motion';

interface SongListProps {
  songs: Song[];
}

export function SongList({ songs }: SongListProps) {
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);

  if (songs.length === 0) {
    return <div className="mt-4 text-neutral-400">No songs available.</div>;
  }

  const handleToggleExpand = (songId: string) => {
    setExpandedSongId(currentId => (currentId === songId ? null : songId));
  };

  return (
    <div className="flex flex-col gap-y-1 w-full">
      {songs.map((song) => (
        <div key={song.id}>
          <SongCard song={song} onExpandToggle={() => handleToggleExpand(song.id)} isExpanded={expandedSongId === song.id} />
          <AnimatePresence>
            {expandedSongId === song.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <Recommendations song={song} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
