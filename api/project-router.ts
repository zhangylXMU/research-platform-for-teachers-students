import { z } from "zod";
import { eq, and, count, desc } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, teacherQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects, projectApplications, projectMembers, users } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const projectRouter = createRouter({
  create: teacherQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        requirements: z.string().optional(),
        researchField: z.string().min(1),
        maxStudents: z.number().min(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(projects).values({
        teacherId: ctx.user.id,
        title: input.title,
        description: input.description,
        requirements: input.requirements,
        researchField: input.researchField,
        maxStudents: input.maxStudents,
      });
      return { id: Number(result[0].insertId), ...input, teacherId: ctx.user.id };
    }),

  list: publicQuery
    .input(
      z.object({
        status: z.enum(["recruiting", "in_progress", "completed", "closed"]).optional(),
        field: z.string().optional(),
        teacherId: z.number().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      let conditions = [];
      if (input?.status) conditions.push(eq(projects.status, input.status));
      if (input?.field) conditions.push(eq(projects.researchField, input.field));
      if (input?.teacherId) conditions.push(eq(projects.teacherId, input.teacherId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select({
          project: projects,
          teacher: users,
        })
        .from(projects)
        .leftJoin(users, eq(projects.teacherId, users.id))
        .where(where)
        .orderBy(desc(projects.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = where
        ? await db.select({ count: count() }).from(projects).where(where)
        : await db.select({ count: count() }).from(projects);

      return {
        projects: rows.map((r) => ({
          ...r.project,
          teacher: r.teacher,
        })),
        total: totalResult[0]?.count ?? 0,
      };
    }),

  myProjects: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.teacherId, ctx.user.id))
      .orderBy(desc(projects.createdAt));
    return rows;
  }),

  detail: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (!project[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      const teacher = await db
        .select()
        .from(users)
        .where(eq(users.id, project[0].teacherId))
        .limit(1);

      const applications = await db
        .select({
          application: projectApplications,
          student: users,
        })
        .from(projectApplications)
        .leftJoin(users, eq(projectApplications.studentId, users.id))
        .where(eq(projectApplications.projectId, input.id));

      const members = await db
        .select({
          member: projectMembers,
          student: users,
        })
        .from(projectMembers)
        .leftJoin(users, eq(projectMembers.studentId, users.id))
        .where(eq(projectMembers.projectId, input.id));

      return {
        ...project[0],
        teacher: teacher[0] ?? null,
        applications: applications.map((a) => ({ ...a.application, student: a.student })),
        members: members.map((m) => ({ ...m.member, student: m.student })),
      };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        status: z.enum(["recruiting", "in_progress", "completed", "closed"]).optional(),
        maxStudents: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      const existing = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      if (existing[0].teacherId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      await db.update(projects).set(updateData).where(eq(projects.id, id));
      const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return updated[0];
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      if (existing[0].teacherId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your project" });
      }

      await db.delete(projects).where(eq(projects.id, input.id));
      return true;
    }),
});
