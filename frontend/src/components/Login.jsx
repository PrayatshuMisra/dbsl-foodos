import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // ✅ Cooldown duration (in milliseconds)
  const COOLDOWN_DURATION = 3000;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCooldown) return; // Prevent multiple submissions

    setLoading(true);
    setIsCooldown(true); // Enable cooldown

    try {
      const { data, error: authError } = await signIn({ email, password });
      
      if (!authError) {
        setSuccess("Login successful!");
        setError(null);
        navigate("/home");
      } else {
        setError(authError.message || "Invalid credentials");
        setSuccess(null);
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An error occurred. Please try again.");
      setSuccess(null);
    } finally {
      setLoading(false);

      // ✅ Set cooldown for button to prevent spam
      setTimeout(() => {
        setIsCooldown(false);
      }, COOLDOWN_DURATION);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-center text-3xl">Login</h1>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm">
        <div className="mb-2">
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full appearance-none rounded-md border p-2"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-2 text-sm text-green-600">{success}</div>}

        <div className="my-4">
          <button
            type="submit"
            disabled={loading || isCooldown}
            className={`w-full rounded-md bg-amber-500 px-4 py-2 text-white transition ${(loading || isCooldown) ? "cursor-not-allowed bg-amber-300" : "hover:bg-amber-600"
              }`}
          >
            {loading ? "Logging in..." : isCooldown ? "Please wait..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
