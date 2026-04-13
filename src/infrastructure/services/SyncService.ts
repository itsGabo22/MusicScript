import { Peer } from 'peerjs';
// Using any for the connection type to avoid export errors with PeerJS types in Vite
type DataConnection = any;
import { libraryRepo } from '../persistence/LibraryRepository';
import { playlistRepo } from '../persistence/PlaylistRepository';
import type { TrackRecord } from '../persistence/MusicDatabase';

export type SyncMode = 'library' | 'playlist';

// WebRTC configuration to bypass restrictive NATs using Google's public STUN servers
const WEBRTC_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' }
    ],
    iceTransportPolicy: 'all' as RTCIceTransportPolicy
  }
};

const ID_SUFFIX = '-MS-V4';

// A lightweight wrapper around PeerJS to handle specific logic
export class SyncService {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;

  public onReceiveTrack?: (track: TrackRecord, current: number, total: number) => void;
  public onConnectionStateChange?: (state: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  public onTransferComplete?: () => void;
  public onConnectionError?: (err: Error) => void;
  public onDebugLog?: (msg: string) => void;

  public initializeAsHost(customId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const namespacedId = customId ? `${customId}${ID_SUFFIX}` : undefined;
      this.log(`Initializing Host... (Namespace: ${ID_SUFFIX})`);
      this.peer = namespacedId ? new Peer(namespacedId, WEBRTC_CONFIG) : new Peer(WEBRTC_CONFIG);

      this.peer.on('open', (id) => {
        this.log(`Signaling: PC is LIVE. ID global registrado: ${id}`);
        resolve(id.replace(ID_SUFFIX, ''));
      });

      this.peer.on('connection', (conn) => {
        this.log(`Signaling: Incoming connection request detected from ${conn.peer}`);
        this.connection = conn;
        // Don't set to connected until Handshake is received
        // Listen to when the host side of the channel is open
        conn.on('open', () => {
           this.log(`WebRTC: Data channel with client is now formally OPEN on Host side.`);
        });
        
        conn.on('error', (err: any) => {
          this.log(`DataChannel Error (Host): ${err.message || err.type || 'Unknown'}`);
        });

        this.setupConnectionListeners(conn, true);
      });

      this.peer.on('error', (err) => {
        this.log(`Critical Peer Error: ${err.type} - ${err.message}`);
        if (this.onConnectionError) this.onConnectionError(err);
        reject(err);
      });
    });
  }

  public connectAsClient(hostId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const targetId = `${hostId}${ID_SUFFIX}`;
      this.log(`Client: Connecting to PIN ${hostId} (Target: ${targetId})...`);
      this.peer = new Peer(WEBRTC_CONFIG);
      
      this.peer.on('open', (_id) => {
        this.log(`Client LIVE. Requesting tunnel to ${targetId}...`);
        if (this.onConnectionStateChange) this.onConnectionStateChange('connecting');
        
        // Using JSON serialization for better compatibility with mobile browsers
        const conn = this.peer!.connect(targetId, { 
          reliable: true,
          serialization: 'json'
        });

        let connectionTimeout = setTimeout(() => {
          if (!this.connection || !this.connection.open) {
            this.log(`⚠️ TIMEOUT: La conexión está tardando demasiado. Esto suele ser un bloqueo de red/firewall en el router.`);
          }
        }, 15000);
        
        conn.on('open', () => {
          clearTimeout(connectionTimeout);
          this.log(`WebRTC: Connection established with Host. Tunnel open.`);
          this.connection = conn;
          this.setupConnectionListeners(conn, false, resolve);
          
          // Send handshake with slight delay to ensure WebRTC channel is truly flushed
          this.log("Handshake: Sending GREETING to host...");
          let attempts = 0;
          const handshakeInterval = setInterval(() => {
            if (this.connection) {
              this.log(`Handshake: Attempt ${attempts + 1}...`);
              this.connection.send({ type: 'HANDSHAKE' });
              attempts++;
              if (attempts > 5) {
                this.log(`Handshake: TIMEOUT after 5 attempts.`);
                clearInterval(handshakeInterval);
              }
            }
          }, 500);

          // Listen for our own custom event to clear interval if we succeed sooner
          conn.on('data', (d: any) => {
            if (d && d.type === 'HANDSHAKE_ACK') {
              this.log(`Handshake: SUCCESS! Protocol finalized.`);
              clearInterval(handshakeInterval);
            }
          });

        });

        conn.on('error', (err) => {
          this.log(`WebRTC Error: ${err.message}`);
          if (this.onConnectionError) this.onConnectionError(err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        this.log(`Peer Error: ${err.type} - ${err.message}`);
        if (this.onConnectionError) this.onConnectionError(err);
        reject(err);
      });
    });
  }

  private log(msg: string) {
    console.log(`[SYNC] ${msg}`);
    if (this.onDebugLog) this.onDebugLog(msg);
  }

  private setupConnectionListeners(conn: DataConnection, isHost: boolean, resolveClient?: () => void) {
    conn.on('data', async (data: any) => {
      // Handshake protocol
      if (data.type === 'HANDSHAKE' && isHost) {
        console.log("Handshake received from client!");
        if (this.onConnectionStateChange) this.onConnectionStateChange('connected');
        conn.send({ type: 'HANDSHAKE_ACK' });
      } else if (data.type === 'HANDSHAKE_ACK' && !isHost) {
        console.log("Handshake ACK received from host!");
        if (this.onConnectionStateChange) this.onConnectionStateChange('connected');
        if (resolveClient) resolveClient();
      }
      
      // Track transfer
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
