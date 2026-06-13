import { FaMusic, FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";
import { useSong } from "../context/SongContext";
import { useUser } from "../context/UserContext";
import type { Song } from "../types";

const SongCard = ({ song, queue }: { song: Song; queue?: Song[] }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = useSong();
  const { isAuth, isInPlaylist, togglePlaylist } = useUser();
  const isCurrent = currentSong?.id === song.id;
  const liked = isInPlaylist(song.id);

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playSong(song, queue);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger play
    togglePlaylist(song.id);
  };

  return (
    <div
      onClick={handleClick}
      className="group min-w-[180px] w-[180px] p-3 rounded-lg cursor-pointer bg-[#181818] hover:bg-[#282828] transition relative"
    >
      <div className="relative mb-3">
        {song.thumbnail ? (
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-full aspect-square object-cover rounded-md"
          />
        ) : (
          <div className="w-full aspect-square rounded-md bg-[#333] flex items-center justify-center">
            <FaMusic className="text-3xl text-gray-500" />
          </div>
        )}
        <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
          {isCurrent && isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
        </button>
        {isAuth && (
          <button
            onClick={handleLike}
            title={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center transition ${
              liked
                ? "text-[#1db954] opacity-100"
                : "text-white opacity-0 group-hover:opacity-100 hover:scale-110"
            }`}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>
      <p
        className={`font-semibold truncate ${
          isCurrent ? "text-[#1db954]" : "text-white"
        }`}
      >
        {song.title}
      </p>
      <p className="text-sm text-gray-400 truncate">{song.description}</p>
    </div>
  );
};

export default SongCard;
