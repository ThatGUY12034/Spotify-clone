import { FaMusic, FaPlay, FaPause } from "react-icons/fa";
import { useSong } from "../context/SongContext";
import type { Song } from "../types";

const SongCard = ({ song, queue }: { song: Song; queue?: Song[] }) => {
  const { playSong, currentSong, isPlaying, togglePlay } = useSong();
  const isCurrent = currentSong?.id === song.id;

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playSong(song, queue);
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
