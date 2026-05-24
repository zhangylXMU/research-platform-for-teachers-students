import { getDb } from "../api/queries/connection";
import { users, teacherProfiles, studentProfiles, projects } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Check if admin already exists
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, "guanliyuan"));

  if (existingAdmin.length > 0) {
    console.log("Seed data already exists, skipping.");
    process.exit(0);
  }

  // Create admin
  const adminPassword = await bcrypt.hash("Flzx3000c", 10);
  const adminResult = await db.insert(users).values({
    name: "系统管理员",
    username: "guanliyuan",
    passwordHash: adminPassword,
    role: "admin",
    authType: "local",
    status: "active",
  });
  const adminId = Number(adminResult[0].insertId);
  console.log(`Created admin: id=${adminId}, username=guanliyuan`);

  // Create test teacher
  const teacherPassword = await bcrypt.hash("teacherpassword", 10);
  const teacherResult = await db.insert(users).values({
    name: "张明教授",
    username: "teacher1",
    passwordHash: teacherPassword,
    role: "teacher",
    authType: "local",
    status: "active",
  });
  const teacherId = Number(teacherResult[0].insertId);
  console.log(`Created teacher: id=${teacherId}, username=teacher1`);

  await db.insert(teacherProfiles).values({
    userId: teacherId,
    institution: "北京大学",
    title: "教授",
    researchFields: ["人工智能", "机器学习"],
    bio: "长期从事人工智能与机器学习领域的教学与研究工作，指导过多项国家级科研项目。",
    verificationStatus: "verified",
  });

  // Create test student
  const studentPassword = await bcrypt.hash("studentpassword", 10);
  const studentResult = await db.insert(users).values({
    name: "李华",
    username: "student1",
    passwordHash: studentPassword,
    role: "student",
    authType: "local",
    status: "active",
  });
  const studentId = Number(studentResult[0].insertId);
  console.log(`Created student: id=${studentId}, username=student1`);

  await db.insert(studentProfiles).values({
    userId: studentId,
    gradeLevel: "undergraduate",
    school: "清华大学",
    major: "计算机科学",
    researchInterests: ["深度学习", "自然语言处理"],
  });

  // Create sample projects
  await db.insert(projects).values([
    {
      teacherId: teacherId,
      title: "基于深度学习的图像分类研究",
      description: "探索使用卷积神经网络进行图像分类的优化方法，适合有一定编程基础的学生参与。",
      requirements: "熟悉Python和PyTorch，有基础数学功底",
      researchField: "人工智能",
      status: "recruiting",
      maxStudents: 3,
    },
    {
      teacherId: teacherId,
      title: "自然语言处理中的文本生成模型",
      description: "研究Transformer架构在中文文本生成中的应用与改进。",
      requirements: "了解NLP基础概念，能阅读英文论文",
      researchField: "自然语言处理",
      status: "recruiting",
      maxStudents: 2,
    },
    {
      teacherId: teacherId,
      title: "机器学习在生物医学数据分析中的应用",
      description: "利用机器学习方法分析基因组数据，探索疾病诊断的新途径。",
      requirements: "有生物学或医学背景优先",
      researchField: "生物信息学",
      status: "recruiting",
      maxStudents: 2,
    },
  ]);

  console.log("Created 3 sample projects");
  console.log("Done.");
  process.exit(0);
}

import { eq } from "drizzle-orm";
seed();
