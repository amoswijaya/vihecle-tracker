import { Request, Response } from "express";
import { vehicleDailyReport } from "./report.service";

export const vehicleReport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query as any;

  const { filename, buffer } = await vehicleDailyReport(id as string, date);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
};
