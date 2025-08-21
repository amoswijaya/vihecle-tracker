import { test, expect, vi, beforeEach } from "vitest";

// ENV untuk jwt sebelum import service
process.env.JWT_ACCESS_SECRET = "test-access";
process.env.JWT_REFRESH_SECRET = "test-refresh";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";

/**
 * Gunakan vi.hoisted agar variabel dipakai di vi.mock aman dari hoisting
 */
const hoisted = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    },
    verifyPasswordMock: vi.fn(),
    hashPasswordMock: vi.fn(),
  };
});

vi.mock("../../src/db/client", () => ({ prisma: hoisted.mockPrisma }));

vi.mock("../../src/utils/password", () => ({
  verifyPassword: (...args: any[]) => hoisted.verifyPasswordMock(...args),
  hashPassword: (...args: any[]) => hoisted.hashPasswordMock(...args),
}));

// import SETELAH mock
import {
  login,
  refresh as doRefresh,
} from "../../src/modules/auth/auth.service";

beforeEach(() => {
  vi.clearAllMocks();
});

test("login success: simpan hashed refresh & return user", async () => {
  hoisted.mockPrisma.user.findUnique.mockResolvedValue({
    id: "U1",
    email: "admin@example.com",
    passwordHash: "hash",
    role: "ADMIN",
  });
  hoisted.verifyPasswordMock.mockResolvedValue(true);
  hoisted.hashPasswordMock.mockResolvedValue("hashed-refresh");
  hoisted.mockPrisma.refreshToken.create.mockResolvedValue({ id: "RT1" });

  const out = await login("admin@example.com", "Admin123!");
  expect(out.user).toEqual({
    id: "U1",
    email: "admin@example.com",
    role: "ADMIN",
  });
  expect(typeof out.accessToken).toBe("string");
  expect(typeof out.refreshToken).toBe("string");
  expect(hoisted.mockPrisma.refreshToken.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ hashed: "hashed-refresh", userId: "U1" }),
    })
  );
});

test("login invalid password → 401", async () => {
  hoisted.mockPrisma.user.findUnique.mockResolvedValue({
    id: "U1",
    email: "admin@example.com",
    passwordHash: "hash",
    role: "ADMIN",
  });
  hoisted.verifyPasswordMock.mockResolvedValue(false);

  await expect(login("admin@example.com", "wrong")).rejects.toMatchObject({
    status: 401,
  });
});

test("refresh: revoke lama & buat token baru", async () => {
  hoisted.mockPrisma.refreshToken.findMany.mockResolvedValue([
    {
      id: "RT1",
      hashed: "stored-hash",
      revoked: false,
      expiresAt: new Date(Date.now() + 86400000),
    },
  ]);
  // cocokkan refresh plain 'refresh-plain' dengan 'stored-hash'
  hoisted.verifyPasswordMock.mockImplementation(
    async (plain: string, hashed: string) =>
      plain === "refresh-plain" && hashed === "stored-hash"
  );
  hoisted.mockPrisma.refreshToken.update.mockResolvedValue({
    id: "RT1",
    revoked: true,
  });
  hoisted.mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
    id: "U1",
    email: "admin@example.com",
    role: "ADMIN",
  });
  hoisted.hashPasswordMock.mockResolvedValue("new-stored-hash");
  hoisted.mockPrisma.refreshToken.create.mockResolvedValue({ id: "RT2" });

  const out = await doRefresh("U1", "refresh-plain");
  expect(typeof out.accessToken).toBe("string");
  expect(typeof out.refreshToken).toBe("string");
  expect(hoisted.mockPrisma.refreshToken.update).toHaveBeenCalledWith(
    expect.objectContaining({ where: { id: "RT1" }, data: { revoked: true } })
  );
});
