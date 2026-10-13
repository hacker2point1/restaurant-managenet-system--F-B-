"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authLogin } from "@/redux/slice/authSlice";

// import { authLogin } from "@/redux/slice/authSlice";


// ---------------------------------------------------------
// Validation Schema
// ---------------------------------------------------------

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters")
    .required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;


// ---------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// Login Component
// ---------------------------------------------------------

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const toastShown = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // -------------------------------------------------------
  // Login Redirect Message
  // -------------------------------------------------------

  useEffect(() => {
    const message = searchParams.get("message");

    if (message && !toastShown.current) {
      toast.error("Please Login first");
      toastShown.current = true;
    }
  }, [searchParams]);


  // -------------------------------------------------------
  // React Hook Form
  // -------------------------------------------------------

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });


  // -------------------------------------------------------
  // Login Submit
  // -------------------------------------------------------

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const response = await dispatch(authLogin(data)).unwrap();

      if (response.status === true) {
        toast.success(
          response.message || "Login successful"
        );

        window.location.replace("/admin/dashboard");
      } else {
        toast.error(response.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  // -------------------------------------------------------
  // Google Login Placeholder
  // -------------------------------------------------------

  const handleGoogleLogin = () => {
    toast.info("Google login is not configured yet.");
  };


  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------

  return (
    <main className="min-h-screen w-full bg-white overflow-hidden">
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

          {/* Background Circle 1 */}

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

          {/* Background Circle 2 */}

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

          {/* Bottom Circle */}

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


          {/* -------------------------------------------------
              Logo
          ------------------------------------------------- */}

          <motion.div
            variants={itemVariants}
            className="relative z-10 flex items-center gap-4"
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


          {/* -------------------------------------------------
              Main Content
          ------------------------------------------------- */}

          <div className="relative z-10 max-w-[650px]">

            <motion.div
              variants={itemVariants}
              className="mb-7 flex items-center gap-3"
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


            {/* -------------------------------------------------
                Features
            ------------------------------------------------- */}

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

                <span className="text-sm font-medium text-white/80 sm:text-base">
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

                <span className="text-sm font-medium text-white/80 sm:text-base">
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

                <span className="text-sm font-medium text-white/80 sm:text-base">
                  Give each team member the right access
                </span>

              </div>

            </motion.div>

          </div>


          {/* -------------------------------------------------
              Bottom Text
          ------------------------------------------------- */}

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


            {/* -------------------------------------------------
                Back Button
            ------------------------------------------------- */}

            <motion.div variants={itemVariants}>
              <Link
                href="/"
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

                Back to dashboard

              </Link>
            </motion.div>


            {/* -------------------------------------------------
                Login / Signup Switch
            ------------------------------------------------- */}

            <motion.div
              variants={itemVariants}
              className="
                mt-14
                inline-flex
                rounded-xl
                bg-[#edf0ef]
                p-1
              "
            >

              <div
                className="
                  rounded-lg
                  border
                  border-[#d5d9d8]
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-[#293434]
                  shadow-sm
                "
              >
                Log in
              </div>

              <Link
                href="/auth/signUp"
                className="
                  rounded-lg
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-[#5d6767]
                  transition
                  hover:text-[#293434]
                "
              >
                Sign up
              </Link>

            </motion.div>


            {/* -------------------------------------------------
                Heading
            ------------------------------------------------- */}

            <motion.div
              variants={itemVariants}
              className="mt-10"
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
                Welcome back
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
                Enter your account details to continue to
                your restaurant dashboard.
              </p>

            </motion.div>


            {/* -------------------------------------------------
                Login Form
            ------------------------------------------------- */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-9 space-y-5"
            >


              {/* =================================================
                  EMAIL
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="space-y-2"
              >

                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#394444]"
                >
                  Work email
                  <span className="ml-1 text-red-500">*</span>
                </Label>


                <div className="relative">

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
                    placeholder="name@restaurant.com"
                    {...register("email")}
                    className={`
                      h-12
                      rounded-lg
                      border-[#d6dcdb]
                      bg-white
                      pl-10
                      text-sm
                      shadow-none
                      placeholder:text-[#9aa3a3]
                      focus-visible:border-[#936a2e]
                      focus-visible:ring-[#936a2e]/20
                      ${
                        errors.email
                          ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20"
                          : ""
                      }
                    `}
                  />

                </div>


                {errors.email && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}

              </motion.div>



              {/* =================================================
                  PASSWORD
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="space-y-2"
              >

                <div className="flex items-center justify-between">

                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#394444]"
                  >
                    Password
                    <span className="ml-1 text-red-500">*</span>
                  </Label>


                  <Link
                    href="/auth/resetEmail"
                    className="
                      text-xs
                      font-semibold
                      text-[#536060]
                      transition-colors
                      hover:text-[#936a2e]
                    "
                  >
                    Forgot password?
                  </Link>

                </div>


                <div className="relative">

                  <LockKeyhole
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
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`
                      h-12
                      rounded-lg
                      border-[#d6dcdb]
                      bg-white
                      pl-10
                      pr-11
                      text-sm
                      shadow-none
                      placeholder:text-[#9aa3a3]
                      focus-visible:border-[#936a2e]
                      focus-visible:ring-[#936a2e]/20
                      ${
                        errors.password
                          ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20"
                          : ""
                      }
                    `}
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    className="
                      absolute
                      right-3.5
                      top-1/2
                      -translate-y-1/2
                      text-[#899292]
                      transition-colors
                      hover:text-[#394444]
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}

                  </button>

                </div>


                {errors.password && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}

              </motion.div>



              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <motion.div variants={itemVariants}>

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

                      Logging in...

                    </span>
                  ) : (
                    "Log in to dashboard"
                  )}

                </Button>

              </motion.div>



              {/* =================================================
                  DIVIDER
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 py-1"
              >

                <div className="h-px flex-1 bg-[#dde1e0]" />

                <span className="text-xs font-medium text-[#899292]">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-[#dde1e0]" />

              </motion.div>



              {/* =================================================
                  GOOGLE LOGIN
              ================================================= */}

              <motion.div variants={itemVariants}>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="
                    h-11
                    w-full
                    rounded-lg
                    border-[#d4dada]
                    bg-white
                    text-sm
                    font-semibold
                    text-[#394444]
                    shadow-none
                    hover:bg-[#f7f8f8]
                    hover:text-[#293434]
                  "
                >

                  <span
                    className="
                      mr-2
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#cbd1d0]
                      text-xs
                      font-bold
                    "
                  >
                    G
                  </span>

                  Continue with Google

                </Button>

              </motion.div>



              {/* =================================================
                  REGISTER
              ================================================= */}

              <motion.p
                variants={itemVariants}
                className="
                  pt-2
                  text-center
                  text-sm
                  text-[#727d7d]
                "
              >

                New to Bistro Admin?

                <Link
                  href="/auth/signUp"
                  className="
                    ml-2
                    font-semibold
                    text-[#4e5b5b]
                    transition-colors
                    hover:text-[#936a2e]
                  "
                >
                  Create an account
                </Link>

              </motion.p>

            </form>

          </div>

        </motion.section>

      </div>
    </main>
  );
}