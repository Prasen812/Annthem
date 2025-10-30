'use client';

import { useState, useEffect } from 'react';
import type { Song } from '@/types';
import Image from 'next/image';
import { usePlayer } from '@/providers/PlayerProvider';
import { Music, Volume2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SongCoverPlaceholder } from './SongCoverPlaceholder';

interface RecommendationsProps {
  song: Song;
}

export function Recommendations({ song }: RecommendationsProps) {
  const { activeSong, isPlaying, playSong, songs: allSongs } = usePlayer();
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!song.id) return;

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ track_id: song.id, top_k: 3 }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        
        // The backend returns recommendations, but we need to find the full song objects
        // from our main `allSongs` list.
        const recommendedSongs = data.recommendations
          .map((rec: { id: string }) => allSongs.find(s => s.id === rec.id))
          .filter((s?: Song): s is Song => !!s);
          
        setRecommendations(recommendedSongs);
      } catch (err: any) {
        setError(err.message || 'Could not load recommendations.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [song.id, allSongs]);

  if (isLoading) {
    return (
      <div className="pl-12 pr-4 pt-2 pb-4">
        <h4 className="font-headline text-sm font-semibold mb-3 text-muted-foreground">mannr recommendations for u</h4>
        <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 pl-12 text-sm text-destructive">{error}</div>;
  }

  if (recommendations.length === 0) {
    return <div className="p-4 pl-12 text-sm text-center text-muted-foreground">No recommendations available.</div>;
  }

  return (
    <div className="pl-12 pr-4 pt-2 pb-4">
      <h4 className="font-headline text-sm font-semibold mb-2 text-muted-foreground">mannr recommendations for you</h4>
      <div className="space-y-1">
        {recommendations.map(recSong => {
          const isThisSongActive = activeSong?.id === recSong.id;
          const isCurrentlyPlaying = isThisSongActive && isPlaying;
          return (
            <div
              key={recSong.id}
              onClick={() => playSong(recSong)}
              className={cn("group flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-neutral-800/50", isThisSongActive ? "bg-neutral-800/80" : "")}
            >
              <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden">
                {recSong.coverUrl ? (
                    <Image src={recSong.coverUrl} alt={recSong.album || ''} width={32} height={32} className="rounded" data-ai-hint="album art" />
                ) : (
                    <SongCoverPlaceholder song={recSong} />
                )}
                 <div className="absolute inset-0 bg-black/50 group-hover:opacity-100 opacity-0 transition-opacity flex items-center justify-center">
                    {isCurrentlyPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white fill-white" />}
                </div>
              </div>

              <div className="flex-1 truncate">
                <p className={cn("font-medium text-sm truncate", isThisSongActive ? "text-primary" : "text-foreground/90")}>{recSong.title}</p>
                {recSong.artists.length > 0 && <p className="text-xs text-muted-foreground truncate">{recSong.artists.join(', ')}</p>}
              </div>

              <div className="text-xs text-muted-foreground font-mono">
                {Math.floor(recSong.durationMs / 60000)}:
                {String(Math.floor((recSong.durationMs % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
