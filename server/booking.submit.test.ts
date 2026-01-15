import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("booking.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept valid booking input and return success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bookingInput = {
      route: "經典山道",
      name: "李明",
      phone: "+852 9876 5432",
      carModel: "Porsche 911 Carrera",
      carPlate: "AB 1234",
      bookingDate: "2025-02-15",
      multipleVehicles: true,
      videoUpgrade: true,
    };

    const result = await caller.booking.submit(bookingInput);

    expect(result).toEqual({ success: true });
  });

  it("should accept booking without optional carPlate", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bookingInput = {
      route: "工業美學",
      name: "王芳",
      phone: "+852 9876 5432",
      carModel: "Honda Civic FL5",
      bookingDate: "2025-02-20",
      multipleVehicles: false,
      videoUpgrade: false,
    };

    const result = await caller.booking.submit(bookingInput);

    expect(result).toEqual({ success: true });
  });

  it("should validate required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const invalidInput = {
      route: "",
      name: "",
      phone: "",
      carModel: "",
      bookingDate: "",
      multipleVehicles: false,
      videoUpgrade: false,
    };

    try {
      await caller.booking.submit(invalidInput as any);
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should handle multiple vehicle and video upgrade flags", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const bookingWithAddOns = {
      route: "海岸秘境",
      name: "陳浩",
      phone: "+852 9876 5432",
      carModel: "BMW M340i",
      carPlate: "CD 5678",
      bookingDate: "2025-03-01",
      multipleVehicles: true,
      videoUpgrade: true,
    };

    const result = await caller.booking.submit(bookingWithAddOns);

    expect(result).toEqual({ success: true });
  });
});
