import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { storageUsages, users } from "@db/schema";
import { TRPCError } from "@trpc/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = "/mnt/agents/output/app/uploads";

export const storageRouter = createRouter({
  upload: authedQuery
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check quota
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user[0]) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (user[0].storageUsed + input.fileSize > user[0].storageQuota) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Storage quota exceeded",
        });
      }

      // Save file
      await mkdir(UPLOAD_DIR, { recursive: true });
      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      const uniqueName = `${Date.now()}_${input.fileName}`;
      const filePath = join(UPLOAD_DIR, uniqueName);
      await writeFile(filePath, fileBuffer);

      const fileUrl = `/uploads/${uniqueName}`;

      // Record in DB
      await db.insert(storageUsages).values({
        userId: ctx.user.id,
        fileName: input.fileName,
        fileUrl,
        fileSize: input.fileSize,
      });

      // Update user storage
      await db.update(users)
        .set({ storageUsed: user[0].storageUsed + input.fileSize })
        .where(eq(users.id, ctx.user.id));

      return { url: fileUrl, size: input.fileSize };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(storageUsages)
      .where(eq(storageUsages.userId, ctx.user.id))
      .orderBy(desc(storageUsages.createdAt));
    return rows;
  }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const file = await db
        .select()
        .from(storageUsages)
        .where(eq(storageUsages.id, input.id))
        .limit(1);

      if (!file[0]) throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      if (file[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your file" });
      }

      // Update user storage
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, file[0].userId))
        .limit(1);

      if (user[0]) {
        await db.update(users)
          .set({ storageUsed: Math.max(0, user[0].storageUsed - file[0].fileSize) })
          .where(eq(users.id, file[0].userId));
      }

      await db.delete(storageUsages).where(eq(storageUsages.id, input.id));
      return true;
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user[0]) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    const used = user[0].storageUsed;
    const quota = user[0].storageQuota;
    const percent = Math.round((used / quota) * 100);

    return { used, quota, percent };
  }),
});
