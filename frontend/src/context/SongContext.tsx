import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { songApi } from "../api";
import type { Album, Song } from "../types";

interface AlbumWithSongs {
  album: Album;
  songs: Song[];
}

interface SongContextType {
  albums: Album[];
  songs: Song[];
  loading: boolean;
  // Player
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  fetchAlbumWithSongs: (id: string | number) => Promise<AlbumWithSongs | null>;
  reload: () => Promise<void>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

export const SongProvider = ({ children }: { children: ReactNode }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [index, setIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentSong = index >= 0 && index < queue.length ? queue[index] : null;

  const reload = useCallback(async () => {
    try {
      const [albumRes, songRes] = await Promise.all([
        songApi.get("/album/all"),
        songApi.get("/song/all"),
      ]);
      setAlbums(albumRes.data.albums ?? []);
      setSongs(songRes.data.songs ?? []);
    } catch (err) {
      console.error("Failed to load music library", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Load + play whenever the current song changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.audio;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentSong]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    const q = newQueue && newQueue.length ? newQueue : [song];
    const i = q.findIndex((s) => s.id === song.id);
    setQueue(q);
    setIndex(i === -1 ? 0 : i);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    setIndex((i) => (i + 1) % queue.length);
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    setIndex((i) => (i - 1 + queue.length) % queue.length);
  };

  const fetchAlbumWithSongs = async (id: string | number) => {
    try {
      const { data } = await songApi.get(`/album/${id}`);
      return data as AlbumWithSongs;
    } catch (err) {
      console.error("Failed to load album", err);
      return null;
    }
  };

  return (
    <SongContext.Provider
      value={{
        albums,
        songs,
        loading,
        audioRef,
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        fetchAlbumWithSongs,
        reload,
      }}
    >
      {children}
      {/* Single shared audio element owned by the provider. */}
      <audio ref={audioRef} onEnded={nextSong} hidden />
    </SongContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSong = () => {
  const ctx = useContext(SongContext);
  if (!ctx) throw new Error("useSong must be used within a SongProvider");
  return ctx;
};
