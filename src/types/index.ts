export interface Song {
  id: string;
  title: string;
  artists: string[];
  album: string;
  durationMs: number;
  coverUrl: string;
  audioUrl: string;
  tags: string[];
  explicit: boolean;
  releaseDate: string;
  provider: string;
  recommendations: Recommendation[];
}

export interface Recommendation {
  songId: string;
  score: number;
  reasonShort: string;
}

export interface QueueItem {
  id: string; // unique id for the queue item itself
  song: Song;
  source: 'user' | 'recommendation' | 'mainList';
  addedAt: number;
  originTrackId?: string;
}
