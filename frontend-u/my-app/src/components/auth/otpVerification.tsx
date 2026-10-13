
"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  email?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onBack?: () => void;
};

export default function OtpVerification({
  email,
  onVerify,
  onResend,
  onBack,
}: Props) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const code = otp.join("");
  const complete = otp.every(Boolean);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < 3) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4)
      .split("");

    if (!digits.length) return;

    setOtp([...digits, ...Array(4 - digits.length).fill("")]);
    inputs.current[Math.min(digits.length, 3)]?.focus();
  }

  async function handleVerify() {
    if (!complete) {
      toast.error("Please enter all 4 digits");
      return;
    }

    setLoading(true);
    try {
      await onVerify(code);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!onResend) return;

    setResending(true);
    try {
      await onResend();
      setOtp(["", "", "", ""]);
      inputs.current[0]?.focus();
      toast.success("A new OTP has been requested");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to resend OTP"
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#19191F]/45 p-4 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="my-auto w-full max-w-[430px] rounded-3xl border border-[#ECECF2] bg-white p-6 text-[#19191F] shadow-2xl sm:p-9"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B4CF4]/10 text-[#5B4CF4]">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>

          <div className="text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5B4CF4]">
              Email verification
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Verify your email
            </h1>
            <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-[#73758A]">
              Enter the 4-digit verification code sent to{" "}
              <span className="font-medium text-[#19191F]">
                {email || "your email address"}
              </span>
              .
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-3 sm:gap-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                value={digit}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className="h-14 w-14 rounded-xl border-[#E2E5EC] bg-white text-center text-xl font-semibold text-[#19191F] caret-[#5B4CF4] focus-visible:border-[#5B4CF4] focus-visible:ring-[#5B4CF4]/20 sm:h-16 sm:w-16"
              />
            ))}
          </div>

          <Button
            type="button"
            onClick={handleVerify}
            disabled={loading || !complete}
            className="mt-7 h-12 w-full rounded-xl bg-[#5B4CF4] font-semibold text-white hover:bg-[#4939E5]"
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#73758A]">
              Didn&apos;t receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={!onResend || resending}
              className="mt-2 text-sm font-semibold text-[#5B4CF4] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mx-auto mt-6 flex items-center gap-2 text-sm text-[#73758A] hover:text-[#19191F]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
