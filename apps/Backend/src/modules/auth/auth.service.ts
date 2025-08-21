import { prisma } from "../../db/client";
import { verifyPassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { add } from "date-fns";
import { env } from "../../congfig/env";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: "Invalid credentials" };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw { status: 401, message: "Invalid credentials" };

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // (Opsional) Simpan hash refresh untuk revoke/rotasi
  const expiresAt = add(
    new Date(),
    parseDuration(env.REFRESH_TOKEN_EXPIRES_IN)
  );
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      hashed: await hashPassword(refreshToken),
      expiresAt,
    },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function refresh(userId: string, refreshToken: string) {
  const tokens = await prisma.refreshToken.findMany({
    where: { userId, revoked: false },
  });

  const found = await (async () => {
    for (const t of tokens) {
      if (await verifyPassword(refreshToken, t.hashed)) return t;
    }
    return null;
  })();

  if (!found || found.expiresAt < new Date())
    throw { status: 401, message: "Invalid refresh token" };

  // Rotasi: revoke lama, buat baru
  await prisma.refreshToken.update({
    where: { id: found.id },
    data: { revoked: true },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const payload = { sub: user.id, role: user.role };
  const newAccess = signAccessToken(payload);
  const newRefresh = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      hashed: await hashPassword(newRefresh),
      expiresAt: add(new Date(), parseDuration(env.REFRESH_TOKEN_EXPIRES_IN)),
    },
  });

  return { accessToken: newAccess, refreshToken: newRefresh };
}

export async function logout(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

function parseDuration(s: string) {
  // supports "15m", "7d", "1h"
  const m = s.match(/^(\d+)([smhd])$/);
  if (!m) return { minutes: 15 };
  const n = Number(m[1]);
  const unit = m[2];
  if (unit === "s") return { seconds: n } as const;
  if (unit === "m") return { minutes: n } as const;
  if (unit === "h") return { hours: n } as const;
  if (unit === "d") return { days: n } as const;
  return { minutes: 15 } as const;
}
