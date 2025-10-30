
import type { Song } from '@/types';
import fs from 'fs';
import path from 'path';

let songs: Song[] | null = null;

function parseSongs(): Song[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'spotify_songs.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    const records = lines.slice(1);
    
    const colIndices: { [key: string]: number } = {};
    header.forEach((h, i) => {
        colIndices[h] = i;
    });

    const requiredColumns = ['track_id', 'track_name'];
    if (requiredColumns.some(col => colIndices[col] === undefined)) {
        console.error("CSV is missing one of the required columns:", requiredColumns);
        return [];
    }
    
    return records.map((line, index) => {
      const data = line.split(',');
      if (data.length < header.length) return null;

      const id = data[colIndices['track_id']];
      const title = data[colIndices['track_name']];
      
      if (!id || !title) {
        console.warn(`Skipping row ${index + 2} due to missing track_id or track_name`);
        return null;
      }
      
      const songData: Song = {
        id,
        title,
        artists: [], // Artist name is not available for now
        album: 'Unknown Album',
        durationMs: 180000,
        coverUrl: '', // Will trigger placeholder
        audioUrl: `https://open.spotify.com/embed/track/${id}`,
        tags: [],
        explicit: false,
        releaseDate: '',
        provider: 'CSV',
        recommendations: [],
      };
      
      return songData;
    }).filter((song): song is Song => song !== null);

  } catch (error) {
    console.error("Could not read or parse songs.csv:", error);
    return [];
  }
}

export function getSongs(): Song[] {
  if (songs === null) {
    songs = parseSongs();
  }
  return songs;
}
