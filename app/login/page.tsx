"use client";

import { useState } from "react";
import LoginPage from "@/components/auth/LoginPage";
import SignupPage from "@/components/auth/SignupPage";

export default function Login() {

    const [loginOrSignup, setLoginOrSignup] = useState(true); // default to login

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {loginOrSignup ? (
                <LoginPage setLoginOrSignup={setLoginOrSignup} />
            ) : (
                <SignupPage setLoginOrSignup={setLoginOrSignup} />
            )}
        </div>
    );
}