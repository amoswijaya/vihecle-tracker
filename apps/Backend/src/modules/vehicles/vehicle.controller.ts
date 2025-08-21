import { Request, Response } from "express";
import * as svc from "./vehicle.services";

export const list = async (req: Request, res: Response) => {
  const page = Number((req.query as any).page) || 1;
  const limit = Number((req.query as any).limit) || 10;
  res.json(await svc.listVehicles(page, limit));
};

export const status = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query as any;
  res.json(await svc.statusByDate(id as string, date));
};
