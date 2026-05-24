import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  json,
  tinyint,
} from "drizzle-orm/mysql-core";

// ─── Users ──────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  role: mysqlEnum("role", ["student", "teacher", "admin"]).default("student").notNull(),
  authType: mysqlEnum("authType", ["oauth", "local"]).notNull(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  username: varchar("username", { length: 255 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "banned"]).default("active").notNull(),
  storageQuota: bigint("storageQuota", { mode: "number" }).notNull().default(104857600), // 100MB
  storageUsed: bigint("storageUsed", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Teacher Profiles ───────────────────────────────────
export const teacherProfiles = mysqlTable("teacherProfiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  researchFields: json("researchFields").notNull(),
  bio: text("bio"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  verificationDoc: varchar("verificationDoc", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeacherProfile = typeof teacherProfiles.$inferSelect;

// ─── Student Profiles ───────────────────────────────────
export const studentProfiles = mysqlTable("studentProfiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  gradeLevel: mysqlEnum("gradeLevel", ["middle", "high", "undergraduate", "master", "phd"]).notNull(),
  school: varchar("school", { length: 255 }).notNull(),
  major: varchar("major", { length: 255 }),
  researchInterests: json("researchInterests"),
  resume: varchar("resume", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;

// ─── Projects ───────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  teacherId: bigint("teacherId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  researchField: varchar("researchField", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["recruiting", "in_progress", "completed", "closed"]).default("recruiting").notNull(),
  maxStudents: int("maxStudents").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;

// ─── Project Applications ───────────────────────────────
export const projectApplications = mysqlTable("projectApplications", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectApplication = typeof projectApplications.$inferSelect;

// ─── Project Members ────────────────────────────────────
export const projectMembers = mysqlTable("projectMembers", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ProjectMember = typeof projectMembers.$inferSelect;

// ─── Guidance Logs ──────────────────────────────────────
export const guidanceLogs = mysqlTable("guidanceLogs", {
  id: serial("id").primaryKey(),
  projectId: bigint("projectId", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  logType: mysqlEnum("logType", ["guidance", "progress", "interaction"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  attachments: json("attachments"),
  isPublic: tinyint("isPublic").notNull().default(0),
  publicAfter: timestamp("publicAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GuidanceLog = typeof guidanceLogs.$inferSelect;

// ─── Storage Usages ─────────────────────────────────────
export const storageUsages = mysqlTable("storageUsages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StorageUsage = typeof storageUsages.$inferSelect;

// ─── Orders (reserved) ──────────────────────────────────
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  orderType: mysqlEnum("orderType", ["storage_expand", "guidance_fee", "equipment"]).notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "completed", "cancelled"]).default("pending").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
