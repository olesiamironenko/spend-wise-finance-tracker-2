const { z } = require('zod');

const emailField = z
  .string({ required_error: "Email is required" })
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => z.email().safeParse(val).success, {
    message: "Please provide a valid email address"
  });

const registerValidator = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters"),

      email: emailField,
        
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be at most 100 characters"),

      confirmPassword: z
        .string({ required_error: "Confirm Password is required" })
        .min(6, "Confirm Password must be at least 6 characters")
        .max(100, "Confirm Password must be at most 100 characters"),
    })
    .refine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match"
        });
      }
    })
});

const loginValidator = z.object({
  body: z.object({
    email: emailField,
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters"),
  }),
});

module.exports = {
  registerValidator,
  loginValidator
};