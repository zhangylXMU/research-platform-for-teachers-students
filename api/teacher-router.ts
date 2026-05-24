import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, teacherQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, teacherProfiles } from "@db/schema";

export const teacherRouter = createRouter({
  submitVerification: teacherQuery
    .input(
      z.object({
        institution: z.string().min(1),
        title: z.string().min(1),
        researchFields: z.array(z.string()),
        bio: z.string().optional(),
        verificationDoc: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check if profile exists
      const existing = await db
        .select()
        .from(teacherProfiles)
        .where(eq(teacherProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing[0]) {
        await db.update(teacherProfiles)
          .set({
            institution: input.institution,
            title: input.title,
            researchFields: input.researchFields,
            bio: input.bio ?? existing[0].bio,
            verificationDoc: input.verificationDoc ?? existing[0].verificationDoc,
            verificationStatus: "pending",
          })
          .where(eq(teacherProfiles.userId, ctx.user.id));
      } else {
        await db.insert(teacherProfiles).values({
          userId: ctx.user.id,
          institution: input.institution,
          title: input.title,
          researchFields: input.researchFields,
          bio: input.bio,
          verificationDoc: input.verificationDoc,
        });
      }

      const updated = await db
        .select()
        .from(teacherProfiles)
        .where(eq(teacherProfiles.userId, ctx.user.id))
        .limit(1);

      return updated[0];
    }),

  list: publicQuery
    .input(
      z.object({
        verified: z.boolean().optional(),
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

      const rows = await db
        .select({
          teacherProfile: teacherProfiles,
          user: users,
        })
        .from(teacherProfiles)
        .leftJoin(users, eq(teacherProfiles.userId, users.id))
        .orderBy(desc(teacherProfiles.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        teachers: rows.map((r) => ({
          ...r.teacherProfile,
          user: r.user,
        })),
        total: rows.length,
      };
    }),

  myProfile: teacherQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.userId, ctx.user.id))
      .limit(1);
    return rows[0] ?? null;
  }),

  verify: adminQuery
    .input(
      z.object({
        teacherProfileId: z.number(),
        status: z.enum(["verified", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(teacherProfiles)
        .set({ verificationStatus: input.status })
        .where(eq(teacherProfiles.id, input.teacherProfileId));

      const updated = await db
        .select()
        .from(teacherProfiles)
        .where(eq(teacherProfiles.id, input.teacherProfileId))
        .limit(1);

      return updated[0];
    }),
});
