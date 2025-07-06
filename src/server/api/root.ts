import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
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
        role: z.enum(["student", "company"]).optional(),
        sex: z.enum(["man", "woman"]).optional(),
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

  // людское 👐
  getProjects: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        budget: true,
        deadline: true,
        companyId: true,
        status: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });
  }),
  getProjectById: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const project = await ctx.db.project.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        title: true,
        category: true,
        budget: true,
        deadline: true,
        description: true,
        companyId: true,
        company: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
    return project;
  }),
  createProject: protectedProcedure
  .input(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      deadline: z.string().optional(),
      budget: z.number().optional(),
      category: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.project.create({
      data: {
        title: input.title,
        description: input.description,
        deadline: input.deadline ? new Date(input.deadline) : null,
        budget: input.budget,
        category: input.category,
        companyId: ctx.session.user.id,
      },
    });
  }),
  // спасибо за помощь, братан (помогите)
  responseToProject: protectedProcedure
  .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.response.create({
        data: {
          projectId: input.projectId,
          studentId: ctx.session.user.id,
          status: "pending",
        },
      });
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);