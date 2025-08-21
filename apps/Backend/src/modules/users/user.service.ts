import { prisma } from "../../db/client";
import { hashPassword } from "../../utils/password";
import { Role } from "@prisma/client";

export function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
  });
}

export async function createUser(
  email: string,
  password: string,
  role: Role = "USER"
) {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: { email, passwordHash, role },
    select: { id: true, email: true, role: true },
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, createdAt: true },
  });
}

export async function updateUser(
  id: string,
  data: { email?: string; password?: string; role?: Role }
) {
  const payload: any = {};
  if (data.email) payload.email = data.email;
  if (data.password) payload.passwordHash = await hashPassword(data.password);
  if (data.role) payload.role = data.role;
  return prisma.user.update({
    where: { id },
    data: payload,
    select: { id: true, email: true, role: true },
  });
}

export function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
