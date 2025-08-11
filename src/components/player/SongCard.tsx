'use client';

import Image from 'next/image';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Song } from '@/types';
import { Recommendations } from './Recommendations';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/providers/PlayerProvider';
import { Music, Pause, Play, Volume2 } from 'lucide-react';

interface SongCardProps {
  song: Song;
  index: number;
}

export function SongCard({ song, index }: SongCardProps) {
  const { activeSong, isPlaying } = usePlayer();
  const isCurrentlyPlaying = activeSong?.id === song.id && isPlaying;
  const isThisSongActive = activeSong?.id === song.id;

  return (
    <AccordionItem
      value={song.id}
      className={cn(
        'border-none rounded-lg transition-all bg-card/50 hover:bg-card/90',
        isThisSongActive ? 'bg-card' : ''
      )}
    >
      <AccordionTrigger className="p-3 rounded-lg text-left hover:no-underline [&[data-state=open]>svg]:hidden">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 text-center text-muted-foreground font-mono text-sm">
            {isCurrentlyPlaying ? (
                <Volume2 className="h-5 w-5 mx-auto animate-pulse text-primary" />
             ) : (
                <span>{String(index + 1).padStart(2, '0')}</span>
            )}
          </div>
          <div className="relative h-12 w-12 rounded-md overflow-hidden shrink-0">
             <Image src={song.coverUrl} alt={song.album} layout="fill" objectFit="cover" data-ai-hint="album art" />
          </div>
          <div className="flex-1 truncate">
            <p className="font-semibold truncate text-foreground">{song.title}</p>
            <p className="text-sm text-muted-foreground truncate">{song.artists.join(', ')}</p>
          </div>
          <div className="hidden md:block w-1/4 truncate text-sm text-muted-foreground">
            {song.album}
          </div>
          <div className="w-20 text-right text-sm text-muted-foreground font-mono pr-4">
            {Math.floor(song.durationMs / 60000)}:
            {String(Math.floor((song.durationMs % 60000) / 1000)).padStart(2, '0')}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <Recommendations song={song} />
      </AccordionContent>
    </AccordionItem>
  );
}
