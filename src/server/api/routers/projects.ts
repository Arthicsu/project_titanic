import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const projectsRouter = createTRPCRouter({
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
        responses: {
          select: {
            id: true,
            studentId: true,
            status: true,
            student: {
              select: {
                name: true,
                skills: true,
                biography: true,
              },
            },
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
})