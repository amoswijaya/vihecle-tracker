import { Router } from "express";
import { login, refresh, logout } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema } from "../../schemas/auth.schemas";
import { requireAuth } from "../../middleware/auth";

const r = Router();

r.post("/login", validate({ body: loginSchema }), login);
r.post("/refresh", refresh);
r.post("/logout", requireAuth(), logout);

export default r;
