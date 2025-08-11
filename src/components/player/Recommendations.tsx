'use client';
import type { Song } from '@/types';
import Image from 'next/image';
import { getSongById } from '@/data/songs';
import { usePlayer } from '@/providers/PlayerProvider';
import { Music, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationsProps {
  song: Song;
}

export function Recommendations({ song }: RecommendationsProps) {
  const { activeSong, isPlaying } = usePlayer();
  const recommendedSongs = song.recommendations
    .map((r) => getSongById(r.songId))
    .filter((s): s is Song => !!s);

  if (recommendedSongs.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No recommendations found.</div>;
  }
  
  return (
    <div className="pl-16 pr-4">
        <h4 className="font-headline text-sm font-semibold mb-2 text-muted-foreground">Recommendations for {song.title}</h4>
        <div className="space-y-2">
            {recommendedSongs.map(recSong => {
                 const isCurrentlyPlaying = activeSong?.id === recSong.id && isPlaying;
                 const isThisSongActive = activeSong?.id === recSong.id;
                 return (
                    <div key={recSong.id} className={cn("flex items-center gap-3 p-2 rounded-md", isThisSongActive ? "bg-primary/10" : "")}>
                        {isCurrentlyPlaying ? (
                             <Volume2 className="h-4 w-4 shrink-0 text-primary animate-pulse" />
                        ) : (
                            <Music className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <Image src={recSong.coverUrl} alt={recSong.album} width={32} height={32} className="rounded" data-ai-hint="album art" />
                        <div className="flex-1 truncate">
                            <p className="font-medium text-sm truncate text-foreground/90">{recSong.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{recSong.artists.join(', ')}</p>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {Math.floor(recSong.durationMs / 60000)}:
                            {String(Math.floor((recSong.durationMs % 60000) / 1000)).padStart(2, '0')}
                        </div>
                    </div>
                 )
            })}
        </div>
    </div>
  );
}
