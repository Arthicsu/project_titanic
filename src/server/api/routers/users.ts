import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
    getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.user.findUnique({
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
        role: z.enum(["student", "company"]).optional(),
        sex: z.enum(["man", "woman"]).optional(),
        biography: z.string().optional(),
        skills: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.user.update({
        where: { id: userId },
        data: input,
      });
    }),
  // ну и тут людское 👐
  getUserProfileById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const user = await ctx.db.user.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            biography: true,
            skills: true,
            image: true,
          },
        });
        return user;
      }),
  getUserPortfolio: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.portfolio.findMany({
        where: { studentId: input.userId },
        select: {
          id: true,
          title: true,
          description: true,
          link: true,
          createdAt: true,
        },
      });
    }),
})