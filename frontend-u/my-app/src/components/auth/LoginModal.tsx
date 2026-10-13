
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";

import type { AppDispatch } from "@/redux/store/store";
import { authLogin } from "@/redux/slice/authSlice";
import {
  loginSchema,
  type LoginFormValues,
} from "@/src/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount?: () => void;
};

const inputClass =
  "h-12 rounded-xl border-[#E2E5EC] bg-white px-4 text-[#19191F] caret-[#5B4CF4] placeholder:text-[#9699A8] focus-visible:border-[#5B4CF4] focus-visible:ring-[#5B4CF4]/20";

export default function LoginModal({
  open,
  onOpenChange,
  onCreateAccount,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitting(true);

    try {
      const response = await dispatch(
        authLogin({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        })
      ).unwrap();

      if (!response.status) {
        toast.error(response.message || "Login failed");
        return;
      }

      toast.success(response.message || "Welcome back!");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) {
          reset();
          setShowPassword(false);
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-[#ECECF2] bg-white p-0 text-[#19191F] shadow-2xl sm:max-w-[450px]"
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative px-6 py-8 sm:px-9 sm:py-9"
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close login modal"
                className="absolute right-5 top-5 rounded-lg p-2 text-[#73758A] transition hover:bg-[#F4F3FA] hover:text-[#19191F]"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-5 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5B4CF4] text-2xl font-bold text-white shadow-lg shadow-[#5B4CF4]/20">
                  S
                </div>
              </div>

              <DialogHeader className="mb-7 space-y-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5B4CF4]">
                  Welcome to Savor
                </p>
                <DialogTitle className="text-center text-3xl font-semibold tracking-tight text-[#19191F]">
                  Your next great table awaits.
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-[#73758A]">
                  Sign in to manage reservations, rewards, and preferences.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...register("password")}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73758A] hover:text-[#5B4CF4]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    onClick={() => onOpenChange(false)}
                    className="text-xs font-medium text-[#5B4CF4] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-xl bg-[#5B4CF4] font-semibold text-white shadow-lg shadow-[#5B4CF4]/20 hover:bg-[#4939E5]"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-[#73758A]">
                New to Savor?{" "}
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onCreateAccount?.();
                  }}
                  className="font-semibold text-[#5B4CF4] hover:underline"
                >
                  Create an account
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
