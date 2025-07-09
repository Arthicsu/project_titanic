import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";


export const responsesRouter = createTRPCRouter({
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
    // ларилли ларила (бред)
    acceptResponse: protectedProcedure
      .input(z.object({ responseId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const response = await ctx.db.response.findUnique({
          where: { id: input.responseId },
          include: { project: true },
        });
        await ctx.db.response.updateMany({
          where: {
            projectId: response.projectId,
            id: { not: input.responseId },
            status: "pending",
          },
          data: { status: "rejected" },
        });
        await ctx.db.project.update({
          where: { id: response.projectId },
          data: { status: "in_progress" },
        });
        return ctx.db.response.update({
          where: { id: input.responseId },
          data: { status: "accepted" },
        });
      }),
    rejectResponse: protectedProcedure
      .input(z.object({ responseId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const response = await ctx.db.response.findUnique({
          where: { id: input.responseId },
          include: { project: true },
        });
        if (!response || response.project.companyId != ctx.session.user.id) {
          throw new Error("Unauthorized");
        }
        return ctx.db.response.update({
          where: { id: input.responseId },
          data: { status: "rejected" },
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
      if (!project || project.status !== "open") {
        throw new Error("Проект не доступен для отклика");
      }
      return ctx.db.response.create({
        data: {
          projectId: input.projectId,
          studentId: userId,
          status: "pending",
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
})