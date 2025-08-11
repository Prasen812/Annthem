'use client';

import Image from 'next/image';
import { usePlayer } from '@/providers/PlayerProvider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Music, Volume2 } from 'lucide-react';

export function QueueView() {
  const { queue, currentIndex, isPlaying } = usePlayer();

  if (queue.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Queue is empty.</div>;
  }

  return (
    <ScrollArea className="flex-1 px-6">
      <div className="space-y-2">
        {queue.map((item, index) => {
          const isActive = index === currentIndex;
          const isCurrentlyPlaying = isActive && isPlaying;
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-4 p-2 rounded-md transition-colors',
                isActive && 'bg-primary/10'
              )}
            >
              {isCurrentlyPlaying ? (
                <Volume2 className="h-4 w-4 shrink-0 text-primary animate-pulse" />
              ) : (
                <Music className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <Image
                src={item.song.coverUrl}
                alt={item.song.album}
                width={40}
                height={40}
                className="rounded"
                data-ai-hint="album art"
              />
              <div className="flex-1 truncate">
                <p className={cn("font-medium text-sm truncate", isActive ? "text-primary" : "text-foreground/90")}>{item.song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.song.artists.join(', ')}</p>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {Math.floor(item.song.durationMs / 60000)}:
                {String(Math.floor((item.song.durationMs % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
