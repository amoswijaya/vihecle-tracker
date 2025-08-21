import { Request, Response } from "express";
import {
  login as doLogin,
  refresh as doRefresh,
  logout as doLogout,
} from "./auth.service";
import { verifyRefreshToken } from "../../utils/jwt";
import { env } from "../../congfig/env";

const cookieOpts = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax" as const,
  domain: env.COOKIE_DOMAIN,
  maxAge: maxAgeMs,
  path: "/",
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await doLogin(email, password);
  setCookies(res, accessToken, refreshToken);
  res.json({ user });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "Missing refresh token" });

  const payload = verifyRefreshToken(refreshToken);
  const out = await doRefresh(payload.sub, refreshToken);
  setCookies(res, out.accessToken, out.refreshToken);
  res.json({ ok: true });
};

export const logout = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  await doLogout(req.user.sub);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ ok: true });
};

function setCookies(res: Response, access: string, refresh: string) {
  const ms = (str: string) => {
    const m = str.match(/^(\d+)([smhd])$/)!;
    const n = Number(m[1]);
    return (
      { s: 1000, m: 60000, h: 3600000, d: 86400000 }[
        m[2] as "s" | "m" | "h" | "d"
      ] * n
    );
  };
  res.cookie(
    "accessToken",
    access,
    cookieOpts(ms(process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"))
  );
  res.cookie(
    "refreshToken",
    refresh,
    cookieOpts(ms(process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"))
  );
}
