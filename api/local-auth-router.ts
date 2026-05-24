import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as cookie from "cookie";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, teacherProfiles, studentProfiles } from "@db/schema";
import { signLocalToken, getLocalAuthCookieName } from "./local-auth-utils";
import { TRPCError } from "@trpc/server";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        username: z.string().min(3).max(50),
        password: z.string().min(6).max(100),
        role: z.enum(["student", "teacher"]).default("student"),
        institution: z.string().optional(),
        title: z.string().optional(),
        gradeLevel: z.enum(["middle", "high", "undergraduate", "master", "phd"]).optional(),
        school: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Check if username exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      // Insert user
      const result = await db.insert(users).values({
        name: input.name,
        username: input.username,
        passwordHash,
        role: input.role,
        authType: "local",
        status: "active",
      });

      const userId = Number(result[0].insertId);

      // Create profile
      if (input.role === "teacher") {
        await db.insert(teacherProfiles).values({
          userId,
          institution: input.institution ?? "",
          title: input.title ?? "",
          researchFields: [],
          verificationStatus: "pending",
        });
      } else {
        await db.insert(studentProfiles).values({
          userId,
          gradeLevel: input.gradeLevel ?? "undergraduate",
          school: input.school ?? "",
        });
      }

      const token = await signLocalToken(userId);

      // Set cookie
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(getLocalAuthCookieName(), token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
        })
      );

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      return { token, user: user[0] };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const rows = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      const user = rows[0];
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = await signLocalToken(user.id);

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(getLocalAuthCookieName(), token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
        })
      );

      return { token, user };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    // Check local auth cookie
    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    const token = cookies[getLocalAuthCookieName()];
    if (!token) return null;

    const { verifyLocalToken } = await import("./local-auth-utils");
    const claim = await verifyLocalToken(token);
    if (!claim) return null;

    const db = getDb();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, claim.userId))
      .limit(1);

    return rows[0] ?? null;
  }),
});
