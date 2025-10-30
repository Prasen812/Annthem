
import type { Song } from '@/types';
import fs from 'fs';
import path from 'path';

let songs: Song[] | null = null;

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function parseSongs(): Song[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'spotify_songs.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) return [];

    const header = parseCsvLine(lines[0]);
    const records = lines.slice(1);
    
    const colIndices: { [key: string]: number } = {};
    header.forEach((h, i) => {
        colIndices[h.replace(/"/g, '')] = i;
    });
    
    const requiredColumns = ['track_id', 'track_name'];
    if (requiredColumns.some(col => colIndices[col] === undefined)) {
        console.error("CSV is missing one of the required columns:", requiredColumns);
        return [];
    }

    return records.map((line, index) => {
      const data = parseCsvLine(line);
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
        provider: 'Spotify', // This is the fix
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
