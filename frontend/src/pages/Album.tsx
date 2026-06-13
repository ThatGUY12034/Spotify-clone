import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaMusic, FaPlay, FaPause } from "react-icons/fa";
import Layout from "../components/Layout";
import { useSong } from "../context/SongContext";
import type { Album as AlbumType, Song } from "../types";

const Album = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchAlbumWithSongs, playSong, currentSong, isPlaying, togglePlay } =
    useSong();

  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchAlbumWithSongs(id).then((data) => {
      if (!active || !data) {
        if (active) setLoading(false);
        return;
      }
      setAlbum(data.album);
      setSongs(data.songs);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <p className="text-gray-400 py-10">Loading album...</p>
      ) : !album ? (
        <p className="text-gray-400 py-10">Album not found.</p>
      ) : (
        <div className="py-4 text-white">
          {/* Header */}
          <div className="flex items-end gap-6 mb-8">
            <img
              src={album.thumbnail}
              alt={album.title}
              className="w-48 h-48 rounded-md object-cover shadow-2xl"
            />
            <div>
              <p className="text-sm uppercase text-gray-300">Album</p>
              <h1 className="text-5xl font-bold mb-3">{album.title}</h1>
              <p className="text-gray-300">{album.description}</p>
              <p className="text-sm text-gray-400 mt-2">
                {songs.length} song{songs.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Track list */}
          <div className="flex flex-col">
            {songs.map((song, i) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  onClick={() =>
                    isCurrent ? togglePlay() : playSong(song, songs)
                  }
                  className="group grid grid-cols-[24px_1fr_auto] items-center gap-4 px-3 py-2 rounded hover:bg-[#ffffff1a] cursor-pointer"
                >
                  <span className="text-gray-400 text-sm flex items-center justify-center">
                    <span className="group-hover:hidden">{i + 1}</span>
                    <span className="hidden group-hover:inline text-white">
                      {isCurrent && isPlaying ? <FaPause /> : <FaPlay />}
                    </span>
                  </span>
                  <div className="flex items-center gap-3 min-w-0">
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center">
                        <FaMusic className="text-gray-500 text-sm" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p
                        className={`truncate ${
                          isCurrent ? "text-[#1db954]" : "text-white"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {song.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {songs.length === 0 && (
              <p className="text-gray-500">No songs in this album yet.</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Album;
