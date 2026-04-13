import axios from 'axios';
import { StringUtils } from '../../core/utils/StringUtils';


export interface LyricsResponse {
  plain: string | null;
  synced: string | null;
}

export const LyricsService = {
  async fetchLyrics(title: string, artist: string, duration?: number): Promise<LyricsResponse> {
    const cleanTitle = StringUtils.cleanTrackTitle(title, artist);
    const cleanArtist = StringUtils.cleanTrackTitle(artist); // Clean artist too just in case

    try {
      // 1. Try LRCLIB (Synced Lyrics)
      // Duration helps LRCLIB find the exact match (within 2s)
      const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}${duration ? `&duration=${Math.floor(duration)}` : ''}`;
      const lrcResponse = await axios.get(lrclibUrl);
      
      if (lrcResponse.data) {
        return {
          plain: lrcResponse.data.plainLyrics || null,
          synced: lrcResponse.data.syncedLyrics || null
        };
      }
    } catch (e) {
      console.warn('LRCLIB failed, trying fallbacks...', e);
    }

    try {
      // 2. Fallback to Lyrics.ovh (Plain text only)
      const ovhResponse = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`);
      if (ovhResponse.data.lyrics) {
        return {
          plain: ovhResponse.data.lyrics,
          synced: null
        };
      }
    } catch (e) {
      console.warn('Lyrics.ovh failed too.', e);
    }

    return { plain: null, synced: null };
  },
  
  async translateLyrics(lines: string[]): Promise<string[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || lines.length === 0) return lines.map(() => "");

    // Prepare a structured prompt to get a line-by-line translation
    const prompt = `Traduce las siguientes líneas de una canción al ESPAÑOL. 
Mantén exactamente el mismo número de líneas y el orden. 
IMPORTANTE: Devuelve únicamente las líneas traducidas, sin preámbulos, sin notas y sin números.
Si una línea es instrumental o ruidos, déjala en blanco.

Líneas a traducir:
${lines.join('\n')}`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      const text = response.data.candidates[0].content.parts[0].text;
      const translatedLines = text.split('\n').map((l: string) => l.trim());
      
      // Ensure we match the original length
      return lines.map((_, i) => translatedLines[i] || "");
    } catch (error) {
      console.error('Translation failed:', error);
      return lines.map(() => "");
    }
  }
};
