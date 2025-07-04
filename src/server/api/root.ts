import { createCallerFactory, createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";

export const appRouter = createTRPCRouter({
    getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        birthday: true,
        sex: true,
        biography: true,
        skills: true,
        email: true,
        role: true,
      },
    });
  }),

  updateUserProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        birthday: z.date().optional(),
        sex: z.enum(["man", "woman", "other"]).optional(),
        biography: z.string().optional(),
        skills: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return db.user.update({
        where: { id: userId },
        data: input,
      });
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);