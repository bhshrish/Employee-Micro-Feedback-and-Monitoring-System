import { z } from "zod";

const password = z.string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer.")
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/\d/, "Include a number.");

export const signupValidator = z.object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid work email.").max(254),
    password,
    confirmPassword: z.string(),
    organizationName: z.string().trim().min(2, "Enter your organization name.").max(120),
    termsAccepted: z.literal(true, { error: "You must accept the terms to continue." }),
}).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export const loginValidator = z.object({
    email: z.string().trim().email("Enter a valid email address.").max(254),
    password: z.string().min(1, "Enter your password."),
});

export const inviteValidator = z.object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid work email.").max(254),
    password,
    confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

export const resetPasswordValidator = z.object({
    password,
    confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});
