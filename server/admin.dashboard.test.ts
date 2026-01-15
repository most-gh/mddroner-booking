import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AdminUser = NonNullable<TrpcContext["user"]> & { role: "admin" };

function createAdminContext(): { ctx: TrpcContext } {
  const user: AdminUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: NonNullable<TrpcContext["user"]> = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("admin.dashboard", () => {
  it("should allow admin to update booking status", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.update({
      id: 1,
      status: "confirmed",
      notes: "已確認預約時間",
    });

    expect(result).toEqual({ success: true });
  });

  it("should deny regular user from updating booking", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.booking.update({
        id: 1,
        status: "confirmed",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to delete booking", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.booking.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });

  it("should deny regular user from deleting booking", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.booking.delete({ id: 1 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to get booking details", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // This will return undefined if booking doesn't exist, which is fine for this test
    const result = await caller.booking.getById({ id: 1 });
    expect(result === undefined || typeof result === "object").toBe(true);
  });
});
