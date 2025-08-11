'use client';

import { Accordion } from '@/components/ui/accordion';
import { usePlayer } from '@/providers/PlayerProvider';
import { SongCard } from './SongCard';

export function SongList() {
  const { songs, expandedSongId, expandAndPlayRecommendations, activeSong } = usePlayer();

  const handleValueChange = (value: string) => {
    const song = songs.find((s) => s.id === value);
    if (song) {
        expandAndPlayRecommendations(song);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-2"
      value={expandedSongId ?? undefined}
      onValueChange={handleValueChange}
    >
      {songs.map((song, index) => (
        <SongCard key={song.id} song={song} index={index} />
      ))}
    </Accordion>
  );
}
