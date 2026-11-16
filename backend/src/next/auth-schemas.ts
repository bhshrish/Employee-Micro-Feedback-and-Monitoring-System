import type { ZodType } from "zod";

type AuthSchemas = {
    signupSchema: ZodType;
    signinSchema: ZodType;
    invitationAcceptSchema: ZodType;
    forgotPasswordSchema: ZodType;
    resetPasswordSchema: ZodType;
    otpRequestSchema: ZodType;
    otpVerifySchema: ZodType;
    profileSchema: ZodType;
};

const schemas = require("../schemas") as AuthSchemas;

export const {
    signupSchema,
    signinSchema,
    invitationAcceptSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    otpRequestSchema,
    otpVerifySchema,
    profileSchema,
} = schemas;
