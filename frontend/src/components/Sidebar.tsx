import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import PlaylistCard from "./PlaylistCard";
import { useSong } from "../context/SongContext";
import { useUser } from "../context/UserContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { albums } = useSong();
  const { isAuth, playlist } = useUser();

  return (
    <div className="w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex">
      {/* Top Section - Navigation */}
      <div className="bg-[#121212] rounded flex flex-col py-2">
        <div
          className="flex items-center gap-3 pl-6 cursor-pointer py-3 hover:bg-[#242424] transition"
          onClick={() => navigate("/")}
        >
          <img src="/home.png" alt="home" className="w-6 h-6" />
          <p className="font-bold">Home</p>
        </div>

        <div className="flex items-center gap-3 pl-6 cursor-pointer py-3 hover:bg-[#242424] transition">
          <img src="/search.png" alt="search" className="w-6 h-6" />
          <p className="font-bold">Search</p>
        </div>

        {isAuth && (
          <div
            className="flex items-center gap-3 pl-6 cursor-pointer py-3 hover:bg-[#242424] transition"
            onClick={() => navigate("/liked")}
          >
            <span className="w-6 h-6 flex items-center justify-center text-[#1db954]">
              <FaHeart />
            </span>
            <p className="font-bold">Liked Songs</p>
            {playlist.length > 0 && (
              <span className="ml-auto mr-4 text-xs text-gray-400">
                {playlist.length}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Library Section */}
      <div className="bg-[#121212] rounded flex-1 p-4 flex flex-col overflow-hidden">
        {/* Library Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 cursor-pointer hover:text-white">
            <img src="/stack.png" alt="library" className="w-6 h-6" />
            <p className="font-bold">Your Library</p>
          </div>
          <div className="flex items-center gap-2">
            <img
              src="/plus.png"
              alt="add"
              className="w-6 h-6 cursor-pointer hover:bg-[#242424] rounded-full p-1"
            />
            <img
              src="/arrow.png"
              alt="arrow"
              className="w-6 h-6 cursor-pointer hover:bg-[#242424] rounded-full p-1"
            />
          </div>
        </div>

        {/* Albums list */}
        <div className="flex-1 overflow-auto">
          <p className="font-bold text-sm text-gray-400 mb-3">ALBUMS</p>
          <div className="space-y-1">
            {albums.length ? (
              albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                >
                  <PlaylistCard album={album} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 px-2">No albums yet.</p>
            )}

            <div className="p-4 m-2 bg-[#1f1f1f] rounded font-semibold flex flex-col items-start gap-1 mt-4">
              <h1>Let's find some podcasts to follow</h1>
              <p className="font-light text-sm text-gray-300">
                We'll keep you updated with the latest episodes!
              </p>
              <button className="px-4 py-1.5 bg-white text-black text-[15px] rounded-full mt-4">
                Browse Podcasts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
