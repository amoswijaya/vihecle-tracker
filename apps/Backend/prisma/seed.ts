import { PrismaClient, Role, SegmentStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/password";
import { addMinutes, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: await hashPassword("Admin123!"),
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: await hashPassword("User123!"),
      role: Role.USER,
    },
  });

  // Vehicles
  const v1 = await prisma.vehicle.create({
    data: { name: "Truck Alpha", plateNumber: "B 1234 AA" },
  });
  const v2 = await prisma.vehicle.create({
    data: { name: "Van Beta", plateNumber: "B 5678 BB" },
  });

  // Segments dummy (3 hari ke belakang)
  const vehicles = [v1, v2];
  for (const v of vehicles) {
    for (let d = 1; d <= 3; d++) {
      const base = subDays(new Date(), d);
      let t = new Date(base.setHours(6, 0, 0, 0));
      for (let i = 0; i < 8; i++) {
        const status =
          i % 3 === 0
            ? SegmentStatus.TRIP
            : i % 3 === 1
            ? SegmentStatus.IDLE
            : SegmentStatus.STOPPED;
        const end = addMinutes(t, 60);
        await prisma.tripSegment.create({
          data: {
            vehicleId: v.id,
            status,
            startTime: t,
            endTime: end,
            distanceKm:
              status === SegmentStatus.TRIP
                ? Math.round(Math.random() * 20)
                : 0,
          },
        });
        t = end;
      }
    }
  }

  console.log({
    admin: admin.email,
    user: user.email,
    vehicles: vehicles.length,
  });
}

main().finally(async () => prisma.$disconnect());
