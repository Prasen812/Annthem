
import type { Song } from '@/types';
import fs from 'fs';
import path from 'path';

let songs: Song[] | null = null;

function robustCsvParse(csvData: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotedField = false;

  csvData = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < csvData.length; i++) {
    const char = csvData[i];

    if (inQuotedField) {
      if (char === '"') {
        if (i + 1 < csvData.length && csvData[i + 1] === '"') {
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
        if (currentField.trim() !== '') {
            currentField += char;
        }
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.trim() || currentRow.length > 0) {
     currentRow.push(currentField.trim());
     rows.push(currentRow);
  }

  return rows.filter(row => row.length > 1 || (row.length === 1 && row[0] !== ''));
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

    const requiredColumns = ['track_id', 'track_name'];
    if (requiredColumns.some(col => colIndices[col] === undefined)) {
        console.error("CSV is missing one of the required columns:", requiredColumns);
        return [];
    }
    
    return lines.map((line, index) => {
      if (line.length < header.length) return null;

      const id = line[colIndices['track_id']];
      const title = line[colIndices['track_name']];
      
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
