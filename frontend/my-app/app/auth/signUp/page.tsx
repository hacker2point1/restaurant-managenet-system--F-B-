"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
  Phone,
  User,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authRegistration } from "@/redux/slice/authSlice";

// import { authRegister } from "@/redux/slice/authSlice";


// =========================================================
// VALIDATION SCHEMA
// =========================================================

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .required("Full name is required"),

  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),

  phone: yup
    .string()
    .trim()
    .matches(
      /^[0-9+\-\s()]{10,15}$/,
      "Please enter a valid phone number"
    )
    .optional(),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters")
    .required("Password is required"),

  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),

  role: yup
    .string()
    .oneOf(
      ["customer", "staff", "manager"],
      "Please select a valid role"
    )
    .required("Role is required"),
});


// =========================================================
// TYPES
// =========================================================

type SignUpFormData = yup.InferType<typeof schema>;


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

export default function SignUp() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const toastShown = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);


  // =======================================================
  // SEARCH PARAM MESSAGE
  // =======================================================

  useEffect(() => {
    const message = searchParams.get("message");

    if (message && !toastShown.current) {
      toast.error(message);
      toastShown.current = true;
    }
  }, [searchParams]);



  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(schema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      role: undefined,
    },
  });


  const selectedRole = watch("role");


  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);



      const response = await dispatch(authRegistration(data)).unwrap();



      if (response.status === true) {
        toast.success(
          response.message ||
            "Registration successful. OTP has been sent to your email for verification."
        );

        /*
         * Your backend says:
         *
         * "OTP has been sent to your email for verification."
         *
         * So after registration, redirect to your OTP page.
         *
         * Change this route if your actual OTP route is different.
         */

        router.push(
          `/auth/verifyOtp?email=${encodeURIComponent(
            data.email
          )}`
        );

        return;
      }


      // =====================================================
      // BACKEND ERROR
      // =====================================================

      toast.error(response.message || "Registration failed");

    } catch (error) {
      console.error("Registration error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  // =======================================================
  // GOOGLE SIGNUP
  // =======================================================

  const handleGoogleSignup = () => {
    toast.info("Google signup is not configured yet.");
  };


  // =======================================================
  // UI
  // =======================================================

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

          {/* Background Circle */}

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
                BACK TO DASHBOARD
            ================================================= */}

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


            {/* =================================================
                LOGIN / SIGNUP SWITCH
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="
                mt-10
                inline-flex
                rounded-xl
                bg-[#edf0ef]
                p-1
              "
            >

              <Link
                href="/auth/signIn"
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
                Log in
              </Link>


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
                Sign up
              </div>

            </motion.div>


            {/* =================================================
                HEADING
            ================================================= */}

            <motion.div
              variants={itemVariants}
              className="mt-8"
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
                Create your workspace
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
                Start organizing your restaurant operations
                in one secure workspace.
              </p>

            </motion.div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
            >


              {/* =================================================
                  ROW 1
                  NAME + PHONE
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">


                {/* -------------------------------------------------
                    NAME
                ------------------------------------------------- */}

                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >

                  <Label
                    htmlFor="name"
                    className="
                      text-sm
                      font-semibold
                      text-[#394444]
                    "
                  >
                    Full name
                    <span className="ml-1 text-red-500">*</span>
                  </Label>


                  <div className="relative">

                    <User
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
                      id="name"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      {...register("name")}
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
                          errors.name
                            ? "border-red-400 focus-visible:border-red-400"
                            : ""
                        }
                      `}
                    />

                  </div>


                  {errors.name && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.name.message}
                    </p>
                  )}

                </motion.div>



                {/* -------------------------------------------------
                    PHONE
                ------------------------------------------------- */}

                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >

                  <Label
                    htmlFor="phone"
                    className="
                      text-sm
                      font-semibold
                      text-[#394444]
                    "
                  >
                    Phone number
                  </Label>


                  <div className="relative">

                    <Phone
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
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      autoComplete="tel"
                      {...register("phone")}
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
                          errors.phone
                            ? "border-red-400 focus-visible:border-red-400"
                            : ""
                        }
                      `}
                    />

                  </div>


                  {errors.phone && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.phone.message}
                    </p>
                  )}

                </motion.div>

              </div>



              {/* =================================================
                  EMAIL
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="space-y-2"
              >

                <Label
                  htmlFor="email"
                  className="
                    text-sm
                    font-semibold
                    text-[#394444]
                  "
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
                    placeholder="name@restaurant.com"
                    autoComplete="email"
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
                          ? "border-red-400 focus-visible:border-red-400"
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
                  ROLE
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="space-y-2"
              >

                <Label
                  htmlFor="role"
                  className="
                    text-sm
                    font-semibold
                    text-[#394444]
                  "
                >
                  Account role
                  <span className="ml-1 text-red-500">*</span>
                </Label>


                <Select
                  value={selectedRole}
                  onValueChange={(value) =>
                    setValue(
                      "role",
                      value as
                        | "customer"
                        | "staff"
                        | "manager",
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                >

                  <SelectTrigger
                    id="role"
                    className={`
                      h-12
                      rounded-lg
                      border-[#d6dcdb]
                      bg-white
                      text-sm
                      shadow-none
                      focus:ring-[#936a2e]/20
                      ${
                        errors.role
                          ? "border-red-400"
                          : ""
                      }
                    `}
                  >

                    <SelectValue placeholder="Select your role" />

                  </SelectTrigger>


                  <SelectContent>

                    <SelectItem value="customer">
                      Customer
                    </SelectItem>

                    <SelectItem value="staff">
                      Staff
                    </SelectItem>

                    <SelectItem value="manager">
                      Manager
                    </SelectItem>

                  </SelectContent>

                </Select>


                {errors.role && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.role.message}
                  </p>
                )}

              </motion.div>



              {/* =================================================
                  PASSWORD + CONFIRM PASSWORD
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">


                {/* -------------------------------------------------
                    PASSWORD
                ------------------------------------------------- */}

                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >

                  <Label
                    htmlFor="password"
                    className="
                      text-sm
                      font-semibold
                      text-[#394444]
                    "
                  >
                    Password
                    <span className="ml-1 text-red-500">*</span>
                  </Label>


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
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter password"
                      autoComplete="new-password"
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
                            ? "border-red-400"
                            : ""
                        }
                      `}
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="
                        absolute
                        right-3.5
                        top-1/2
                        -translate-y-1/2
                        text-[#899292]
                        hover:text-[#394444]
                      "
                    >

                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                    </button>

                  </div>


                  <p className="text-[11px] text-[#899292]">
                    Use at least 6 characters.
                  </p>


                  {errors.password && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.password.message}
                    </p>
                  )}

                </motion.div>



                {/* -------------------------------------------------
                    CONFIRM PASSWORD
                ------------------------------------------------- */}

                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >

                  <Label
                    htmlFor="confirm_password"
                    className="
                      text-sm
                      font-semibold
                      text-[#394444]
                    "
                  >
                    Confirm password
                    <span className="ml-1 text-red-500">*</span>
                  </Label>


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
                      id="confirm_password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      {...register("confirm_password")}
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
                          errors.confirm_password
                            ? "border-red-400"
                            : ""
                        }
                      `}
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      className="
                        absolute
                        right-3.5
                        top-1/2
                        -translate-y-1/2
                        text-[#899292]
                        hover:text-[#394444]
                      "
                    >

                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                    </button>

                  </div>


                  {errors.confirm_password && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.confirm_password.message}
                    </p>
                  )}

                </motion.div>

              </div>



              {/* =================================================
                  CREATE ACCOUNT
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

                      Creating account...

                    </span>
                  ) : (
                    "Create account"
                  )}

                </Button>

              </motion.div>



              {/* =================================================
                  DIVIDER
              ================================================= */}

              <motion.div
                variants={itemVariants}
                className="
                  flex
                  items-center
                  gap-4
                  py-1
                "
              >

                <div className="h-px flex-1 bg-[#dde1e0]" />

                <span
                  className="
                    text-xs
                    font-medium
                    text-[#899292]
                  "
                >
                  or continue with
                </span>

                <div className="h-px flex-1 bg-[#dde1e0]" />

              </motion.div>



              {/* =================================================
                  GOOGLE
              ================================================= */}

              <motion.div variants={itemVariants}>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignup}
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
                  LOGIN
              ================================================= */}

              <motion.p
                variants={itemVariants}
                className="
                  pt-1
                  text-center
                  text-sm
                  text-[#727d7d]
                "
              >

                Already have an account?

                <Link
                  href="/auth/login"
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



              {/* =================================================
                  TERMS
              ================================================= */}

              <motion.p
                variants={itemVariants}
                className="
                  text-center
                  text-[11px]
                  leading-5
                  text-[#929b9b]
                "
              >

                By creating an account, you agree to our{" "}

                <Link
                  href="/terms"
                  className="underline hover:text-[#936a2e]"
                >
                  Terms of Service
                </Link>

                {" "}and{" "}

                <Link
                  href="/privacy"
                  className="underline hover:text-[#936a2e]"
                >
                  Privacy Policy
                </Link>

                .

              </motion.p>

            </form>

          </div>

        </motion.section>

      </div>
    </main>
  );
}