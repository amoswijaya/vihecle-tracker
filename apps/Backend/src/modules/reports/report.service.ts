import ExcelJS from "exceljs";
import { statusByDate } from "../vehicles/vehicle.services";
import { prisma } from "../../db/client";

export async function vehicleDailyReport(vehicleId: string, date: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw { status: 404, message: "Vehicle not found" };

  const data = await statusByDate(vehicleId, date);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Daily Report");

  ws.addRow(["Vehicle", vehicle.name]);
  ws.addRow(["Plate", vehicle.plateNumber]);
  ws.addRow(["Date", date]);
  ws.addRow([]);
  ws.addRow(["Status", "Start", "End", "Hours", "Distance (km)"]);

  for (const s of data.segments) {
    const hours = (+s.endTime - +s.startTime) / 3600000;
    ws.addRow([s.status, s.startTime, s.endTime, hours, s.distanceKm || 0]);
  }

  ws.addRow([]);
  ws.addRow(["Summary", "", "", ""]);
  ws.addRow(["TRIP (h)", data.summary.TRIP]);
  ws.addRow(["IDLE (h)", data.summary.IDLE]);
  ws.addRow(["STOPPED (h)", data.summary.STOPPED]);
  ws.addRow(["Distance (km)", data.summary.distanceKm]);

  const buf = await wb.xlsx.writeBuffer();
  return {
    filename: `vehicle-${vehicle.plateNumber}-${date}.xlsx`,
    buffer: Buffer.from(buf),
  };
}
