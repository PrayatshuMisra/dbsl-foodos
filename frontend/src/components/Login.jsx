import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await signIn({ email, password });
      if (authError) {
        setError(authError.message || "Invalid email or password.");
        setLoading(false);
      }
      // ✅ On success: do NOT navigate here.
      // AuthContext's enrichUser will set user → LoginRegisterForm's useEffect redirects automatically.
      // setLoading stays true briefly while auth resolves (gives a nice loading feel).
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm">
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="mt-1 w-full appearance-none rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50 transition"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50 transition"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-all ${
              loading
                ? "bg-amber-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </span>
            ) : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
