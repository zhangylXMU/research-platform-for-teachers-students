import { z } from "zod";
import { eq, count, sql } from "drizzle-orm";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, teacherProfiles, studentProfiles } from "@db/schema";

export const userRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    return user[0] ?? null;
  }),

  profile: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user[0]) return null;

      let profile = null;
      if (user[0].role === "teacher") {
        const tp = await db
          .select()
          .from(teacherProfiles)
          .where(eq(teacherProfiles.userId, input.userId))
          .limit(1);
        profile = tp[0] ?? null;
      } else if (user[0].role === "student") {
        const sp = await db
          .select()
          .from(studentProfiles)
          .where(eq(studentProfiles.userId, input.userId))
          .limit(1);
        profile = sp[0] ?? null;
      }

      return { user: user[0], profile };
    }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
        bio: z.string().optional(),
        institution: z.string().optional(),
        title: z.string().optional(),
        researchFields: z.array(z.string()).optional(),
        gradeLevel: z.enum(["middle", "high", "undergraduate", "master", "phd"]).optional(),
        school: z.string().optional(),
        major: z.string().optional(),
        researchInterests: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Update user
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.avatar !== undefined) updateData.avatar = input.avatar;

      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
      }

      // Update profile
      if (ctx.user.role === "teacher") {
        const tpUpdate: Record<string, unknown> = {};
        if (input.bio !== undefined) tpUpdate.bio = input.bio;
        if (input.institution !== undefined) tpUpdate.institution = input.institution;
        if (input.title !== undefined) tpUpdate.title = input.title;
        if (input.researchFields !== undefined) tpUpdate.researchFields = input.researchFields;

        if (Object.keys(tpUpdate).length > 0) {
          await db.update(teacherProfiles)
            .set(tpUpdate)
            .where(eq(teacherProfiles.userId, ctx.user.id));
        }
      } else if (ctx.user.role === "student") {
        const spUpdate: Record<string, unknown> = {};
        if (input.gradeLevel !== undefined) spUpdate.gradeLevel = input.gradeLevel;
        if (input.school !== undefined) spUpdate.school = input.school;
        if (input.major !== undefined) spUpdate.major = input.major;
        if (input.researchInterests !== undefined) spUpdate.researchInterests = input.researchInterests;

        if (Object.keys(spUpdate).length > 0) {
          await db.update(studentProfiles)
            .set(spUpdate)
            .where(eq(studentProfiles.userId, ctx.user.id));
        }
      }

      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      return updated[0];
    }),

  list: adminQuery
    .input(
      z.object({
        role: z.enum(["student", "teacher", "admin"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      let query = db.select().from(users);
      if (input?.role) {
        query = query.where(eq(users.role, input.role)) as typeof query;
      }

      const rows = await query.limit(limit).offset(offset);

      const totalResult = await db
        .select({ count: count() })
        .from(users);

      return { users: rows, total: totalResult[0]?.count ?? 0 };
    }),

  updateStorage: adminQuery
    .input(z.object({ userId: z.number(), quotaDelta: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ storageQuota: sql`storageQuota + ${input.quotaDelta}` })
        .where(eq(users.id, input.userId));

      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      return updated[0];
    }),
});
