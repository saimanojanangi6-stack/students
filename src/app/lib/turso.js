import { createClient } from '@libsql/client';

let client = null;

export function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function initializeDatabase() {
  const db = getClient();

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

  return db;
}

export async function getAllStudents() {
  const db = await initializeDatabase();
  const result = await db.execute('SELECT * FROM students ORDER BY createdAt DESC');
  return result.rows;
}

export async function addStudent(data) {
  const db = await initializeDatabase();
  const remainingFee = Number(data.totalFee) - Number(data.paidFee);

  const result = await db.execute({
    sql: `INSERT INTO students (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      data.studentName,
      data.class,
      data.section,
      data.parentMobile,
      Number(data.totalFee),
      Number(data.paidFee),
      remainingFee,
    ],
  });

  return result;
}

export async function updateStudent(id, paidFee, totalFee) {
  const db = await initializeDatabase();
  const remainingFee = Number(totalFee) - Number(paidFee);

  const result = await db.execute({
    sql: `UPDATE students SET paidFee = ?, remainingFee = ? WHERE id = ?`,
    args: [Number(paidFee), remainingFee, Number(id)],
  });

  return result;
}

export async function deleteStudent(id) {
  const db = await initializeDatabase();
  const result = await db.execute({
    sql: 'DELETE FROM students WHERE id = ?',
    args: [Number(id)],
  });
  return result;
}

export async function getStudentStats() {
  const db = await initializeDatabase();

  const total = await db.execute('SELECT COUNT(*) as count FROM students');
  const totalFees = await db.execute('SELECT COALESCE(SUM(totalFee), 0) as total FROM students');
  const collected = await db.execute('SELECT COALESCE(SUM(paidFee), 0) as total FROM students');
  const pending = await db.execute('SELECT COALESCE(SUM(remainingFee), 0) as total FROM students');
  const pendingStudents = await db.execute('SELECT COUNT(*) as count FROM students WHERE remainingFee > 0');

  return {
    totalStudents: total.rows[0]?.count || 0,
    totalFees: totalFees.rows[0]?.total || 0,
    collectedFees: collected.rows[0]?.total || 0,
    pendingFees: pending.rows[0]?.total || 0,
    pendingStudents: pendingStudents.rows[0]?.count || 0,
  };
}