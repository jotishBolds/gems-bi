import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const employeeIdSchema = z
  .string()
  .regex(/^\d+\/[A-Z]+\/\d+$/, "Invalid employee ID format");

export const signInSchema = z.object({
  identifier: z
    .union([emailSchema, employeeIdSchema])
    .refine((val) => val.length > 0, "Email or Employee ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type SignInSchemaType = z.infer<typeof signInSchema>;
