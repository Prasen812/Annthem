
'use client';

import Image from 'next/image';
import { ChevronDown, ListMusic, Maximize2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '@/providers/PlayerProvider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { QueueView } from './QueueView';
import { cn } from '@/lib/utils';
import { SongCoverPlaceholder } from './SongCoverPlaceholder';

export function Player() {
  const {
    activeSong,
    isPlaying,
    isFullScreen,
    toggleFullScreen,
    playPause,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    isShuffled,
    toggleShuffle,
    repeatMode,
    isSpotifyEmbed,
  } = usePlayer();

  if (!activeSong) {
    return null;
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const FullScreenPlayer = () => (
    <div className="container mx-auto h-full flex flex-col lg:flex-row items-center justify-center gap-8 p-6 lg:p-12 relative">
      <Button variant="ghost" size="icon" className="absolute top-6 right-6 text-muted-foreground hover:text-foreground" onClick={toggleFullScreen}>
        <ChevronDown className="h-6 w-6" />
      </Button>

      {isSpotifyEmbed && activeSong?.audioUrl ? (
        <iframe
          src={activeSong.audioUrl}
          width="100%"
          height="352"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg shadow-2xl w-full max-w-lg h-96"
        ></iframe>
      ) : (
        <>
        <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center gap-8 pt-12 lg:pt-0">
          <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 shadow-2xl rounded-lg overflow-hidden">
              {activeSong.coverUrl ? (
                <Image src={activeSong.coverUrl} alt={activeSong.album || ''} layout="fill" className="rounded-lg object-cover" data-ai-hint="album art" />
              ) : (
                <SongCoverPlaceholder song={activeSong} />
              )}
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-headline font-bold">{activeSong.title}</h2>
            {activeSong.artists.length > 0 && <p className="text-lg text-muted-foreground mt-1">{activeSong.artists.join(', ')}</p>}
          </div>
          <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 w-full max-w-xl">
            <span className="text-xs font-mono text-muted-foreground">{formatTime(currentTime)}</span>
            <Slider 
                value={[currentTime]}
                max={duration || 1}
                onValueChange={([val]) => seek(val)}
                className="w-full"
            />
            <span className="text-xs font-mono text-muted-foreground">{formatTime(duration || 0)}</span>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("hidden sm:inline-flex", isShuffled && "text-primary")}>
                  <Shuffle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={playPrev}>
                  <SkipBack className="h-6 w-6" />
              </Button>
              <Button variant="default" size="icon" className="h-16 w-16 rounded-full" onClick={playPause}>
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={playNext}>
                  <SkipForward className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                  {repeatMode === 'one' ? <Repeat1 className="h-5 w-5 text-primary" /> : <Repeat className="h-5 w-5" />}
              </Button>
          </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 h-full flex flex-col pt-0 lg:pt-12 overflow-hidden">
          <h3 className="text-xl font-headline mb-4 text-center lg:text-left">Up Next</h3>
          <div className="flex-1 overflow-y-auto">
              <QueueView />
          </div>
        </div>
        </>
      )}
    </div>
  );

  const MiniPlayerBar = () => (
     <div className="container mx-auto px-4 h-full">
         <div className="flex items-center justify-between h-full">
             <div className="flex items-center gap-4 w-1/4 min-w-0">
                 <button onClick={toggleFullScreen} className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden">
                   {activeSong.coverUrl ? (
                     <Image src={activeSong.coverUrl} alt={activeSong.album || ''} width={56} height={56} className="object-cover" data-ai-hint="album art" />
                   ) : (
                     <SongCoverPlaceholder song={activeSong} />
                   )}
                 </button>
                 <div className="truncate">
                     <p className="font-semibold truncate text-foreground">{activeSong.title}</p>
                     {activeSong.artists.length > 0 && <p className="text-sm text-muted-foreground truncate">{activeSong.artists.join(', ')}</p>}
                 </div>
             </div>

             <div className="flex flex-col items-center justify-center gap-2 w-1/2 h-full">
                 {isSpotifyEmbed && activeSong.audioUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <iframe
                      src={activeSong.audioUrl}
                      width="100%"
                      height="100%"
                      allowFullScreen={false}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="border-none"
                    ></iframe>
                  </div>
                 ) : (
                  <>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn(isShuffled && "text-primary")}>
                            <Shuffle className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={playPrev}>
                            <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button variant="default" size="icon" className="h-12 w-12 rounded-full" onClick={playPause}>
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={playNext}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            {repeatMode === 'one' ? <Repeat1 className="h-5 w-5 text-primary" /> : <Repeat className="h-5 w-5" />}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 w-full max-w-xl">
                        <span className="text-xs font-mono text-muted-foreground">{formatTime(currentTime)}</span>
                        <Slider 
                            value={[currentTime]}
                            max={duration || 1}
                            onValueChange={([val]) => seek(val)}
                            className="w-full"
                        />
                        <span className="text-xs font-mono text-muted-foreground">{formatTime(duration || 0)}</span>
                    </div>
                  </>
                 )}
             </div>

             <div className="flex items-center justify-end gap-2 w-1/4">
                 <Sheet>
                     <SheetTrigger asChild>
                         <Button variant="ghost" size="icon">
                             <ListMusic className="h-5 w-5" />
                         </Button>
                     </SheetTrigger>
                     <SheetContent className="w-full max-w-md p-0 flex flex-col">
                         <SheetHeader className="p-6 pb-2">
                             <SheetTitle className="font-headline">Up Next</SheetTitle>
                         </SheetHeader>
                         <QueueView />
                     </SheetContent>
                 </Sheet>
                 <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
                     <Maximize2 className="h-5 w-5" />
                 </Button>
             </div>
         </div>
     </div>
  );

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out",
        isFullScreen 
          ? "top-0 h-[100svh] bg-background"
          : "bottom-0 h-20 bg-card/80 backdrop-blur-lg border-t border-border/60"
      )}
    >
      {isFullScreen ? <FullScreenPlayer /> : <MiniPlayerBar />}
    </div>
  );
}
