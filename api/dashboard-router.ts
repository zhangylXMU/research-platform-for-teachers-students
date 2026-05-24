import { eq, count, desc } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, teacherProfiles, projects, guidanceLogs } from "@db/schema";

export const dashboardRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();

    const totalUsers = await db.select({ count: count() }).from(users);
    const totalTeachers = await db
      .select({ count: count() })
      .from(teacherProfiles);
    const pendingVerifications = await db
      .select({ count: count() })
      .from(teacherProfiles)
      .where(eq(teacherProfiles.verificationStatus, "pending"));
    const totalProjects = await db.select({ count: count() }).from(projects);
    const totalLogs = await db.select({ count: count() }).from(guidanceLogs);

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      totalTeachers: totalTeachers[0]?.count ?? 0,
      pendingVerifications: pendingVerifications[0]?.count ?? 0,
      totalProjects: totalProjects[0]?.count ?? 0,
      totalLogs: totalLogs[0]?.count ?? 0,
    };
  }),

  recentVerifications: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(teacherProfiles)
      .orderBy(desc(teacherProfiles.createdAt))
      .limit(10);
    return rows;
  }),

  recentProjects: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(10);
    return rows;
  }),
});
