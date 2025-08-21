declare namespace Express {
  interface Request {
    user?: { sub: string; role: "ADMIN" | "USER" };
  }
}
