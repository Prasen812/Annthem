
import type { Song } from '@/types';
import fs from 'fs';
import path from 'path';

let songs: Song[] | null = null;

function robustCsvParse(csvData: string): string[][] {
    const rows = [];
    let insideQuote = false;
    let record = '';
    for (let i = 0; i < csvData.length; i++) {
        const char = csvData[i];
        if (char === '"') {
            insideQuote = !insideQuote;
        }
        if ((char === '\n' || char === '\r') && !insideQuote) {
            if (csvData[i + 1] === '\n' || csvData[i + 1] === '\r') {
                // handle CRLF
                i++;
            }
            if (record) {
                // Simplified split logic assuming quotes are balanced
                const values = record.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                rows.push(values.map(v => v.trim().replace(/^"|"$/g, '')));
            }
            record = '';
            continue;
        }
        record += char;
    }
    if (record) { // push the last record
        const values = record.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        rows.push(values.map(v => v.trim().replace(/^"|"$/g, '')));
    }
    return rows;
}


function parseSongs(): Song[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'songs.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = robustCsvParse(csvData);
    
    // Assuming first row is header
    if (records.length < 2) return [];
    const header = records[0].map(h => h.trim());
    const lines = records.slice(1);
    
    const requiredColumns = ['id', 'title', 'artists', 'coverUrl', 'audioUrl'];
    const colIndices = Object.fromEntries(requiredColumns.map(col => [col, header.indexOf(col)]));

    if (requiredColumns.some(col => colIndices[col] === -1)) {
        console.error("CSV is missing one of the required columns:", requiredColumns);
        return [];
    }


    return lines.map((line) => {
      if (line.length < header.length) return null;

      const artists = line[colIndices['artists']]?.split(';').map(a => a.trim()) || ['Unknown Artist'];
      const title = line[colIndices['title']] || 'Unknown Title';
      
      const songData = {
        id: line[colIndices['id']],
        title: title,
        artists: artists,
        album: line[header.indexOf('album')] || 'Unknown Album',
        durationMs: parseInt(line[header.indexOf('durationMs')], 10) || 0,
        coverUrl: line[colIndices['coverUrl']] || 'https://placehold.co/128x128/1A237E/FFFFFF.png',
        audioUrl: line[colIndices['audioUrl']] || '',
        tags: line[header.indexOf('tags')]?.split(';').map(t => t.trim()) || [],
        explicit: line[header.indexOf('explicit')]?.toLowerCase() === 'true',
        releaseDate: line[header.indexOf('releaseDate')] || '',
        provider: line[header.indexOf('provider')] || 'Unknown',
        recommendations: line[header.indexOf('recommendations')]?.split(';').filter(r => r).map(r => {
          const [songId, score, reasonShort] = r.split(':');
          return {
            songId,
            score: parseFloat(score) || 0,
            reasonShort: reasonShort || 'Similar vibe'
          };
        }) || [],
      };
      
      if (!songData.id) return null;

      return songData;
    }).filter((song): song is Song => song !== null);

  } catch (error) {
    console.error("Could not read or parse songs.csv:", error);
    // Fallback to an empty array if the file doesn't exist or is invalid
    return [];
  }
}

// This function runs on the server and is safe to use fs
export function getSongs(): Song[] {
  // We cache the songs in memory for performance during development.
  // In a real database, this would be a direct query.
  if (songs === null) {
    songs = parseSongs();
  }
  return songs;
}
