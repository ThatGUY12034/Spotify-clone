import { FaHeart } from "react-icons/fa";
import Layout from "../components/Layout";
import SongCard from "../components/SongCard";
import { useSong } from "../context/SongContext";
import { useUser } from "../context/UserContext";

const Liked = () => {
  const { songs, loading } = useSong();
  const { isAuth, playlist } = useUser();

  const likedSongs = songs.filter((s) => playlist.includes(String(s.id)));

  return (
    <Layout>
      <div className="py-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded bg-gradient-to-br from-[#1db954] to-[#0d5c2a] flex items-center justify-center">
            <FaHeart className="text-3xl text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-300 uppercase">Playlist</p>
            <h1 className="text-4xl font-bold text-white">Liked Songs</h1>
            <p className="text-sm text-gray-400 mt-1">
              {likedSongs.length} song{likedSongs.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {!isAuth ? (
          <p className="text-gray-400">Log in to see your liked songs.</p>
        ) : loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : likedSongs.length === 0 ? (
          <p className="text-gray-500">
            No liked songs yet. Tap the heart on any song to save it here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {likedSongs.map((s) => (
              <SongCard key={s.id} song={s} queue={likedSongs} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Liked;
