"use client";

import { useState } from "react";
import { BACKEND_BASE_URL } from "@/lib/utils";
import { Button } from "../ui/button";

interface LoginPageProps {
    setLoginOrSignup: (loginOrSignup: boolean) => void;
}

export default function LoginPage({ setLoginOrSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");
    try {
      const res = await fetch(`${BACKEND_BASE_URL}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Login failed with status ${res.status}`);
      }
      const data = await res.json();
      // data is { user_id, email, username }

      localStorage.setItem("authResponse", JSON.stringify(data));

      // Then navigate user to your main app
      window.location.href = "/";
    } catch (error: any) {
      setErrors(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="space-y-4 p-4 border w-[300px]">
        <h2 className="text-lg font-semibold">Login</h2>
        <Button onClick={() => setLoginOrSignup(false)}>
            Switch to Sign Up
        </Button>
        {errors && <p className="text-red-500 text-sm">{errors}</p>}
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
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
