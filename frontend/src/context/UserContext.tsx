import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { userApi, setAuthToken } from "../api";
import type { User } from "../types";

interface UserContextType {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  loading: boolean;
  error: string | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  // Playlist (saved song ids)
  playlist: string[];
  isInPlaylist: (songId: string | number) => boolean;
  togglePlaylist: (songId: string | number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<string[]>([]);

  // On mount (or token change), hydrate the user from the token.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    let active = true;
    (async () => {
      try {
        const { data } = await userApi.get("/user/me");
        if (active) {
          setUser(data);
          setPlaylist(data.playlist ?? []);
        }
      } catch {
        // Token invalid/expired — clear it.
        if (active) {
          localStorage.removeItem("token");
          setToken(null);
          setAuthToken(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const persist = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setPlaylist(newUser.playlist ?? []);
  };

  const loginUser = async (email: string, password: string) => {
    setError(null);
    try {
      const { data } = await userApi.post("/user/login", { email, password });
      persist(data.token, data.user);
      return true;
    } catch (err: unknown) {
      setError(extractError(err, "Login failed"));
      return false;
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string
  ) => {
    setError(null);
    try {
      const { data } = await userApi.post("/user/register", {
        name,
        email,
        password,
      });
      persist(data.token, data.user);
      return true;
    } catch (err: unknown) {
      setError(extractError(err, "Registration failed"));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setPlaylist([]);
  };

  const isInPlaylist = (songId: string | number) =>
    playlist.includes(String(songId));

  // Add/remove a song from the playlist. Optimistic: update local state first,
  // then sync with the server; roll back if the request fails.
  const togglePlaylist = async (songId: string | number) => {
    if (!user) return;
    const id = String(songId);
    const adding = !playlist.includes(id);
    const prev = playlist;
    setPlaylist(adding ? [...playlist, id] : playlist.filter((s) => s !== id));
    try {
      if (adding) await userApi.post(`/user/playlist/${id}`);
      else await userApi.delete(`/user/playlist/${id}`);
    } catch {
      setPlaylist(prev); // revert on failure
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isAuth: !!user,
        loading,
        error,
        loginUser,
        registerUser,
        logout,
        playlist,
        isInPlaylist,
        togglePlaylist,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

function extractError(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data
      .message;
  }
  return fallback;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
