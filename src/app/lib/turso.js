import { createClient } from '@libsql/client';

let client = null;

export function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    }

    client = createClient({ url, authToken });
  }
  return client;
}

export async function initializeDatabase() {
  const db = getClient();
  try {
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
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
  return db;
}

export async function getAllStudents() {
  const db = await initializeDatabase();
  const result = await db.execute('SELECT * FROM students ORDER BY id DESC');
  return result.rows || [];
}

export async function addStudent(data) {
  const db = await initializeDatabase();
  const totalFee = parseInt(data.totalFee, 10) || 0;
  const paidFee = parseInt(data.paidFee, 10) || 0;
  const remainingFee = totalFee - paidFee;

  await db.execute({
    sql: `INSERT INTO students (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [String(data.studentName), String(data.class), String(data.section), String(data.parentMobile), totalFee, paidFee, remainingFee],
  });
}

export async function updateStudent(id, paidFee, totalFee) {
  const db = await initializeDatabase();
  const paid = parseInt(paidFee, 10) || 0;
  const total = parseInt(totalFee, 10) || 0;
  const remainingFee = total - paid;

  await db.execute({
    sql: 'UPDATE students SET paidFee = ?, remainingFee = ? WHERE id = ?',
    args: [paid, remainingFee, parseInt(id, 10)],
  });
}

export async function deleteStudent(id) {
  const db = await initializeDatabase();
  await db.execute({
    sql: 'DELETE FROM students WHERE id = ?',
    args: [parseInt(id, 10)],
  });
}

export async function getStudentStats() {
  const db = await initializeDatabase();

  const total = await db.execute('SELECT COUNT(*) as count FROM students');
  const totalFees = await db.execute('SELECT COALESCE(SUM(totalFee), 0) as total FROM students');
  const collected = await db.execute('SELECT COALESCE(SUM(paidFee), 0) as total FROM students');
  const pending = await db.execute('SELECT COALESCE(SUM(remainingFee), 0) as total FROM students');
  const pendingStudents = await db.execute('SELECT COUNT(*) as count FROM students WHERE remainingFee > 0');

  return {
    totalStudents: Number(total.rows[0]?.count) || 0,
    totalFees: Number(totalFees.rows[0]?.total) || 0,
    collectedFees: Number(collected.rows[0]?.total) || 0,
    pendingFees: Number(pending.rows[0]?.total) || 0,
    pendingStudents: Number(pendingStudents.rows[0]?.count) || 0,
  };
}