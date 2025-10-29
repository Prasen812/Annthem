
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
                i++;
            }
            if (record) {
                const values = record.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                rows.push(values.map(v => v.trim().replace(/^"|"$/g, '')));
            }
            record = '';
            continue;
        }
        record += char;
    }
    if (record) {
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
    
    if (records.length < 2) return [];
    const header = records[0].map(h => h.trim());
    const lines = records.slice(1);
    
    const requiredColumns = ['id', 'title', 'artists'];
    const colIndices: { [key: string]: number } = {};
    header.forEach((h, i) => {
        colIndices[h] = i;
    });

    if (requiredColumns.some(col => colIndices[col] === undefined)) {
        console.error("CSV is missing one of the required columns:", requiredColumns);
        return [];
    }

    return lines.map((line, index) => {
      if (line.length < header.length) return null;

      const id = line[colIndices['id']];
      const title = line[colIndices['title']];
      const artists = line[colIndices['artists']]?.split(';').map(a => a.trim()) || ['Unknown Artist'];

      if (!id || !title) {
        console.warn(`Skipping row ${index + 2} due to missing id or title`);
        return null;
      }
      
      const songData: Song = {
        id: id,
        title: title,
        artists: artists,
        album: line[colIndices['album']] || 'Unknown Album',
        durationMs: parseInt(line[colIndices['durationMs']], 10) || 180000,
        coverUrl: line[colIndices['coverUrl']] || `https://placehold.co/128x128?text=${encodeURIComponent(title)}`,
        audioUrl: line[colIndices['audioUrl']] || '',
        tags: line[colIndices['tags']]?.split(';').map(t => t.trim()) || [],
        explicit: line[colIndices['explicit']]?.toLowerCase() === 'true',
        releaseDate: line[colIndices['releaseDate']] || '',
        provider: line[colIndices['provider']] || 'Unknown',
        recommendations: line[colIndices['recommendations']]?.split(';').filter(r => r).map(r => {
          const [songId, score, reasonShort] = r.split(':');
          return {
            songId,
            score: parseFloat(score) || 0,
            reasonShort: reasonShort || 'Similar vibe'
          };
        }) || [],
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
