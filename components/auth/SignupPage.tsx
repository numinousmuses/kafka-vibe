"use client";

import { useState } from "react";
import { BACKEND_BASE_URL } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface SignupPageProps {
  setLoginOrSignup: (loginOrSignup: boolean) => void;
}

export default function SignupPage({ setLoginOrSignup }: SignupPageProps) {
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
      const res = await fetch(`${BACKEND_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || `Signup failed with status ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem("authResponse", JSON.stringify(data));
      window.location.href = "/";
    } catch (error: any) {
      setErrors(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-neutral-100 w-full">
      <Card className="w-full max-w-md mx-auto bg-neutral-950 rounded-none">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          {errors && <p className="text-red-500 text-sm">{errors}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="someone@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4 bg-blue-200">
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          
        </CardContent>
        <CardFooter>
          <p className="text-sm text-neutral-500">
            Already have an account? 
            <Button variant="link" onClick={() => setLoginOrSignup(true)} className="text-xs">
              Switch to Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
