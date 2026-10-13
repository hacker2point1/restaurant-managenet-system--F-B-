
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import VerifyOtpForm from "./VerifyOtpForm";

import type { AppDispatch } from "@/redux/store/store";
import {
  authRegistration,
  type RegistrationPayload,
} from "@/redux/slice/authSlice";
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
  onSignIn?: () => void;
  onRegistered?: (email: string) => void;
};

type RegisterValues = RegistrationPayload;

const schema: yup.ObjectSchema<RegisterValues> = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: yup.string().optional(),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  role: yup
    .mixed<"customer" | "staff" | "manager">()
    .oneOf(["customer", "staff", "manager"])
    .required("Select an account type"),
});

const inputClass =
  "h-11 rounded-xl border-[#E2E5EC] bg-white px-4 text-[#19191F] caret-[#5B4CF4] placeholder:text-[#9699A8] focus-visible:border-[#5B4CF4] focus-visible:ring-[#5B4CF4]/20";

export default function RegisterModal({
  open,
  onOpenChange,
  onSignIn,
  onRegistered,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      role: "customer",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true);

    try {
      const response = await dispatch(
        authRegistration({
          ...values,
          role: "customer",
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone?.trim() || undefined,
        })
      ).unwrap();

      if (!response.status) {
        toast.error(response.message || "Registration failed");
        return;
      }

      toast.success(
        response.message || "Registration successful. Check your email."
      );

      const email = values.email.trim().toLowerCase();
      reset();
      setPendingEmail(email);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOtpVerified() {
    if (!pendingEmail) return;

    onRegistered?.(pendingEmail);
    setPendingEmail(null);
    reset();
    onOpenChange(false);
    onSignIn?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) {
          reset();
          setShowPassword(false);
          setShowConfirmPassword(false);
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-[#ECECF2] bg-white p-0 text-[#19191F] shadow-2xl sm:max-w-[490px]"
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative px-6 py-7 sm:px-9 sm:py-8"
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close registration modal"
                className="absolute right-5 top-5 rounded-lg p-2 text-[#73758A] transition hover:bg-[#F4F3FA] hover:text-[#19191F]"
              >
                <X className="h-5 w-5" />
              </button>

              <DialogHeader className="mb-6 space-y-2 pr-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5B4CF4]">
                  {pendingEmail ? "Email verification" : "Join Savor"}
                </p>
                <DialogTitle className="text-2xl font-semibold tracking-tight text-[#19191F] sm:text-3xl">
                  {pendingEmail ? "Verify your email" : "Create your account"}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-[#73758A]">
                  {pendingEmail
                    ? `Enter the four-digit code sent to ${pendingEmail}.`
                    : "Sign up to manage your reservations and dining preferences."}
                </DialogDescription>
              </DialogHeader>

              {pendingEmail ? (
                <VerifyOtpForm
                  email={pendingEmail}
                  onVerified={handleOtpVerified}
                />
              ) : (
                <>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="register-name">Full name</Label>
                  <Input
                    id="register-name"
                    placeholder="Your full name"
                    autoComplete="name"
                    {...register("name")}
                    className={inputClass}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="register-email">Email address</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...register("email")}
                      className={inputClass}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-phone">Phone (optional)</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Phone number"
                      autoComplete="tel"
                      {...register("phone")}
                      className={inputClass}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="register-role-display">Account type</Label>
                  <input type="hidden" {...register("role")} />
                  <Input
                    id="register-role-display"
                    value="Customer"
                    readOnly
                    className={`${inputClass} border`}
                  />
                  {errors.role && (
                    <p className="text-xs text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        {...register("password")}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73758A] hover:text-[#5B4CF4]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-confirm-password">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        {...register("confirm_password")}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73758A] hover:text-[#5B4CF4]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="text-xs text-red-500">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-xl bg-[#5B4CF4] font-semibold text-white shadow-lg shadow-[#5B4CF4]/20 hover:bg-[#4939E5]"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                  </form>

                  <p className="mt-6 text-center text-sm text-[#73758A]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onSignIn?.();
                      }}
                      className="font-semibold text-[#5B4CF4] hover:underline"
                    >
                      <ArrowLeft className="mr-1 inline h-3.5 w-3.5" />
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
