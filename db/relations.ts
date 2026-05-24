import { relations } from "drizzle-orm";
import {
  users,
  teacherProfiles,
  studentProfiles,
  projects,
  projectApplications,
  projectMembers,
  guidanceLogs,
  storageUsages,
  orders,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  projects: many(projects),
  applications: many(projectApplications),
  guidanceLogs: many(guidanceLogs),
  storageUsages: many(storageUsages),
  orders: many(orders),
}));

export const teacherProfilesRelations = relations(teacherProfiles, ({ one }) => ({
  user: one(users, {
    fields: [teacherProfiles.userId],
    references: [users.id],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  teacher: one(users, {
    fields: [projects.teacherId],
    references: [users.id],
  }),
  applications: many(projectApplications),
  members: many(projectMembers),
  guidanceLogs: many(guidanceLogs),
}));

export const projectApplicationsRelations = relations(projectApplications, ({ one }) => ({
  project: one(projects, {
    fields: [projectApplications.projectId],
    references: [projects.id],
  }),
  student: one(users, {
    fields: [projectApplications.studentId],
    references: [users.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  student: one(users, {
    fields: [projectMembers.studentId],
    references: [users.id],
  }),
}));

export const guidanceLogsRelations = relations(guidanceLogs, ({ one }) => ({
  project: one(projects, {
    fields: [guidanceLogs.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [guidanceLogs.authorId],
    references: [users.id],
  }),
}));

export const storageUsagesRelations = relations(storageUsages, ({ one }) => ({
  user: one(users, {
    fields: [storageUsages.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
