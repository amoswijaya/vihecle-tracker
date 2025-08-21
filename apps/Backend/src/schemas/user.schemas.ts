import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]).optional().default("USER"),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export const userIdParam = z.object({ id: z.string().uuid() });
