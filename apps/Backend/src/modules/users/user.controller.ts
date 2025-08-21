import { Request, Response } from "express";
import * as svc from "./user.service";

export const list = async (_: Request, res: Response) =>
  res.json(await svc.listUsers());
export const create = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  res.status(201).json(await svc.createUser(email, password, role));
};
export const get = async (req: Request, res: Response) => {
  const u = await svc.getUser(req.params.id as string);
  if (!u) return res.status(404).json({ message: "Not found" });
  res.json(u);
};
export const update = async (req: Request, res: Response) => {
  const u = await svc.updateUser(req.params.id as string, req.body);
  res.json(u);
};
export const remove = async (req: Request, res: Response) => {
  await svc.deleteUser(req.params.id as string);
  res.status(204).send();
};
