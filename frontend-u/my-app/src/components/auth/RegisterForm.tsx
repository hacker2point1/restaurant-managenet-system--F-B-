
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { authRegistration } from "@/redux/slice/authSlice";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/src/lib/validations/auth.schema";
import VerifyOtpForm from "./VerifyOtpForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Props = {
  onLoginClick: () => void;
};

export default function RegisterForm({ onLoginClick }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      terms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setSubmitting(true);

    try {
      const name = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

      const response = await dispatch(
        authRegistration({
          name,
          email: values.email.trim().toLowerCase(),
          phone: values.phone?.trim() || undefined,
          password: values.password,
          confirm_password: values.confirm_password,
          role: "customer",
        })
      ).unwrap();

      if (!response.status) {
        toast.error(response.message || "Registration failed");
        return;
      }

      setPendingEmail(values.email.trim().toLowerCase());
      toast.success(
        response.message || "OTP sent to your email"
      );
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B4CF4]/10 text-2xl font-bold text-[#5B4CF4]">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[#19191F]">
          You&apos;re all set!
        </h2>
        <p className="text-sm leading-6 text-[#73758A]">
          Your email has been verified. Sign in to start discovering
          restaurants and managing your reservations.
        </p>
        <Button
          type="button"
          onClick={onLoginClick}
          className="h-12 w-full rounded-xl bg-[#5B4CF4] font-semibold hover:bg-[#4939E5]"
        >
          Sign in <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  if (pendingEmail) {
    return (
      <VerifyOtpForm
        email={pendingEmail}
        onVerified={() => setVerified(true)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5B4CF4]">
          Join Savor
        </p>
        <h2 className="text-4xl font-bold tracking-[-1.5px] text-[#19191F] sm:text-[46px]">
          Create your account
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#73758A]">
          It only takes a minute. Your next great table is waiting.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="Aarav"
              autoComplete="given-name"
              {...register("firstName")}
              className="h-12 rounded-xl border-[#E3E3EA] px-4"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Mehta"
              autoComplete="family-name"
              {...register("lastName")}
              className="h-12 rounded-xl border-[#E3E3EA] px-4"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="aarav@example.com"
            autoComplete="email"
            {...register("email")}
            className="h-12 rounded-xl border-[#E3E3EA] px-4"
          />
          {errors.email && (
            <p className="text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number (optional)</Label>
          <div className="flex h-12 items-center rounded-xl border border-[#E3E3EA] px-4 focus-within:border-[#5B4CF4]">
            <span className="mr-3 border-r border-[#E3E3EA] pr-3 text-sm text-[#73758A]">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              autoComplete="tel-national"
              {...register("phone")}
              className="h-full border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...register("password")}
              className="h-12 rounded-xl border-[#E3E3EA] px-4 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5B4CF4]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register("confirm_password")}
              className="h-12 rounded-xl border-[#E3E3EA] px-4 pr-12"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((show) => !show)
              }
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5B4CF4]"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-red-500">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => {
                const accepted = checked === true;
                setTermsAccepted(accepted);
              }}
              className="mt-0.5"
            />
            <input
              type="checkbox"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              {...register("terms")}
              checked={termsAccepted}
              readOnly
            />
            <Label
              htmlFor="terms"
              className="cursor-pointer text-xs font-normal leading-5 text-[#73758A]"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-[#5B4CF4] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#5B4CF4] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </Label>
          </div>
          {!termsAccepted && errors.terms && (
            <p className="text-xs text-red-500">
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-[52px] w-full rounded-xl bg-[#5B4CF4] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(91,76,244,0.22)] hover:bg-[#4939E5]"
        >
          {submitting ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create my account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E8E8EE]" />
        <span className="text-[11px] text-[#73758A]">or continue with</span>
        <div className="h-px flex-1 bg-[#E8E8EE]" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled
        className="h-[50px] w-full rounded-xl border-[#E3E3EA] bg-white"
        title="Google authentication is not configured yet"
      >
        <span className="mr-2 font-bold text-[#4285F4]">G</span>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-[#73758A]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLoginClick}
          className="font-semibold text-[#5B4CF4] hover:underline"
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
}
