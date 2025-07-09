import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";

import { usersRouter } from "./routers/users";
import { projectsRouter } from "./routers/projects";
import { responsesRouter } from "./routers/responses";

export const appRouter = createTRPCRouter({
    user: usersRouter,
    project: projectsRouter,
    response: responsesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);