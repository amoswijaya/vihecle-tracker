import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { vehicleIdParam, statusQuery } from "../../schemas/vehicle.schemas";
import { vehicleReport } from "./report.controller";

const r = Router();
r.use(requireAuth());

r.get(
  "/vehicles/:id",
  validate({ params: vehicleIdParam, query: statusQuery }),
  vehicleReport
);

export default r;
