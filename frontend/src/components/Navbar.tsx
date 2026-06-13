import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuth, user, logout } = useUser();

  return (
    <>
      <div className="w-full flex justify-between items-center font-semibold p-4">
        <div className="flex items-center gap-2">
          <img
            src="/left_arrow.png"
            alt="left arrow"
            className="w-8 h-8 bg-black p-2 rounded-2xl cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <img
            src="/right_arrow.png"
            alt="right arrow"
            className="w-8 h-8 bg-black p-2 rounded-2xl cursor-pointer"
            onClick={() => navigate(1)}
          />
        </div>

        <div className="flex items-center gap-4">
          <p className="bg-white text-black text-[15px] rounded-full px-4 py-1 cursor-pointer hidden md:block">
            Explore Premium
          </p>
          {isAuth ? (
            <>
              {user?.role === "admin" && (
                <p
                  className="text-[#1db954] text-[15px] px-3 py-1 cursor-pointer hover:underline"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </p>
              )}
              <span className="text-white text-sm hidden md:block">
                Hi, {user?.name}
              </span>
              <p
                className="bg-white text-black text-[15px] rounded-full px-4 py-1 cursor-pointer"
                onClick={logout}
              >
                Logout
              </p>
            </>
          ) : (
            <>
              <p
                className="text-gray-300 text-[15px] px-4 py-1 cursor-pointer hover:text-white"
                onClick={() => navigate("/register")}
              >
                Sign up
              </p>
              <p
                className="bg-white text-black text-[15px] rounded-full px-4 py-1 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Log in
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 px-4">
        <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer text-sm">
          All
        </p>
        <p className="bg-[#232323] text-white px-4 py-1 rounded-2xl cursor-pointer text-sm hidden md:block">
          Music
        </p>
        <p className="bg-[#232323] text-white px-4 py-1 rounded-2xl cursor-pointer text-sm hidden md:block">
          Podcast
        </p>
      </div>
    </>
  );
};

export default Navbar;
