import JSZip from 'jszip';
import { libraryRepo } from '../persistence/LibraryRepository';
import { playlistRepo } from '../persistence/PlaylistRepository';
import type { TrackRecord } from '../persistence/MusicDatabase';
import { db } from '../persistence/MusicDatabase';

export interface SyncVaultData {
  version: string;
  exportedAt: number;
  library: Omit<TrackRecord, 'audioBlob'>[];
  playlists: any[];
}

export class SyncBridgeService {
  /**
   * Bundles the entire library or a specific playlist into a .mssync (ZIP) file
   */
  async exportVault(
    onProgress?: (msg: string, percent: number) => void, 
    playlistId?: string
  ): Promise<Blob> {
    const zip = new JSZip();
    let tracks = await libraryRepo.getAllTracks();
    let playlists = await playlistRepo.getAllPlaylists();

    if (playlistId) {
      const targetPlaylist = playlists.find(p => p.id === playlistId);
      if (targetPlaylist) {
        // Only include tracks present in this playlist
        const trackIds = new Set(targetPlaylist.songIds);
        tracks = tracks.filter(t => trackIds.has(t.id));
        playlists = [targetPlaylist];
      }
    }

    if (onProgress) onProgress('Preparando metadatos...', 5);

    const metadata: SyncVaultData = {
      version: '1.0',
      exportedAt: Date.now(),
      library: tracks.map(({ audioBlob, ...rest }) => rest),
      playlists
    };

    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    const tracksFolder = zip.folder('tracks');
    if (!tracksFolder) throw new Error('No se pudo crear la carpeta de tracks');

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const progress = 10 + Math.floor((i / tracks.length) * 80);
      if (onProgress) onProgress(`Empaquetando: ${track.title}`, progress);
      
      tracksFolder.file(`${track.id}.audio`, track.audioBlob);
    }

    if (onProgress) onProgress('Comprimiendo bóveda...', 95);
    
    return await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  /**
   * Imports a .mssync file and handles duplicate detection
   */
  async importVault(
    file: File, 
    onConflict: (track: Omit<TrackRecord, 'audioBlob'>) => Promise<'skip' | 'replace'>,
    onProgress?: (msg: string, percent: number) => void
  ): Promise<{ imported: number; skipped: number; replaced: number }> {
    const zip = await JSZip.loadAsync(file);
    const metadataFile = zip.file('metadata.json');
    if (!metadataFile) throw new Error('Archivo .mssync inválido (faltan metadatos)');

    const metadataText = await metadataFile.async('string');
    const data: SyncVaultData = JSON.parse(metadataText);

    let imported = 0;
    let skipped = 0;
    let replaced = 0;

    const tracksFolder = zip.folder('tracks');
    if (!tracksFolder) throw new Error('No se pudo encontrar la carpeta de tracks en la bóveda');

    for (let i = 0; i < data.library.length; i++) {
        const trackMeta = data.library[i];
        const progress = Math.floor((i / data.library.length) * 100);
        if (onProgress) onProgress(`Procesando: ${trackMeta.title}`, progress);

        // Check for existing track by ID or title+duration
        const existing = await db.tracks.get(trackMeta.id) || 
                         (await db.tracks.where('title').equals(trackMeta.title).first());

        let action: 'skip' | 'replace' | 'new' = 'new';
        
        if (existing) {
            action = await onConflict(trackMeta);
        }

        if (action === 'skip') {
            skipped++;
            continue;
        }

        const audioFile = tracksFolder.file(`${trackMeta.id}.audio`);
        if (!audioFile) {
            console.warn(`Audio faltante para: ${trackMeta.title}`);
            continue;
        }

        const audioBlob = await audioFile.async('blob');
        
        const record: TrackRecord = {
            ...(trackMeta as any),
            audioBlob
        };

        await db.tracks.put(record);
        
        if (action === 'replace') replaced++;
        else imported++;
    }

    // Import playlists (simple merge by ID)
    for (const pl of data.playlists) {
        await db.playlists.put(pl);
    }

    return { imported, skipped, replaced };
  }

  /**
   * Simple helper to trigger browser download
   */
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const syncBridgeService = new SyncBridgeService();
