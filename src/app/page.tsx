import { HomeIcon, Search, Library, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongList } from '@/components/player/SongList';
import { CascadePlayer } from '@/components/player/CascadePlayer';
import Image from 'next/image';

const popularArtists = [
  { name: 'Galaxy Runners', image: 'https://placehold.co/150x150/1A237E/FFFFFF.png' },
  { name: 'Tidal Waves', image: 'https://placehold.co/150x150/3F51B5/FFFFFF.png' },
  { name: 'Neon Drive', image: 'https://placehold.co/150x150/9C27B0/FFFFFF.png' },
  { name: 'Whispering Pines', image: 'https://placehold.co/150x150/4CAF50/FFFFFF.png' },
  { name: 'Road Trip Heroes', image: 'https://placehold.co/150x150/FF9800/FFFFFF.png' },
  { name: 'Chrono Rider', image: 'https://placehold.co/150x150/F44336/FFFFFF.png' },
];

export default function Home() {
  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-2 h-[calc(100%-80px)]">
        {/* Left Sidebar */}
        <div className="hidden md:flex flex-col gap-2 bg-black h-full">
          <div className="bg-neutral-900 rounded-lg p-4 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <Library className="text-neutral-400" />
                <p className="text-neutral-400 font-medium text-md">Your Library</p>
              </div>
              <button className="text-neutral-400 hover:text-white transition">
                <Plus />
              </button>
            </div>
            <div className="flex flex-col gap-y-2 mt-4 px-3 h-[calc(100vh-270px)] overflow-y-auto">
              <SongList />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Trending Songs</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               { /* This part would be dynamic in a real app */ }
               <div className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                 <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
                   <Image className="object-cover" src="https://placehold.co/150x150/1A237E/FFFFFF.png" fill alt="Album Cover" data-ai-hint="album cover" />
                 </div>
                 <div className="flex flex-col items-start w-full gap-y-1">
                   <p className="font-semibold truncate w-full text-base">Cosmic Drift</p>
                   <p className="text-neutral-400 text-sm pb-2 w-full truncate">By Galaxy Runners</p>
                 </div>
               </div>
                <div className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                 <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
                   <Image className="object-cover" src="https://placehold.co/150x150/3F51B5/FFFFFF.png" fill alt="Album Cover" data-ai-hint="album cover" />
                 </div>
                 <div className="flex flex-col items-start w-full gap-y-1">
                   <p className="font-semibold truncate w-full text-base">Ocean Breath</p>
                   <p className="text-neutral-400 text-sm pb-2 w-full truncate">By Tidal Waves</p>
                 </div>
               </div>
                <div className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                 <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
                   <Image className="object-cover" src="https://placehold.co/150x150/9C27B0/FFFFFF.png" fill alt="Album Cover" data-ai-hint="album cover" />
                 </div>
                 <div className="flex flex-col items-start w-full gap-y-1">
                   <p className="font-semibold truncate w-full text-base">City Lights at 3 AM</p>
                   <p className="text-neutral-400 text-sm pb-2 w-full truncate">By Neon Drive</p>
                 </div>
               </div>
                <div className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                 <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
                   <Image className="object-cover" src="https://placehold.co/150x150/4CAF50/FFFFFF.png" fill alt="Album Cover" data-ai-hint="album cover" />
                 </div>
                 <div className="flex flex-col items-start w-full gap-y-1">
                   <p className="font-semibold truncate w-full text-base">Forest Lullaby</p>
                   <p className="text-neutral-400 text-sm pb-2 w-full truncate">By Whispering Pines</p>
                 </div>
               </div>
               <div className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-800/50 cursor-pointer hover:bg-neutral-800 transition p-4">
                 <div className="relative aspect-square w-full h-full rounded-md overflow-hidden mb-4">
                   <Image className="object-cover" src="https://placehold.co/150x150/FF9800/FFFFFF.png" fill alt="Album Cover" data-ai-hint="album cover" />
                 </div>
                 <div className="flex flex-col items-start w-full gap-y-1">
                   <p className="font-semibold truncate w-full text-base">The Getaway</p>
                   <p className="text-neutral-400 text-sm pb-2 w-full truncate">By Road Trip Heroes</p>
                 </div>
               </div>
             </div>

            <h2 className="text-2xl font-bold my-4">Popular Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      <CascadePlayer />
    </div>
  );
}
