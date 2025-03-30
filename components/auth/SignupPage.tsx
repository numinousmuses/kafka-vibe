"use client";

import { useState } from "react";
import { BACKEND_BASE_URL } from "@/lib/utils"; // or wherever you define it

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    try {
      const res = await fetch(`${BACKEND_BASE_URL}auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Signup failed with status ${res.status}`);
      }
      const data = await res.json();
      // data is { user_id, email, username } from the LoginResponse

      // Optionally save to localStorage or cookie
      localStorage.setItem("authResponse", JSON.stringify(data));

      // Redirect or route to your main page
      window.location.href = "/";
    } catch (error: any) {
      setErrors(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSignup} className="space-y-4 p-4 border w-[300px]">
        <h2 className="text-lg font-semibold">Sign Up</h2>
        {errors && <p className="text-red-500 text-sm">{errors}</p>}
        <div>
          <label className="block mb-1 text-sm">Username</label>
          <input
            className="border w-full p-1 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">Email</label>
          <input
            className="border w-full p-1 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm">Password</label>
          <input
            className="border w-full p-1 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-500 text-white text-sm px-3 py-1"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
