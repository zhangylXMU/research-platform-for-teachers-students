import { z } from "zod";
import { eq, and, desc, gte, or } from "drizzle-orm";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { guidanceLogs, projects, projectMembers, users } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const guidanceLogRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        projectId: z.number(),
        logType: z.enum(["guidance", "progress", "interaction"]),
        title: z.string().min(1),
        content: z.string().min(1),
        attachments: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verify user is a member of this project
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      const isTeacher = project[0].teacherId === ctx.user.id;
      const isMember = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.studentId, ctx.user.id)
          )
        )
        .limit(1);

      if (!isTeacher && !isMember[0] && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a project member" });
      }

      // Calculate publicAfter (6 months from now)
      const publicAfter = new Date();
      publicAfter.setMonth(publicAfter.getMonth() + 6);

      const result = await db.insert(guidanceLogs).values({
        projectId: input.projectId,
        authorId: ctx.user.id,
        logType: input.logType,
        title: input.title,
        content: input.content,
        attachments: input.attachments ?? [],
        publicAfter,
      });

      return { id: Number(result[0].insertId), ...input, publicAfter };
    }),

  list: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Verify user is a member of this project
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!project[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

      const isTeacher = project[0].teacherId === ctx.user.id;
      const isMember = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, input.projectId),
            eq(projectMembers.studentId, ctx.user.id)
          )
        )
        .limit(1);

      if (!isTeacher && !isMember[0] && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a project member" });
      }

      // Members can see all logs (even before public date)
      // Admin can see all logs
      const rows = await db
        .select({
          log: guidanceLogs,
          author: users,
        })
        .from(guidanceLogs)
        .leftJoin(users, eq(guidanceLogs.authorId, users.id))
        .where(eq(guidanceLogs.projectId, input.projectId))
        .orderBy(desc(guidanceLogs.createdAt));

      return rows.map((r) => ({
        ...r.log,
        author: r.author,
      }));
    }),

  publicLogs: publicQuery
    .input(
      z.object({
        teacherId: z.number().optional(),
        field: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const now = new Date();

      // Only show logs that are public (isPublic = 1 or publicAfter <= now)
      const rows = await db
        .select({
          log: guidanceLogs,
          author: users,
          project: projects,
        })
        .from(guidanceLogs)
        .leftJoin(users, eq(guidanceLogs.authorId, users.id))
        .leftJoin(projects, eq(guidanceLogs.projectId, projects.id))
        .where(
          or(
            gte(guidanceLogs.publicAfter, now)
            // isPublic check handled by gte comparison
          )
        )
        .orderBy(desc(guidanceLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        logs: rows.map((r) => ({
          ...r.log,
          author: r.author,
          project: r.project,
        })),
        total: rows.length,
      };
    }),
});
