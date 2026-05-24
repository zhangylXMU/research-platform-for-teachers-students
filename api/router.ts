import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { userRouter } from "./user-router";
import { teacherRouter } from "./teacher-router";
import { projectRouter } from "./project-router";
import { applicationRouter } from "./application-router";
import { guidanceLogRouter } from "./guidance-log-router";
import { storageRouter } from "./storage-router";
import { orderRouter } from "./order-router";
import { dashboardRouter } from "./dashboard-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  user: userRouter,
  teacher: teacherRouter,
  project: projectRouter,
  application: applicationRouter,
  guidanceLog: guidanceLogRouter,
  storage: storageRouter,
  order: orderRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
