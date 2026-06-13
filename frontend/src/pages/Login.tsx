import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Login = () => {
  const { loginUser, error } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await loginUser(email, password);
    setSubmitting(false);
    if (ok) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f1f1f] to-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#121212] rounded-lg p-8 flex flex-col gap-4 text-white"
      >
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="logo" className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-center">Log in to Spotify</h1>

        {error && (
          <p className="bg-red-500/20 text-red-300 text-sm rounded px-3 py-2">
            {error}
          </p>
        )}

        <label className="text-sm font-semibold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-[#1f1f1f] border border-[#333] rounded px-3 py-2 outline-none focus:border-white"
          />
        </label>

        <label className="text-sm font-semibold">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-[#1f1f1f] border border-[#333] rounded px-3 py-2 outline-none focus:border-white"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#1db954] text-black font-bold rounded-full py-2.5 mt-2 hover:scale-[1.02] transition disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>

        <p className="text-sm text-gray-400 text-center mt-2">
          Don't have an account?{" "}
          <Link to="/register" className="text-white underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
