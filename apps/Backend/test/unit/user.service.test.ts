import { test, expect, vi, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  hashPasswordMock: vi.fn(),
}));

vi.mock("../../src/db/client", () => ({ prisma: hoisted.mockPrisma }));
vi.mock("../../src/utils/password", () => ({
  hashPassword: (...args: any[]) => hoisted.hashPasswordMock(...args),
}));

import * as svc from "../../src/modules/users/user.service";

beforeEach(() => vi.clearAllMocks());

test("createUser: hash password & return public fields", async () => {
  hoisted.hashPasswordMock.mockResolvedValue("hashedPw");
  hoisted.mockPrisma.user.create.mockResolvedValue({
    id: "U2",
    email: "new@example.com",
    role: "USER",
  });

  const out = await svc.createUser("new@example.com", "NewUser123!", "USER");
  expect(out).toEqual({ id: "U2", email: "new@example.com", role: "USER" });
  expect(hoisted.hashPasswordMock).toHaveBeenCalledWith("NewUser123!");
});

test("updateUser: update role & password", async () => {
  hoisted.hashPasswordMock.mockResolvedValue("newHash");
  hoisted.mockPrisma.user.update.mockResolvedValue({
    id: "U2",
    email: "new@example.com",
    role: "ADMIN",
  });

  const out = await svc.updateUser("U2", {
    role: "ADMIN",
    password: "New!" as any,
  });
  expect(out.role).toBe("ADMIN");
  expect(hoisted.hashPasswordMock).toHaveBeenCalledWith("New!");
});

test("listUsers returns array", async () => {
  hoisted.mockPrisma.user.findMany.mockResolvedValue([
    { id: "U1", email: "a", role: "USER", createdAt: new Date() },
  ]);
  const arr = await svc.listUsers();
  expect(Array.isArray(arr)).toBe(true);
  expect(arr[0].id).toBe("U1");
});
