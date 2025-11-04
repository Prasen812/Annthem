"use client";
import React from 'react';
import Image from 'next/image';
import type { Song } from '@/types';
import { usePlayer } from '@/providers/PlayerProvider';
import { Play, Pause } from 'lucide-react';
import { SongCoverPlaceholder } from './SongCoverPlaceholder';

export default function TrendingSongCard({ song }: { song: Song }) {
  const { activeSong, isPlaying, playPause, expandAndPlayRecommendations } = usePlayer();
  const isThisSongActive = activeSong?.id === song.id;

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isThisSongActive) {
      playPause();
    } else {
      // use the expand/play flow so recommendations are queued afterwards
      expandAndPlayRecommendations(song);
    }
  };

  return (
    <div onClick={handleClick} className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
      <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
        {song.coverUrl ? (
          <Image className="object-cover" src={song.coverUrl} fill alt={song.album || 'Album Art'} data-ai-hint="album cover" />
        ) : (
          <SongCoverPlaceholder song={song} />
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
            {isThisSongActive && isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start w-full gap-y-1">
        <p className="font-semibold truncate w-full text-base">{song.title}</p>
        {song.artists && song.artists.length > 0 && (
          <p className="text-neutral-400 text-sm pb-2 w-full truncate">By {song.artists.join(', ')}</p>
        )}
      </div>
    </div>
  );
}
