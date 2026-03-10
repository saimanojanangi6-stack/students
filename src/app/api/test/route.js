import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    env_url_exists: !!process.env.TURSO_DATABASE_URL,
    env_token_exists: !!process.env.TURSO_AUTH_TOKEN,
    env_jwt_exists: !!process.env.JWT_SECRET,
    env_url_preview: process.env.TURSO_DATABASE_URL
      ? process.env.TURSO_DATABASE_URL.substring(0, 40) + '...'
      : 'NOT SET',
    steps: {},
  };

  try {
    const { createClient } = await import('@libsql/client/web');
    results.steps.import = 'PASS';

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      results.steps.env = 'FAIL';
      results.error = 'Missing environment variables';
      return NextResponse.json(results);
    }
    results.steps.env = 'PASS';

    const client = createClient({
      url: url.trim(),
      authToken: authToken.trim(),
    });
    results.steps.client = 'PASS';

    await client.execute(`
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
    results.steps.create_table = 'PASS';

    await client.execute({
      sql: `INSERT INTO students (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: ['TEST_DEBUG', '1', 'A', '0000000000', 100, 50, 50],
    });
    results.steps.insert = 'PASS';

    const read = await client.execute('SELECT * FROM students ORDER BY id DESC LIMIT 3');
    results.steps.read = 'PASS';
    results.rows = read.rows;
    results.total_rows = read.rows.length;

    await client.execute({
      sql: "DELETE FROM students WHERE studentName = ?",
      args: ['TEST_DEBUG'],
    });
    results.steps.delete = 'PASS';

    results.overall = 'ALL PASSED - Database is working correctly';
  } catch (error) {
    results.overall = 'FAILED';
    results.error = error.message;
    results.error_type = error.name;
    results.error_stack = error.stack?.substring(0, 300);
  }

  return NextResponse.json(results);
}