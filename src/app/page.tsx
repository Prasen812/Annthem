
import { Library, Plus } from 'lucide-react';
import { SongList } from '@/components/player/SongList';
import { CascadePlayer } from '@/components/player/CascadePlayer';
import Image from 'next/image';
import { getSongs } from '@/data/songs';
import type { Song } from '@/types';
import { SongCoverPlaceholder } from '@/components/player/SongCoverPlaceholder';
import { AppFooter } from '@/components/AppFooter';
import SearchAddSong from '@/components/SearchAddSong';
import TrendingSongCard from '@/components/player/TrendingSongCard';

type Artist = {
  name: string;
  image: string;
};

export default function Home() {
  const songs: Song[] = getSongs();
  const trendingSongs = songs.slice(0, 12);

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
      image: `https://picsum.photos/seed/${name.replace(/\s/g, '')}${index}/150/150`,
    }));


  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-2">
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col gap-2 bg-black h-full sticky top-20">
          <div className="bg-neutral-900 rounded-lg flex flex-col gap-y-4 h-[calc(100vh-160px)]">
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
                <div className="mt-3">
                  <SearchAddSong />
                </div>
            </div>
            <div className="flex flex-col gap-y-2 px-3 flex-1 overflow-y-auto">
              <SongList songs={songs} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-1 md:col-span-1 overflow-y-auto">
           <div className="bg-neutral-900 rounded-lg h-full w-full">
              <div className="min-h-screen p-6">
                <h2 className="text-2xl font-bold mb-4">Trending Songs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {trendingSongs.map((song) => (
                    <div key={song.id}>
                      {/* client-side clickable card that uses PlayerProvider to play */}
                      <TrendingSongCard song={song} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-h-screen p-6">
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
      </div>
      <AppFooter />
      <CascadePlayer songs={songs} />
    </div>
  );
}
