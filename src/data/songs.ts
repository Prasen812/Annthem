import type { Song } from '@/types';
import fs from 'fs';
import path from 'path';

let songs: Song[] | null = null;

function parseSongs(): Song[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'songs.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n').slice(1); // Skip header row

    return lines.map((line) => {
      // This simple parser assumes no commas within fields.
      // For more complex CSVs, a dedicated library would be better.
      const [
        id,
        title,
        artists,
        album,
        durationMs,
        coverUrl,
        audioUrl,
        tags,
        explicit,
        releaseDate,
        provider,
        recommendationsRaw,
      ] = line.split(',');

      // Skip empty lines
      if (!id) {
        return null;
      }

      return {
        id,
        title: title?.trim() || 'Unknown Title',
        artists: artists?.split(';').map(a => a.trim()) || ['Unknown Artist'],
        album: album?.trim() || 'Unknown Album',
        durationMs: parseInt(durationMs, 10) || 0,
        coverUrl: coverUrl?.trim() || 'https://placehold.co/128x128/1A237E/FFFFFF.png',
        audioUrl: audioUrl?.trim() || '',
        tags: tags?.split(';').map(t => t.trim()) || [],
        explicit: explicit?.toLowerCase() === 'true',
        releaseDate: releaseDate?.trim() || '',
        provider: provider?.trim() || 'Unknown',
        recommendations: recommendationsRaw?.split(';').filter(r => r).map(r => {
          const [songId, score, reasonShort] = r.split(':');
          return {
            songId,
            score: parseFloat(score) || 0,
            reasonShort: reasonShort || 'Similar vibe'
          };
        }) || [],
      };
    }).filter((song): song is Song => song !== null);

  } catch (error) {
    console.error("Could not read or parse songs.csv:", error);
    // Fallback to an empty array if the file doesn't exist or is invalid
    return [];
  }
}

// This function runs on the server and is safe to use fs
export function getSongs(): Song[] {
  if (songs === null) {
    songs = parseSongs();
  }
  return songs;
}

// This function can be called from client or server, but relies on getSongs having been called first
// and the songs data being cached.
export function getSongById(id: string): Song | undefined {
  if (songs === null) {
    // This is a workaround for client-side access. In a real app,
    // you'd likely have an API endpoint or have all songs in a client-side store.
    console.warn('getSongById called before songs were initialized on the server.');
    return undefined;
  }
  return songs.find((song) => song.id === id);
}
