
"use client";

import AuthShowcase from "@/src/components/auth/AuthShowcase";
import LoginModal from "@/src/components/auth/LoginModal";
import RegisterForm from "@/src/components/auth/RegisterForm";
import { useState } from "react";


export default function RegisterPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <AuthShowcase />

        <section className="flex w-full items-start justify-center px-5 py-10 sm:px-10 sm:py-12 lg:w-[55%] lg:items-center lg:px-12 lg:py-10 xl:px-20">
          <div className="w-full max-w-[540px]">
            <RegisterForm
              onLoginClick={() => setLoginOpen(true)}
            />
          </div>
        </section>
      </div>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
      />
    </main>
  );
}
