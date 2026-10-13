
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { verifyOtp } from "@/redux/slice/authSlice";
import { otpSchema, type OtpFormValues } from "@/src/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Props = {
  email: string;
  onVerified: () => void;
};

export default function VerifyOtpForm({ email, onVerified }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onSubmit(values: OtpFormValues) {
    setSubmitting(true);

    try {
      const response = await dispatch(
        verifyOtp({ email, otp: values.otp })
      ).unwrap();

      if (!response.status) {
        toast.error(response.message || "OTP verification failed");
        return;
      }

      toast.success(response.message || "Email verified successfully");
      onVerified();
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Unable to verify OTP"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div>
        <h2 className="text-2xl font-bold text-[#19191F]">
          Verify your email
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#73758A]">
          Enter the OTP sent to <strong>{email}</strong>. It expires
          after 15 minutes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">4-digit OTP</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          placeholder="Enter your OTP"
          {...register("otp")}
          className="h-12 rounded-xl tracking-[0.3em]"
        />
        {errors.otp && (
          <p className="text-sm text-red-500">{errors.otp.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-xl bg-[#5B4CF4] font-semibold hover:bg-[#4939E5]"
      >
        {submitting ? "Verifying..." : "Verify email"}
      </Button>
    </motion.form>
  );
}
