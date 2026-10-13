"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  Check,
  Mail,
  ShieldCheck,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { verifyOtp } from "@/redux/slice/authSlice";
import type { AppDispatch } from "@/redux/store/store";

// =========================================================
// ANIMATION VARIANTS
// =========================================================

const leftPanelVariants = {
  hidden: {
    opacity: 0,
    x: -40,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const formVariants = {
  hidden: {
    opacity: 0,
    x: 40,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      delay: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// =========================================================
// COMPONENT
// =========================================================

export default function VerifyOtpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------------------------------------------------------
  // Email
  // Email comes from the signup page through the URL.
  // It is intentionally read-only.
  // ---------------------------------------------------------

  const [email, setEmail] = useState(
    searchParams.get("email") ?? ""
  );

  // ---------------------------------------------------------
  // OTP
  // ---------------------------------------------------------

  const [otp, setOtp] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------
  // OTP Input References
  // ---------------------------------------------------------

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  // =========================================================
  // UPDATE EMAIL FROM URL
  // =========================================================

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  // =========================================================
  // OTP VALUE
  // =========================================================

  const otpValue = otp.join("");

  // =========================================================
  // HANDLE OTP CHANGE
  // =========================================================

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");

    // Empty value
    if (!numericValue) {
      const updatedOtp = [...otp];

      updatedOtp[index] = "";

      setOtp(updatedOtp);

      return;
    }

    // -------------------------------------------------------
    // Handle multiple digits / paste
    // -------------------------------------------------------

    if (numericValue.length > 1) {
      const digits = numericValue
        .slice(0, 4)
        .split("");

      const updatedOtp = ["", "", "", ""];

      digits.forEach((digit, digitIndex) => {
        if (digitIndex < 4) {
          updatedOtp[digitIndex] = digit;
        }
      });

      setOtp(updatedOtp);

      const nextIndex =
        Math.min(digits.length, 4) - 1;

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    // -------------------------------------------------------
    // Normal single digit
    // -------------------------------------------------------

    const updatedOtp = [...otp];

    updatedOtp[index] = numericValue;

    setOtp(updatedOtp);

    // Automatically move to next input
    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =========================================================
  // HANDLE KEY DOWN
  // =========================================================

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // -------------------------------------------------------
    // Backspace
    // -------------------------------------------------------

    if (event.key === "Backspace") {
      if (otp[index]) {
        const updatedOtp = [...otp];

        updatedOtp[index] = "";

        setOtp(updatedOtp);

        return;
      }

      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();

        const updatedOtp = [...otp];

        updatedOtp[index - 1] = "";

        setOtp(updatedOtp);
      }
    }

    // -------------------------------------------------------
    // Arrow Left
    // -------------------------------------------------------

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    // -------------------------------------------------------
    // Arrow Right
    // -------------------------------------------------------

    if (
      event.key === "ArrowRight" &&
      index < 3
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =========================================================
  // HANDLE PASTE
  // =========================================================

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const pastedText = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!pastedText) {
      return;
    }

    const digits = pastedText.split("");

    const updatedOtp = ["", "", "", ""];

    digits.forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    // Focus last entered digit
    const focusIndex =
      Math.min(digits.length, 4) - 1;

    inputRefs.current[focusIndex]?.focus();
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // -------------------------------------------------------
    // Validate OTP
    // -------------------------------------------------------

    if (!/^\d{4}$/.test(otpValue)) {
      toast.error(
        "Enter the four-digit code from your email."
      );

      return;
    }

    // -------------------------------------------------------
    // Make sure email exists
    // -------------------------------------------------------

    if (!email.trim()) {
      toast.error(
        "Email address is missing. Please register again."
      );

      return;
    }

    try {
      setIsLoading(true);

      // -----------------------------------------------------
      // Existing Redux logic
      // -----------------------------------------------------

      const response = await dispatch(
        verifyOtp({
          email: email.trim(),
          otp: otpValue,
        })
      ).unwrap();

      // -----------------------------------------------------
      // Success
      // -----------------------------------------------------

      if (response.status === true) {
        toast.success(
          response.message ||
            "Email verified successfully"
        );

        router.push("/auth/signIn");

        return;
      }

      // -----------------------------------------------------
      // Backend Error
      // -----------------------------------------------------

      toast.error(
        response.message ||
          "OTP verification failed"
      );
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      toast.error(
        typeof error === "string"
          ? error
          : "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen w-full overflow-hidden bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <motion.section
          variants={leftPanelVariants}
          initial="hidden"
          animate="visible"
          className="
            relative
            hidden
            min-h-screen
            overflow-hidden
            bg-[#111c1c]
            px-8
            py-10
            text-white
            lg:flex
            lg:flex-col
            lg:justify-between
            xl:px-16
            xl:py-12
          "
        >

          {/* Background circle */}

          <div
            className="
              pointer-events-none
              absolute
              -right-32
              -top-36
              h-[420px]
              w-[420px]
              rounded-full
              border
              border-[#8f672e]/20
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              right-[-90px]
              top-[120px]
              h-[260px]
              w-[260px]
              rounded-full
              border
              border-[#8f672e]/30
            "
          />

          {/* Bottom circle */}

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              -left-32
              h-[470px]
              w-[470px]
              rounded-full
              bg-[#263333]
            "
          />

          {/* =================================================
              LOGO
          ================================================= */}

          <motion.div
            variants={itemVariants}
            className="
              relative
              z-10
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-[#936a2e]
                shadow-lg
              "
            >
              <Utensils
                className="h-6 w-6 text-white"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Bistro Admin
              </h2>

              <p className="mt-0.5 text-sm text-white/55">
                Restaurant operations, simplified
              </p>
            </div>

          </motion.div>

          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="relative z-10 max-w-[650px]">

            <motion.div
              variants={itemVariants}
              className="
                mb-7
                flex
                items-center
                gap-3
              "
            >

              <div className="h-px w-8 bg-[#b88a42]" />

              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#c6a366]
                "
              >
                Built for hospitality teams
              </span>

            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="
                max-w-[650px]
                text-4xl
                font-bold
                leading-[1.08]
                tracking-[-0.03em]
                text-white
                sm:text-5xl
                xl:text-[52px]
              "
            >
              Run service with clarity,
              <br />
              from opening to close.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="
                mt-7
                max-w-[600px]
                text-base
                leading-7
                text-white/55
                sm:text-lg
              "
            >
              One calm, connected workspace for your
              restaurant teams, guest experience, and
              business performance.
            </motion.p>

            {/* =================================================
                FEATURES
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="mt-10 space-y-5"
            >

              {/* Feature 1 */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#8e692f]
                    bg-[#1c2929]
                  "
                >
                  <Check
                    className="h-4 w-4 text-[#c39a55]"
                    strokeWidth={2}
                  />
                </div>

                <span
                  className="
                    text-sm
                    font-medium
                    text-white/80
                    sm:text-base
                  "
                >
                  Manage every branch from one workspace
                </span>

              </div>

              {/* Feature 2 */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#8e692f]
                    bg-[#1c2929]
                  "
                >
                  <Check
                    className="h-4 w-4 text-[#c39a55]"
                    strokeWidth={2}
                  />
                </div>

                <span
                  className="
                    text-sm
                    font-medium
                    text-white/80
                    sm:text-base
                  "
                >
                  Track reservations, inventory, and revenue
                </span>

              </div>

              {/* Feature 3 */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#8e692f]
                    bg-[#1c2929]
                  "
                >
                  <Check
                    className="h-4 w-4 text-[#c39a55]"
                    strokeWidth={2}
                  />
                </div>

                <span
                  className="
                    text-sm
                    font-medium
                    text-white/80
                    sm:text-base
                  "
                >
                  Give each team member the right access
                </span>

              </div>

            </motion.div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <motion.p
            variants={itemVariants}
            className="
              relative
              z-10
              text-sm
              font-medium
              text-white/30
            "
          >
            Trusted tools for modern restaurant operations
          </motion.p>

        </motion.section>


        {/* =================================================
            RIGHT PANEL
        ================================================= */}

        <motion.section
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-white
            px-6
            py-10
            sm:px-10
            lg:px-12
            xl:px-20
          "
        >

          <div className="w-full max-w-[465px]">

            {/* =================================================
                BACK
            ================================================= */}

            <motion.div variants={itemVariants}>

              <Link
                href="/auth/signUp"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-[#4b5757]
                  transition-colors
                  hover:text-[#936a2e]
                "
              >

                <ArrowLeft
                  className="
                    h-4
                    w-4
                    transition-transform
                    group-hover:-translate-x-1
                  "
                />

                Back to sign up

              </Link>

            </motion.div>


            {/* =================================================
                VERIFICATION ICON
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="mt-12"
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#f3eee5]
                "
              >

                <ShieldCheck
                  className="h-7 w-7 text-[#936a2e]"
                  strokeWidth={1.8}
                />

              </div>

            </motion.div>


            {/* =================================================
                HEADING
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="mt-6"
            >

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-[-0.025em]
                  text-[#172020]
                  sm:text-[34px]
                "
              >
                Verify your email
              </h1>

              <p
                className="
                  mt-3
                  max-w-[440px]
                  text-sm
                  leading-6
                  text-[#697373]
                  sm:text-base
                "
              >
                Enter the four-digit code we sent to your
                email address to verify your account.
              </p>

            </motion.div>


            {/* =================================================
                EMAIL - READ ONLY
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="mt-7"
            >

              <Label
                htmlFor="email"
                className="
                  text-sm
                  font-semibold
                  text-[#394444]
                "
              >
                Email address
              </Label>

              <div className="relative mt-2">

                <Mail
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[#899292]
                  "
                />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  readOnly
                  aria-readonly="true"
                  className="
                    h-12
                    cursor-not-allowed
                    rounded-lg
                    border-[#d6dcdb]
                    bg-[#f5f6f5]
                    pl-10
                    text-sm
                    text-[#697373]
                    shadow-none
                    focus-visible:border-[#d6dcdb]
                    focus-visible:ring-0
                  "
                />

              </div>

              <p
                className="
                  mt-1.5
                  text-xs
                  text-[#899292]
                "
              >
                This email address is linked to your account.
              </p>

            </motion.div>


            {/* =================================================
                OTP FORM
            ================================================= */}

            <form
              onSubmit={onSubmit}
              className="mt-6"
            >

              <motion.div variants={itemVariants}>

                <Label
                  className="
                    text-sm
                    font-semibold
                    text-[#394444]
                  "
                >
                  Verification code
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </Label>

                <p
                  className="
                    mt-1
                    text-xs
                    text-[#899292]
                  "
                >
                  Enter the 4-digit code from your email.
                </p>


                {/* =================================================
                    OTP BOXES
                ================================================= */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-center
                    gap-3
                    sm:justify-start
                    sm:gap-4
                  "
                >

                  {otp.map((digit, index) => (

                    <Input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={
                        index === 0
                          ? "one-time-code"
                          : "off"
                      }
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleOtpChange(
                          index,
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleOtpKeyDown(
                          index,
                          event
                        )
                      }
                      onPaste={handlePaste}
                      className="
                        h-14
                        w-14
                        rounded-xl
                        border-[#d6dcdb]
                        bg-white
                        p-0
                        text-center
                        text-xl
                        font-semibold
                        text-[#172020]
                        shadow-none
                        transition-all
                        focus-visible:border-[#936a2e]
                        focus-visible:ring-2
                        focus-visible:ring-[#936a2e]/20
                        sm:h-16
                        sm:w-16
                        sm:text-2xl
                      "
                      aria-label={`OTP digit ${
                        index + 1
                      }`}
                    />

                  ))}

                </div>

              </motion.div>


              {/* =================================================
                  VERIFY BUTTON
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="mt-7"
              >

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="
                    h-12
                    w-full
                    rounded-lg
                    bg-[#936a2e]
                    text-sm
                    font-semibold
                    text-white
                    shadow-none
                    transition-all
                    hover:bg-[#7f5a25]
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >

                  {isLoading ? (
                    <span className="flex items-center gap-2">

                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-white/30
                          border-t-white
                        "
                      />

                      Verifying...

                    </span>
                  ) : (
                    "Verify email"
                  )}

                </Button>

              </motion.div>


              {/* =================================================
                  CHECK INBOX
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="
                  mt-7
                  rounded-lg
                  border
                  border-[#e3e6e5]
                  bg-[#f8f9f8]
                  p-4
                "
              >

                <div className="flex gap-3">

                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f0eadf]
                    "
                  >

                    <Mail
                      className="h-3.5 w-3.5 text-[#936a2e]"
                    />

                  </div>

                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-[#394444]
                      "
                    >
                      Check your inbox
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-[#7b8585]
                      "
                    >
                      If you don't see the email, check
                      your spam or junk folder.
                    </p>

                  </div>

                </div>

              </motion.div>


              {/* =================================================
                  BACK TO LOGIN
              ================================================= */}

              <motion.p
                variants={itemVariants}
                className="
                  mt-7
                  text-center
                  text-sm
                  text-[#727d7d]
                "
              >

                Already verified?

                <Link
                  href="/auth/signIn"
                  className="
                    ml-2
                    font-semibold
                    text-[#4e5b5b]
                    transition-colors
                    hover:text-[#936a2e]
                  "
                >
                  Log in
                </Link>

              </motion.p>

            </form>

          </div>

        </motion.section>

      </div>
    </main>
  );
}