import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

function Register({ onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone_number: mobileNumber
          }
        }
      });
      
      if (!authError) {
        setSuccess("Registration successful! You can now log in.");
        
        // Auto-insert into customers table as a fallback if Postgres trigger failed or didn't run
        if (data?.user) {
          try {
            await supabase.from('customers').insert([{
              customer_id: data.user.id,
              name: name,
              email: email,
              phone_number: mobileNumber
            }]);
          } catch (insertErr) {
            console.error("Fallback insert failed (usually fine if trigger worked)", insertErr);
          }
        }
        
        setTimeout(() => {
          if(onSuccess) onSuccess();
        }, 2000);
      } else {
        setError(authError.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-sm"
      >
        <div className="mb-2">
          <label htmlFor="name" className="block text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

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
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="mobileNumber" className="block text-gray-700">
            Mobile Number
          </label>
          <input
            type="text"
            name="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            pattern="[0-9]{10}"
            required
            className="mt-1 w-full rounded-md border p-2"
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

        {error && (
          <div className="mb-2 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mb-2 text-sm text-green-600">{success}</div>
        )}

        <div className="my-4">
          <button
            type="submit"
            className="w-full rounded-md bg-amber-500 px-4 py-2 text-white hover:bg-amber-600 focus:bg-amber-600 focus:outline-none"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
