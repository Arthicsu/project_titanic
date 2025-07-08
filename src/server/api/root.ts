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
        materials: true,
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
        materials: true,
        status: true,
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
      materials: z.array(z.string()).optional(),
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
      const userId = ctx.session.user.id;
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project || project.status != "open") {
        throw new Error("Проект не доступен для отклика");
      }
      const response = await ctx.db.response.create({
        data: {
          projectId: input.projectId,
          studentId: userId,
          status: "accepted",
        },
      });
      await ctx.db.project.update({
        where: { id: input.projectId },
        data: { status: "in_progress" },
      });
      return response;
    }),
  deleteProjectMaterial: protectedProcedure
  .input(z.object({ projectId: z.string(), fileUrl: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const project = await ctx.db.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) {
      throw new Error("Заказ не найден");
    }
    return ctx.db.project.update({
      where: { id: input.projectId },
      data: {
        materials: {
          set: project.materials.filter((url) => url != input.fileUrl),
        },
      },
    });
  }),
  getStudentResponses: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.response.findMany({
      where: { studentId: userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }),

  getCompanyProjects: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.project.findMany({
      where: { companyId: userId },
      include: {
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }),

  withdrawResponse: protectedProcedure
    .input(z.object({ responseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const response = await ctx.db.response.findUnique({
        where: { id: input.responseId },
        include: { project: true },
      });
      if (!response || response.studentId != userId) {
        throw new Error("Unauthorized");
      }
      if (response.status == "accepted" && response.project.status == "in_progress") {
        await ctx.db.project.update({
          where: { id: response.projectId },
          data: { status: "open" },
        });
      }
      return ctx.db.response.delete({
        where: { id: input.responseId },
      });
    }),

  submitWork: protectedProcedure
    .input(z.object({
      responseId: z.string(),
      materials: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.response.update({
        where: {
          id: input.responseId,
          studentId: userId,
          status: "accepted",
        },
        data: {
          materials: input.materials,
          status: "submitted",
        },
      });
    }),

  getStudentResponseForProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.response.findUnique({
        where: {
          projectId_studentId: {
            projectId: input.projectId,
            studentId: userId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });
    }),

  getAcceptedResponseForProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.response.findFirst({
        where: {
          projectId: input.projectId,
          status: "accepted",
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),
    deleteProject: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.project.delete({
      where: { id: input.projectId },
    });
    return { message: "Заказ удалён" };
  }),

updateProjectStatus: protectedProcedure
  .input(z.object({
    projectId: z.string(),
    status: z.enum(["open", "in_progress", "completed", "canceled"]),
  }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.project.update({
      where: { id: input.projectId },
      data: { status: input.status },
    });
  }),

acceptResponse: protectedProcedure
  .input(z.object({ responseId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.response.update({
      where: { id: input.responseId },
      data: { status: "accepted" },
    });
  }),

rejectResponse: protectedProcedure
  .input(z.object({ responseId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    return ctx.db.response.update({
      where: { id: input.responseId },
      data: { status: "rejected" },
    });
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);