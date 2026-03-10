import { createClient } from '@libsql/client/web';

let client = null;
let tableCreated = false;

function getClient() {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || url === '' || url === 'undefined') {
    throw new Error(
      'TURSO_DATABASE_URL is not configured. Add it to your Vercel Environment Variables.'
    );
  }

  if (!authToken || authToken === '' || authToken === 'undefined') {
    throw new Error(
      'TURSO_AUTH_TOKEN is not configured. Add it to your Vercel Environment Variables.'
    );
  }

  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('libsql://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'libsql://' + cleanUrl;
  }

  client = createClient({
    url: cleanUrl,
    authToken: authToken.trim(),
  });

  return client;
}

async function ensureTable() {
  if (tableCreated) return;

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

  tableCreated = true;
}

export async function getAllStudents() {
  await ensureTable();
  const db = getClient();

  const result = await db.execute(
    'SELECT * FROM students ORDER BY id DESC'
  );

  return result.rows || [];
}

export async function addStudent(data) {
  await ensureTable();
  const db = getClient();

  const studentName = String(data.studentName || '').trim();
  const studentClass = String(data.class || '').trim();
  const section = String(data.section || '').trim();
  const parentMobile = String(data.parentMobile || '').trim();
  const totalFee = parseInt(String(data.totalFee || '0'), 10);
  const paidFee = parseInt(String(data.paidFee || '0'), 10);

  if (!studentName) throw new Error('Student name is required');
  if (!studentClass) throw new Error('Class is required');
  if (!section) throw new Error('Section is required');
  if (!parentMobile) throw new Error('Parent mobile is required');
  if (isNaN(totalFee) || totalFee < 0) throw new Error('Invalid total fee');
  if (isNaN(paidFee) || paidFee < 0) throw new Error('Invalid paid fee');
  if (paidFee > totalFee) throw new Error('Paid fee cannot exceed total fee');

  const remainingFee = totalFee - paidFee;

  await db.execute({
    sql: `INSERT INTO students
          (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [studentName, studentClass, section, parentMobile, totalFee, paidFee, remainingFee],
  });
}

export async function updateStudent(id, paidFee, totalFee) {
  await ensureTable();
  const db = getClient();

  const studentId = parseInt(String(id), 10);
  const paid = parseInt(String(paidFee), 10);
  const total = parseInt(String(totalFee), 10);

  if (isNaN(studentId) || studentId <= 0) throw new Error('Invalid student ID');
  if (isNaN(paid) || paid < 0) throw new Error('Invalid paid fee');
  if (isNaN(total) || total < 0) throw new Error('Invalid total fee');
  if (paid > total) throw new Error('Paid fee cannot exceed total fee');

  const remainingFee = total - paid;

  await db.execute({
    sql: 'UPDATE students SET paidFee = ?, remainingFee = ? WHERE id = ?',
    args: [paid, remainingFee, studentId],
  });
}

export async function deleteStudent(id) {
  await ensureTable();
  const db = getClient();

  const studentId = parseInt(String(id), 10);
  if (isNaN(studentId) || studentId <= 0) throw new Error('Invalid student ID');

  await db.execute({
    sql: 'DELETE FROM students WHERE id = ?',
    args: [studentId],
  });
}

export async function getStudentStats() {
  await ensureTable();
  const db = getClient();

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
    return {
      totalStudents: 0,
      totalFees: 0,
      collectedFees: 0,
      pendingFees: 0,
      pendingStudents: 0,
    };
  }
}