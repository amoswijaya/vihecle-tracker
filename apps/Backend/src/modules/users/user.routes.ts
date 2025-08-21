import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  userIdParam,
} from "../../schemas/user.schemas";
import * as c from "./user.controller";

const r = Router();
r.use(requireAuth(["ADMIN"]));

r.get("/", c.list);
r.post("/", validate({ body: createUserSchema }), c.create);
r.get("/:id", validate({ params: userIdParam }), c.get);
r.put(
  "/:id",
  validate({ params: userIdParam, body: updateUserSchema }),
  c.update
);
r.delete("/:id", validate({ params: userIdParam }), c.remove);

export default r;
