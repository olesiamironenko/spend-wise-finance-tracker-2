const { z } = require('zod');

const emailField = z
  .string({ required_error: "Email is required" })
  .transform((val) => val.trim().toLowerCase())
  .refine((val) => val.length > 0, { message: 'Email is required' })
  .refine((val) => z.email().safeParse(val).success, {
    message: "Please provide a valid email address"
  });

const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be at most 100 characters')

const registerValidator = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters"),

      email: emailField,
        
      password: passwordField,

      confirmPassword: passwordField
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
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
    password: passwordField,
  }),
});

module.exports = {
  registerValidator,
  loginValidator
};