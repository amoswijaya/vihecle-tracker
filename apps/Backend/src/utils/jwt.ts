// src/utils/jwt.ts
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { env } from "../congfig/env";

export type JwtPayload = { sub: string; role: "ADMIN" | "USER" };

const accessSecret: Secret = env.JWT_ACCESS_SECRET; // <- penting: cast ke Secret
const refreshSecret: Secret = env.JWT_REFRESH_SECRET;

export function signAccessToken(payload: JwtPayload) {
  const opts: SignOptions = { expiresIn: 15 }; // '15m' atau number
  return jwt.sign(payload, accessSecret, opts);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessSecret) as JwtPayload & {
    iat: number;
    exp: number;
  };
}

export function signRefreshToken(payload: JwtPayload) {
  const opts: SignOptions = { expiresIn: 7 }; // '7d'
  return jwt.sign(payload, refreshSecret, opts);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret) as JwtPayload & {
    iat: number;
    exp: number;
  };
}
