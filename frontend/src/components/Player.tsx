import { useEffect, useState } from "react";
import {
  FaMusic,
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
} from "react-icons/fa";
import { useSong } from "../context/SongContext";

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const Player = () => {
  const {
    audioRef,
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
  } = useSong();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Subscribe to the shared audio element's time/metadata events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
    };
  }, [audioRef]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setProgress(t);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <div className="h-20 bg-black border-t border-[#282828] px-4 flex items-center justify-between text-white">
      {/* Track info */}
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        {currentSong ? (
          <>
            {currentSong.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-14 h-14 rounded object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded bg-[#333] flex items-center justify-center">
                <FaMusic className="text-gray-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{currentSong.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {currentSong.description}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No song playing</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 w-2/4 max-w-xl">
        <div className="flex items-center gap-6">
          <button
            onClick={prevSong}
            disabled={!currentSong}
            className="text-gray-300 hover:text-white disabled:opacity-40"
          >
            <FaStepBackward />
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition disabled:opacity-40"
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>
          <button
            onClick={nextSong}
            disabled={!currentSong}
            className="text-gray-300 hover:text-white disabled:opacity-40"
          >
            <FaStepForward />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-400 w-10 text-right">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={seek}
            disabled={!currentSong}
            className="flex-1 accent-[#1db954] cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <FaVolumeUp className="text-gray-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={changeVolume}
          className="w-24 accent-[#1db954] cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Player;
