
import * as yup from "yup";

export const registerSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(1, "First name is required"),

  lastName: yup
    .string()
    .trim()
    .required("Last name is required"),

  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  phone: yup
    .string()
    .trim()
    .optional()
    .test(
      "phone-format",
      "Enter a valid phone number",
      (value) => !value || /^[0-9+\-\s()]{7,20}$/.test(value)
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must contain at least 8 characters"),

  confirm_password: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),

  terms: yup
    .boolean()
    .oneOf([true], "You must accept the Terms of Service"),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

export const otpSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^\d{4}$/, "Enter the 4-digit OTP"),
});

export type OtpFormValues = yup.InferType<typeof otpSchema>;
