import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function requireAuth(roles?: Array<"ADMIN" | "USER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      const cookieToken = req.cookies?.accessToken;
      const token = header?.startsWith("Bearer ")
        ? header.slice(7)
        : cookieToken;
      if (!token) return res.status(401).json({ message: "Unauthorized" });
      const payload = verifyAccessToken(token);
      (req as any).user = payload;
      if (roles && !roles.includes(payload.role))
        return res.status(403).json({ message: "Forbidden" });
      next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
