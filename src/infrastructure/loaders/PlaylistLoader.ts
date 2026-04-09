import type { Song } from "../../core/entities/Song";
import defaultPlaylist from "./defaultPlaylist.json";

export class PlaylistLoader {
  static async loadDefault(): Promise<Song[]> {
    // In a real app, this would be a fetch call
    return defaultPlaylist as Song[];
  }

  static async fromFiles(files: FileList): Promise<Song[]> {
    const songs: Song[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        songs.push({
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          artist: "Unknown Artist",
          duration: 0, // Duration will be metadata or caught by audio tag
          audioUrl: URL.createObjectURL(file),
          source: 'local',
          coverUrl: "https://picsum.photos/seed/local/400/400" // Placeholder
        });
      }
    }
    
    return songs;
  }
}
