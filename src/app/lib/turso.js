import { createClient } from "@libsql/client";

const globalForTurso = globalThis;

export const db =
  globalForTurso.turso ||
  createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== "production") {
  globalForTurso.turso = db;
}

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentName TEXT NOT NULL,
      class TEXT NOT NULL,
      section TEXT NOT NULL,
      parentMobile TEXT NOT NULL,
      totalFee INTEGER NOT NULL DEFAULT 0,
      paidFee INTEGER NOT NULL DEFAULT 0,
      remainingFee INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  initialized = true;
}

export async function getAllStudents() {
  await initializeDatabase();

  const result = await db.execute(
    "SELECT * FROM students ORDER BY id DESC"
  );

  return result.rows || [];
}

export async function addStudent(data) {
  await initializeDatabase();

  const totalFee = parseInt(data.totalFee, 10) || 0;
  const paidFee = parseInt(data.paidFee, 10) || 0;
  const remainingFee = Math.max(totalFee - paidFee, 0);

  await db.execute({
    sql: `INSERT INTO students 
      (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      String(data.studentName),
      String(data.class),
      String(data.section),
      String(data.parentMobile),
      totalFee,
      paidFee,
      remainingFee,
    ],
  });
}

export async function updateStudent(id, paidFee, totalFee) {
  await initializeDatabase();

  const paid = parseInt(paidFee, 10) || 0;
  const total = parseInt(totalFee, 10) || 0;
  const remainingFee = Math.max(total - paid, 0);

  await db.execute({
    sql: "UPDATE students SET paidFee = ?, remainingFee = ? WHERE id = ?",
    args: [paid, remainingFee, parseInt(id, 10)],
  });
}

export async function deleteStudent(id) {
  await initializeDatabase();

  await db.execute({
    sql: "DELETE FROM students WHERE id = ?",
    args: [parseInt(id, 10)],
  });
}

export async function getStudentStats() {
  await initializeDatabase();

  const total = await db.execute(
    "SELECT COUNT(*) as count FROM students"
  );

  const totalFees = await db.execute(
    "SELECT COALESCE(SUM(totalFee),0) as total FROM students"
  );

  const collected = await db.execute(
    "SELECT COALESCE(SUM(paidFee),0) as total FROM students"
  );

  const pending = await db.execute(
    "SELECT COALESCE(SUM(remainingFee),0) as total FROM students"
  );

  const pendingStudents = await db.execute(
    "SELECT COUNT(*) as count FROM students WHERE remainingFee > 0"
  );

  return {
    totalStudents: Number(total.rows[0]?.count) || 0,
    totalFees: Number(totalFees.rows[0]?.total) || 0,
    collectedFees: Number(collected.rows[0]?.total) || 0,
    pendingFees: Number(pending.rows[0]?.total) || 0,
    pendingStudents: Number(pendingStudents.rows[0]?.count) || 0,
  };
}