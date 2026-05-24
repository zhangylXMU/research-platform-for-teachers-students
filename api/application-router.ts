import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createRouter, authedQuery, teacherQuery, studentQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projectApplications, projectMembers, projects, users } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const applicationRouter = createRouter({
  apply: studentQuery
    .input(
      z.object({
        projectId: z.number(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check if already applied
      const existing = await db
        .select()
        .from(projectApplications)
        .where(
          and(
            eq(projectApplications.projectId, input.projectId),
            eq(projectApplications.studentId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing[0]) {
        throw new TRPCError({ code: "CONFLICT", message: "Already applied to this project" });
      }

      const result = await db.insert(projectApplications).values({
        projectId: input.projectId,
        studentId: ctx.user.id,
        message: input.message,
      });

      return { id: Number(result[0].insertId), ...input, status: "pending" as const };
    }),

  listForProject: teacherQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Verify teacher owns this project
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project[0] || (project[0].teacherId !== ctx.user.id && ctx.user.role !== "admin")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      const rows = await db
        .select({
          application: projectApplications,
          student: users,
        })
        .from(projectApplications)
        .leftJoin(users, eq(projectApplications.studentId, users.id))
        .where(eq(projectApplications.projectId, input.projectId))
        .orderBy(desc(projectApplications.createdAt));

      return rows.map((r) => ({
        ...r.application,
        student: r.student,
      }));
    }),

  myApplications: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select({
        application: projectApplications,
        project: projects,
      })
      .from(projectApplications)
      .leftJoin(projects, eq(projectApplications.projectId, projects.id))
      .where(eq(projectApplications.studentId, ctx.user.id))
      .orderBy(desc(projectApplications.createdAt));

    return rows.map((r) => ({
      ...r.application,
      project: r.project,
    }));
  }),

  review: teacherQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["accepted", "rejected"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const app = await db
        .select()
        .from(projectApplications)
        .where(eq(projectApplications.id, input.id))
        .limit(1);

      if (!app[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });

      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, app[0].projectId))
        .limit(1);

      if (!project[0] || (project[0].teacherId !== ctx.user.id && ctx.user.role !== "admin")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      await db.update(projectApplications)
        .set({ status: input.status })
        .where(eq(projectApplications.id, input.id));

      // If accepted, add to project members and update project status
      if (input.status === "accepted") {
        await db.insert(projectMembers).values({
          projectId: app[0].projectId,
          studentId: app[0].studentId,
        });

        // Update project status to in_progress
        await db.update(projects)
          .set({ status: "in_progress" })
          .where(eq(projects.id, app[0].projectId));
      }

      return { ...app[0], status: input.status };
    }),
});
