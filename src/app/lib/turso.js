import { createClient } from '@libsql/client/web';

function makeClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('TURSO ENV VARS:', {
      url_exists: !!url,
      token_exists: !!authToken,
    });
    throw new Error('Database not configured. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  }

  return createClient({
    url: url.trim(),
    authToken: authToken.trim(),
  });
}

async function getDb() {
  const db = makeClient();

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
  const db = await getDb();
  const result = await db.execute('SELECT * FROM students ORDER BY id DESC');
  return result.rows || [];
}

export async function addStudent(data) {
  const db = await getDb();

  const studentName = String(data.studentName || '').trim();
  const studentClass = String(data.class || '').trim();
  const section = String(data.section || '').trim();
  const parentMobile = String(data.parentMobile || '').trim();
  const totalFee = parseInt(String(data.totalFee), 10) || 0;
  const paidFee = parseInt(String(data.paidFee), 10) || 0;
  const remainingFee = totalFee - paidFee;

  console.log('ADDING STUDENT:', {
    studentName,
    studentClass,
    section,
    parentMobile,
    totalFee,
    paidFee,
    remainingFee,
  });

  const result = await db.execute({
    sql: `INSERT INTO students
          (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      studentName,
      studentClass,
      section,
      parentMobile,
      totalFee,
      paidFee,
      remainingFee,
    ],
  });

  console.log('INSERT RESULT:', result);
  return result;
}

export async function updateStudent(id, paidFee, totalFee) {
  const db = await getDb();

  const studentId = parseInt(String(id), 10);
  const paid = parseInt(String(paidFee), 10) || 0;
  const total = parseInt(String(totalFee), 10) || 0;
  const remaining = total - paid;

  await db.execute({
    sql: 'UPDATE students SET paidFee = ?, remainingFee = ? WHERE id = ?',
    args: [paid, remaining, studentId],
  });
}

export async function deleteStudent(id) {
  const db = await getDb();
  const studentId = parseInt(String(id), 10);

  await db.execute({
    sql: 'DELETE FROM students WHERE id = ?',
    args: [studentId],
  });
}

export async function getStudentStats() {
  const db = await getDb();

  try {
    const r1 = await db.execute('SELECT COUNT(*) as count FROM students');
    const r2 = await db.execute('SELECT COALESCE(SUM(totalFee), 0) as total FROM students');
    const r3 = await db.execute('SELECT COALESCE(SUM(paidFee), 0) as total FROM students');
    const r4 = await db.execute('SELECT COALESCE(SUM(remainingFee), 0) as total FROM students');
    const r5 = await db.execute('SELECT COUNT(*) as count FROM students WHERE remainingFee > 0');

    return {
      totalStudents: Number(r1.rows[0]?.count) || 0,
      totalFees: Number(r2.rows[0]?.total) || 0,
      collectedFees: Number(r3.rows[0]?.total) || 0,
      pendingFees: Number(r4.rows[0]?.total) || 0,
      pendingStudents: Number(r5.rows[0]?.count) || 0,
    };
  } catch (error) {
    console.error('Stats error:', error);
    return { totalStudents: 0, totalFees: 0, collectedFees: 0, pendingFees: 0, pendingStudents: 0 };
  }
}