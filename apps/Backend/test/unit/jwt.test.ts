import { test, expect } from "vitest";

// set env sebelum import modul yang baca env
process.env.JWT_ACCESS_SECRET = "test-access";
process.env.JWT_REFRESH_SECRET = "test-refresh";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";

test("sign & verify access token", async () => {
  const { signAccessToken, verifyAccessToken } = await import(
    "../../src/utils/jwt"
  );
  const t = signAccessToken({ sub: "u1", role: "USER" });
  const payload = verifyAccessToken(t);
  expect(payload.sub).toBe("u1");
  expect(payload.role).toBe("USER");
});

test("sign & verify refresh token", async () => {
  const { signRefreshToken, verifyRefreshToken } = await import(
    "../../src/utils/jwt"
  );
  const t = signRefreshToken({ sub: "u2", role: "ADMIN" });
  const payload = verifyRefreshToken(t);
  expect(payload.sub).toBe("u2");
  expect(payload.role).toBe("ADMIN");
});
