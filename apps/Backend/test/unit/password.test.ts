import { test, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password";

test("hash & verify password", async () => {
  const hash = await hashPassword("Secret123!");
  expect(hash).toBeTruthy();
  expect(await verifyPassword("Secret123!", hash)).toBe(true);
  expect(await verifyPassword("wrong", hash)).toBe(false);
});
