
import { Library, Plus } from 'lucide-react';
import { SongList } from '@/components/player/SongList';
import { CascadePlayer } from '@/components/player/CascadePlayer';
import Image from 'next/image';
import { getSongs } from '@/data/songs';
import type { Song } from '@/types';
import { SongCoverPlaceholder } from '@/components/player/SongCoverPlaceholder';

type Artist = {
  name: string;
  image: string;
};

export default function Home() {
  const songs: Song[] = getSongs();
  const trendingSongs = songs.slice(0, 12);

  // Create a dynamic list of popular artists from the songs data
  const artistCountMap = new Map<string, number>();
  songs.forEach(song => {
    song.artists.forEach(artistName => {
      artistCountMap.set(artistName, (artistCountMap.get(artistName) || 0) + 1);
    });
  });

  const popularArtists: Artist[] = Array.from(artistCountMap.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 12)
    .map(([name], index) => ({
      name,
      // Use a deterministic placeholder image for each artist
      image: `https://picsum.photos/seed/${name.replace(/\s/g, '')}${index}/150/150`,
    }));


  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-2 h-[calc(100vh-240px)]">
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col gap-2 bg-black h-full">
          <div className="bg-neutral-900 rounded-lg flex flex-col gap-y-4 h-full">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                  <Library className="text-neutral-400" />
                  <p className="text-neutral-400 font-medium text-md">Your Library</p>
                </div>
                <button className="text-neutral-400 hover:text-white transition">
                  <Plus />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-y-2 px-3 flex-1 overflow-y-auto">
              <SongList songs={songs} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Trending Songs</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {trendingSongs.map((song) => (
                 <div key={song.id} className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                   <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
                      {song.coverUrl ? (
                        <Image className="object-cover" src={song.coverUrl} fill alt={song.album} data-ai-hint="album cover" />
                      ) : (
                        <SongCoverPlaceholder song={song} />
                      )}
                   </div>
                   <div className="flex flex-col items-start w-full gap-y-1">
                     <p className="font-semibold truncate w-full text-base">{song.title}</p>
                     <p className="text-neutral-400 text-sm pb-2 w-full truncate">By {song.artists.join(', ')}</p>
                   </div>
                 </div>
              ))}
             </div>

            <h2 className="text-2xl font-bold my-4">Popular Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {popularArtists.map((artist) => (
                <div key={artist.name} className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                  <div className="relative aspect-square w-full h-full rounded-full overflow-hidden mb-2">
                    <Image className="object-cover" src={artist.image} fill alt="Artist" data-ai-hint="artist portrait" />
                  </div>
                  <div className="flex flex-col items-start w-full pt-2 gap-y-1">
                    <p className="font-semibold truncate w-full text-center text-base">{artist.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CascadePlayer songs={songs} />
    </div>
  );
}
