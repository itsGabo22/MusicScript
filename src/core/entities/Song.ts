export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  source: 'local' | 'api';
  isFavorite?: boolean;
}
