import { useNavigate } from "react-router-dom";
import type { Album } from "../types";

const AlbumCard = ({ album }: { album: Album }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/album/${album.id}`)}
      className="min-w-[180px] w-[180px] p-3 rounded-lg cursor-pointer bg-[#181818] hover:bg-[#282828] transition"
    >
      <img
        src={album.thumbnail}
        alt={album.title}
        className="w-full aspect-square object-cover rounded-md mb-3"
      />
      <p className="font-semibold text-white truncate">{album.title}</p>
      <p className="text-sm text-gray-400 line-clamp-2">{album.description}</p>
    </div>
  );
};

export default AlbumCard;
