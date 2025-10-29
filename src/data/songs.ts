
import type { Song } from '@/types';
import fs from 'fs';
import path from 'path';

let songs: Song[] | null = null;

// This is a more robust CSV parser that handles quoted fields.
function robustCsvParse(csvData: string): string[][] {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotedField = false;

  for (let i = 0; i < csvData.length; i++) {
    const char = csvData[i];

    if (inQuotedField) {
      if (char === '"') {
        if (i + 1 < csvData.length && csvData[i + 1] === '"') {
          // Handle escaped quote
          currentField += '"';
          i++;
        } else {
          inQuotedField = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotedField = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || char === '\r') {
        if (i > 0 && csvData[i - 1] !== '\n' && csvData[i - 1] !== '\r') {
           currentRow.push(currentField);
           rows.push(currentRow);
           currentRow = [];
           currentField = '';
        }
        if (char === '\r' && csvData[i+1] === '\n') {
           i++; // Handle CRLF line endings
        }
      } else {
        currentField += char;
      }
    }
  }

  // Add the last field and row if the file doesn't end with a newline
  if (currentField) {
    currentRow.push(currentField);
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}


function parseSongs(): Song[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'songs.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = robustCsvParse(csvData);
    
    if (records.length < 2) return [];

    const header = records[0].map(h => h.trim());
    const lines = records.slice(1);
    
    const colIndices: { [key: string]: number } = {};
    header.forEach((h, i) => {
        colIndices[h] = i;
    });

    const requiredColumns = ['track_name', 'artist(s)_name'];
    if (requiredColumns.some(col => colIndices[col] === undefined)) {
        console.error("CSV is missing one of the required columns:", requiredColumns);
        return [];
    }

    return lines.map((line, index) => {
      if (line.length < header.length) return null;

      const title = line[colIndices['track_name']];
      const artists = line[colIndices['artist(s)_name']]?.split(',').map(a => a.trim()).filter(a => a) || ['Unknown Artist'];
      
      if (!title || artists.length === 0) {
        console.warn(`Skipping row ${index + 2} due to missing track_name or artist(s)_name`);
        return null;
      }
      
      const songData: Song = {
        id: `${title}-${index}`, // Create a unique ID
        title,
        artists,
        album: 'Unknown Album',
        durationMs: 180000, // Placeholder duration
        coverUrl: `https://placehold.co/128x128?text=${encodeURIComponent(title)}`, // Placeholder image
        audioUrl: '', // Placeholder audio
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
