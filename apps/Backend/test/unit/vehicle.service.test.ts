import { test, expect, vi, beforeEach } from "vitest";

const hoisted = vi.hoisted(() => ({
  mockPrisma: {
    vehicle: { findMany: vi.fn(), count: vi.fn() },
    tripSegment: { findMany: vi.fn() },
  },
}));

vi.mock("../../src/db/client", () => ({ prisma: hoisted.mockPrisma }));
import * as svc from "../../src/modules/vehicles/vehicle.services";

beforeEach(() => vi.clearAllMocks());

test("listVehicles returns pagination meta & items", async () => {
  hoisted.mockPrisma.vehicle.findMany.mockResolvedValue([
    {
      id: "V1",
      name: "Truck A",
      plateNumber: "B 1234 AA",
      createdAt: new Date(),
    },
  ]);
  hoisted.mockPrisma.vehicle.count.mockResolvedValue(1);

  const out = await svc.listVehicles(1, 10);
  expect(out.page).toBe(1);
  expect(out.limit).toBe(10);
  expect(out.total).toBe(1);
  expect(out.items[0].id).toBe("V1");
});

test("statusByDate sums hours & distance", async () => {
  const base = new Date("2025-08-20T06:00:00.000Z");
  const oneHour = 3600000;
  hoisted.mockPrisma.tripSegment.findMany.mockResolvedValue([
    {
      status: "TRIP",
      startTime: base,
      endTime: new Date(+base + oneHour),
      distanceKm: 10,
    },
    {
      status: "IDLE",
      startTime: new Date(+base + oneHour),
      endTime: new Date(+base + 2 * oneHour),
      distanceKm: 0,
    },
  ]);

  const out = await svc.statusByDate("V1", "2025-08-20");
  expect(out.summary.TRIP).toBeCloseTo(1, 5);
  expect(out.summary.IDLE).toBeCloseTo(1, 5);
  expect(out.summary.STOPPED).toBeCloseTo(0, 5);
  expect(out.summary.distanceKm).toBe(10);
});
