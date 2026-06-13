import { FaMusic } from "react-icons/fa";
import type { Album } from "../types";

interface PlaylistCardProps {
  album?: Album;
}

const PlaylistCard = ({ album }: PlaylistCardProps) => {
  return (
    <div className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-[#ffffff26]">
      <div className="w-10 h-10 bg-gray-600 flex items-center justify-center rounded-md overflow-hidden">
        {album?.thumbnail ? (
          <img
            src={album.thumbnail}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <FaMusic className="text-white text-xl" />
        )}
      </div>
      <div className="ml-3 min-w-0">
        <h2 className="truncate">{album?.title ?? "My Playlist"}</h2>
        <p className="text-sm text-gray-400 truncate">
          Album • <span>{album ? "Spotify" : "user"}</span>
        </p>
      </div>
    </div>
  );
};

export default PlaylistCard;
