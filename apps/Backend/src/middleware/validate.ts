import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: {
    body?: AnyZodObject;
    params?: AnyZodObject;
    query?: AnyZodObject;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.params) req.params = schema.params.parse(req.params);
      if (schema.query) req.query = schema.query.parse(req.query);
      next();
    } catch (e) {
      if (e instanceof ZodError)
        return res.status(400).json({ errors: e.flatten() });
      next(e);
    }
  };
