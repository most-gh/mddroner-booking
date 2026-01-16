import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { createBooking, getBookings, getBookingById, updateBooking, deleteBooking } from "./db";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  booking: router({
    submit: publicProcedure
      .input(
        z.object({
          route: z.string(),
          name: z.string(),
          phone: z.string(),
          carModel: z.string(),
          carPlate: z.string().optional(),
          bookingDate: z.string(),
          specialRequests: z.string().optional(),
          multipleVehicles: z.boolean(),
          videoUpgrade: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createBooking({
            route: input.route,
            name: input.name,
            phone: input.phone,
            carModel: input.carModel,
            carPlate: input.carPlate || null,
            bookingDate: input.bookingDate,
            specialRequests: input.specialRequests || null,
            multipleVehicles: input.multipleVehicles ? 1 : 0,
            videoUpgrade: input.videoUpgrade ? 1 : 0,
          });

          const emailContent = `新的預約申請

• 地點: ${input.route}
• 姓名: ${input.name}
• 联絡電話: ${input.phone}
• 車型: ${input.carModel}
• 車牌: ${input.carPlate || "未提供"}
• 預期拍攝日期: ${input.bookingDate}
• 多台車: ${input.multipleVehicles ? "是" : "否"}
• 動態影片: ${input.videoUpgrade ? "是" : "否"}
${input.specialRequests ? `• 特別要求: ${input.specialRequests}` : ""}
• 提交時間: ${new Date().toLocaleString("zh-HK")}`;

          await notifyOwner({
            title: "新的 MDDroner 預約申請",
            content: emailContent,
          });

          return { success: true };
        } catch (error) {
          console.error("Failed to submit booking:", error);
          throw error;
        }
      }),
    list: publicProcedure.query(async () => {
      return await getBookings();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await getBookingById(input.id);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await updateBooking(input.id, {
          status: input.status,
          notes: input.notes,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await deleteBooking(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
