import { prisma } from "../../db/client";
import { startOfDay, endOfDay } from "date-fns";

export async function listVehicles(page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, plateNumber: true, createdAt: true },
    }),
    prisma.vehicle.count(),
  ]);
  return { items, total, page, limit };
}

export async function statusByDate(vehicleId: string, date: string) {
  const day = new Date(date + "T00:00:00Z"); // assume UTC date from FE
  const segments = await prisma.tripSegment.findMany({
    where: {
      vehicleId,
      startTime: { gte: startOfDay(day) },
      endTime: { lte: endOfDay(day) },
    },
    orderBy: { startTime: "asc" },
  });

  const sum = { TRIP: 0, IDLE: 0, STOPPED: 0, distanceKm: 0 };
  for (const s of segments) {
    const ms = +s.endTime - +s.startTime;
    const hours = ms / 3600000;
    sum[s.status] += hours;
    if (s.distanceKm) sum.distanceKm += s.distanceKm;
  }
  return { date, segments, summary: sum };
}
