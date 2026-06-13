import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import Layout from "../components/Layout";
import { adminApi, apiError } from "../api";
import { useSong } from "../context/SongContext";

type Flash = { type: "ok" | "err"; text: string } | null;

const inputCls =
  "w-full bg-[#1f1f1f] border border-[#333] rounded px-3 py-2 outline-none focus:border-white text-white";
const cardCls = "bg-[#181818] rounded-lg p-5 flex flex-col gap-3";

const Admin = () => {
  const { albums, songs, reload } = useSong();
  const [flash, setFlash] = useState<Flash>(null);

  // Add-album form
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumFile, setAlbumFile] = useState<File | null>(null);
  const [albumBusy, setAlbumBusy] = useState(false);

  // Add-song form
  const [songTitle, setSongTitle] = useState("");
  const [songDesc, setSongDesc] = useState("");
  const [songAlbum, setSongAlbum] = useState("");
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songBusy, setSongBusy] = useState(false);

  const notify = (f: Flash) => {
    setFlash(f);
    if (f) setTimeout(() => setFlash(null), 4000);
  };

  const addAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumFile) return notify({ type: "err", text: "Pick a thumbnail image" });
    setAlbumBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", albumTitle);
      fd.append("description", albumDesc);
      fd.append("file", albumFile);
      await adminApi.post("/album/new", fd);
      notify({ type: "ok", text: "Album created" });
      setAlbumTitle("");
      setAlbumDesc("");
      setAlbumFile(null);
      (e.target as HTMLFormElement).reset();
      await reload();
    } catch (err) {
      notify({ type: "err", text: apiError(err, "Failed to create album") });
    } finally {
      setAlbumBusy(false);
    }
  };

  const addSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songFile) return notify({ type: "err", text: "Pick an audio file" });
    setSongBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", songTitle);
      fd.append("description", songDesc);
      if (songAlbum) fd.append("album_id", songAlbum);
      fd.append("file", songFile);
      await adminApi.post("/song/new", fd);
      notify({ type: "ok", text: "Song added" });
      setSongTitle("");
      setSongDesc("");
      setSongAlbum("");
      setSongFile(null);
      (e.target as HTMLFormElement).reset();
      await reload();
    } catch (err) {
      notify({ type: "err", text: apiError(err, "Failed to add song") });
    } finally {
      setSongBusy(false);
    }
  };

  const uploadThumbnail = async (songId: number, file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      await adminApi.post(`/song/${songId}`, fd);
      notify({ type: "ok", text: "Thumbnail updated" });
      await reload();
    } catch (err) {
      notify({ type: "err", text: apiError(err, "Failed to upload thumbnail") });
    }
  };

  const removeAlbum = async (id: number) => {
    if (!confirm("Delete this album and all its songs?")) return;
    try {
      await adminApi.delete(`/album/${id}`);
      notify({ type: "ok", text: "Album deleted" });
      await reload();
    } catch (err) {
      notify({ type: "err", text: apiError(err, "Failed to delete album") });
    }
  };

  const removeSong = async (id: number) => {
    if (!confirm("Delete this song?")) return;
    try {
      await adminApi.delete(`/song/${id}`);
      notify({ type: "ok", text: "Song deleted" });
      await reload();
    } catch (err) {
      notify({ type: "err", text: apiError(err, "Failed to delete song") });
    }
  };

  return (
    <Layout>
      <div className="py-4 text-white max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Admin</h1>

        {flash && (
          <div
            className={`mb-6 rounded px-4 py-2 text-sm ${
              flash.type === "ok"
                ? "bg-[#1db954]/20 text-[#1db954]"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {flash.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {/* Add album */}
          <form onSubmit={addAlbum} className={cardCls}>
            <h2 className="text-xl font-semibold">Add Album</h2>
            <input
              className={inputCls}
              placeholder="Title"
              required
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Description"
              required
              value={albumDesc}
              onChange={(e) => setAlbumDesc(e.target.value)}
            />
            <label className="text-sm text-gray-400">
              Thumbnail (image)
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-300"
                onChange={(e) => setAlbumFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="submit"
              disabled={albumBusy}
              className="bg-[#1db954] text-black font-bold rounded-full py-2 hover:scale-[1.02] transition disabled:opacity-60"
            >
              {albumBusy ? "Creating..." : "Create Album"}
            </button>
          </form>

          {/* Add song */}
          <form onSubmit={addSong} className={cardCls}>
            <h2 className="text-xl font-semibold">Add Song</h2>
            <input
              className={inputCls}
              placeholder="Title"
              required
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Description"
              required
              value={songDesc}
              onChange={(e) => setSongDesc(e.target.value)}
            />
            <select
              className={inputCls}
              value={songAlbum}
              onChange={(e) => setSongAlbum(e.target.value)}
            >
              <option value="">No album</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            <label className="text-sm text-gray-400">
              Audio file
              <input
                type="file"
                accept="audio/*"
                className="mt-1 block w-full text-sm text-gray-300"
                onChange={(e) => setSongFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="submit"
              disabled={songBusy}
              className="bg-[#1db954] text-black font-bold rounded-full py-2 hover:scale-[1.02] transition disabled:opacity-60"
            >
              {songBusy ? "Uploading..." : "Add Song"}
            </button>
          </form>
        </div>

        {/* Manage albums */}
        <h2 className="text-2xl font-bold mb-3">Albums ({albums.length})</h2>
        <div className="flex flex-col gap-2 mb-10">
          {albums.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 bg-[#181818] rounded p-3"
            >
              <img
                src={a.thumbnail}
                alt={a.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{a.title}</p>
                <p className="text-sm text-gray-400 truncate">{a.description}</p>
              </div>
              <button
                onClick={() => removeAlbum(a.id)}
                className="text-gray-400 hover:text-red-400 p-2"
                title="Delete album"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {albums.length === 0 && <p className="text-gray-500">No albums.</p>}
        </div>

        {/* Manage songs */}
        <h2 className="text-2xl font-bold mb-3">Songs ({songs.length})</h2>
        <div className="flex flex-col gap-2">
          {songs.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-[#181818] rounded p-3"
            >
              {s.thumbnail ? (
                <img
                  src={s.thumbnail}
                  alt={s.title}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-[#333]" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{s.title}</p>
                <p className="text-sm text-gray-400 truncate">{s.description}</p>
              </div>
              <label
                className="text-xs text-gray-300 cursor-pointer hover:text-white px-2"
                title="Upload thumbnail"
              >
                {s.thumbnail ? "Change art" : "Add art"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadThumbnail(s.id, f);
                  }}
                />
              </label>
              <button
                onClick={() => removeSong(s.id)}
                className="text-gray-400 hover:text-red-400 p-2"
                title="Delete song"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          {songs.length === 0 && <p className="text-gray-500">No songs.</p>}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
