import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  paginationQuery,
  vehicleIdParam,
  statusQuery,
} from "../../schemas/vehicle.schemas";
import * as c from "./vehicle.controller";

const r = Router();
r.use(requireAuth()); // semua butuh login

r.get("/", validate({ query: paginationQuery }), c.list);
r.get(
  "/:id/status",
  validate({ params: vehicleIdParam, query: statusQuery }),
  c.status
);

export default r;
