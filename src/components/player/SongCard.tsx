
'use client';

import Image from 'next/image';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/providers/PlayerProvider';
import { ChevronDown, Pause, Play } from 'lucide-react';
import { SongCoverPlaceholder } from './SongCoverPlaceholder';
import { Button } from '@/components/ui/button';


interface SongCardProps {
  song: Song;
  onExpandToggle: () => void;
  isExpanded: boolean;
}

export function SongCard({ song, onExpandToggle, isExpanded }: SongCardProps) {
  const { activeSong, isPlaying, playSong, playPause, expandAndPlayRecommendations } = usePlayer();
  const isThisSongActive = activeSong?.id === song.id;

  const handlePlay = (e: React.MouseEvent) => {
    // We only trigger expand/play logic if the user didn't click the expand button
    if (!(e.target instanceof SVGElement || e.target instanceof HTMLButtonElement)) {
         if (isThisSongActive) {
            playPause();
        } else {
            expandAndPlayRecommendations(song);
        }
    }
  };


  return (
    <div
      onClick={handlePlay}
      className={cn(
        'group flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md transition',
        isThisSongActive && 'bg-neutral-800/80'
      )}
    >
      <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
        {song.coverUrl ? (
            <Image fill src={song.coverUrl} alt={song.title} className="object-cover" data-ai-hint="album art" />
        ) : (
            <SongCoverPlaceholder song={song} />
        )}
         <div className="absolute inset-0 bg-black/50 group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center">
            {isThisSongActive && isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white fill-white" />}
        </div>
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className={cn('truncate', isThisSongActive ? 'text-primary' : 'text-white')}>
          {song.title}
        </p>
        {song.artists && song.artists.length > 0 && (
          <p className="text-neutral-400 text-sm truncate">{song.artists.join(', ')}</p>
        )}
      </div>

       <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto text-neutral-400 hover:text-white hover:bg-neutral-700"
            onClick={(e) => {
                e.stopPropagation(); // Prevent the main play click handler
                onExpandToggle();
            }}
        >
            <ChevronDown className={cn("h-5 w-5 transition-transform", isExpanded && "rotate-180")} />
       </Button>
    </div>
  );
}
