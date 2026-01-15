import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createBooking, getBookings } from "./db";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";

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
            multipleVehicles: input.multipleVehicles ? 1 : 0,
            videoUpgrade: input.videoUpgrade ? 1 : 0,
          });

          const emailContent = `新的預約申請

• 地點: ${input.route}
• 姓名: ${input.name}
• 聯絡電話: ${input.phone}
• 車型: ${input.carModel}
• 車牌: ${input.carPlate || "未提供"}
• 預期拍攝日期: ${input.bookingDate}
• 多台車: ${input.multipleVehicles ? "是" : "否"}
• 動態影片: ${input.videoUpgrade ? "是" : "否"}
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
  }),
});

export type AppRouter = typeof appRouter;
