
"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function AuthModals() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setLoginOpen(true)}
        className="font-medium"
      >
        Sign in
      </button>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onCreateAccount={() => setRegisterOpen(true)}
      />

      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSignIn={() => setLoginOpen(true)}
        onRegistered={(email) => {
          // Connect your OTP verification page here when its route is confirmed.
          console.log("Registration OTP sent to:", email);
        }}
      />
    </>
  );
}
