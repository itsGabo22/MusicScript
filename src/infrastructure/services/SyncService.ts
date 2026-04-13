import { Peer } from 'peerjs';
// Using any for the connection type to avoid export errors with PeerJS types in Vite
type DataConnection = any;
import { libraryRepo } from '../persistence/LibraryRepository';
import { playlistRepo } from '../persistence/PlaylistRepository';
import type { TrackRecord } from '../persistence/MusicDatabase';

export type SyncMode = 'library' | 'playlist';

// A lightweight wrapper around PeerJS to handle specific logic
export class SyncService {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;

  public onReceiveTrack?: (track: TrackRecord, current: number, total: number) => void;
  public onConnectionStateChange?: (state: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  public onTransferComplete?: () => void;
  public onConnectionError?: (err: Error) => void;

  public initializeAsHost(customId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = customId ? new Peer(customId) : new Peer();

      this.peer.on('open', (id) => {
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this.setupConnectionListeners(conn);
      });

      this.peer.on('error', (err) => {
        if (this.onConnectionError) this.onConnectionError(err);
        reject(err);
      });
    });
  }

  public connectAsClient(hostId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer();
      
      this.peer.on('open', () => {
        if (this.onConnectionStateChange) this.onConnectionStateChange('connecting');
        const conn = this.peer!.connect(hostId, { reliable: true });
        
        conn.on('open', () => {
          this.connection = conn;
          if (this.onConnectionStateChange) this.onConnectionStateChange('connected');
          this.setupConnectionListeners(conn);
          resolve();
        });

        conn.on('error', (err) => {
          if (this.onConnectionError) this.onConnectionError(err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        if (this.onConnectionError) this.onConnectionError(err);
        reject(err);
      });
    });
  }

  private setupConnectionListeners(conn: DataConnection) {
    if (this.onConnectionStateChange) this.onConnectionStateChange('connected');

    conn.on('data', async (data: any) => {
      if (data.type === 'TRACK') {
        const { track, current, total } = data.payload;
        // The track.audioBlob will be reconstructed by PeerJS if sent as arraybuffer/blob
        await libraryRepo.saveTrack(track, track.audioBlob);
        
        if (this.onReceiveTrack) {
          this.onReceiveTrack(track, current, total);
        }

        if (current === total) {
          if (this.onTransferComplete) this.onTransferComplete();
        }
      }
    });

    conn.on('close', () => {
      if (this.onConnectionStateChange) this.onConnectionStateChange('disconnected');
    });
  }

  public async transferData(mode: SyncMode, id?: string, onProgress?: (current: number, total: number) => void) {
    if (!this.connection) throw new Error("No hay cliente conectado u Host inicializado");

    let tracksToSync: TrackRecord[] = [];

    if (mode === 'library') {
      tracksToSync = await libraryRepo.getAllTracks();
    } else if (mode === 'playlist' && id) {
      const allPlaylists = await playlistRepo.getAllPlaylists();
      const target = allPlaylists.find((p: any) => p.id === id);
      if (target) {
        const allTracks = await libraryRepo.getAllTracks();
        tracksToSync = allTracks.filter((t: any) => target.songIds.includes(t.id));
      }
    }

    if (tracksToSync.length === 0) return;

    // Send tracks one by one asynchronously to avoid choking the connection
    for (let i = 0; i < tracksToSync.length; i++) {
        const track = tracksToSync[i];
        
        // PeerJS natively handles Blob types in the payload!
        this.connection.send({
            type: 'TRACK',
            payload: {
                track,
                current: i + 1,
                total: tracksToSync.length
            }
        });

        if (onProgress) {
            onProgress(i + 1, tracksToSync.length);
        }
        
        // Small delay to prevent overwhelming the WebRTC buffer
        await new Promise(res => setTimeout(res, 300));
    }
  }

  public disconnect() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.onConnectionStateChange) this.onConnectionStateChange('disconnected');
  }
}

export const syncService = new SyncService();
