import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const results = {
    step1_env_check: null,
    step2_client_create: null,
    step3_table_create: null,
    step4_insert_test: null,
    step5_read_test: null,
    step6_delete_test: null,
    env_url_exists: !!process.env.TURSO_DATABASE_URL,
    env_token_exists: !!process.env.TURSO_AUTH_TOKEN,
    env_url_preview: process.env.TURSO_DATABASE_URL
      ? process.env.TURSO_DATABASE_URL.substring(0, 30) + '...'
      : 'NOT SET',
  };

  try {
    results.step1_env_check = 'PASS';

    const { createClient } = await import('@libsql/client/web');

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      results.step1_env_check = 'FAIL - Missing env vars';
      return NextResponse.json(results);
    }

    const client = createClient({
      url: url.trim(),
      authToken: authToken.trim(),
    });

    results.step2_client_create = 'PASS';

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

    results.step3_table_create = 'PASS';

    await client.execute({
      sql: `INSERT INTO students 
            (studentName, class, section, parentMobile, totalFee, paidFee, remainingFee, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: ['DEBUG TEST', '1', 'A', '1234567890', 1000, 500, 500],
    });

    results.step4_insert_test = 'PASS';

    const readResult = await client.execute(
      'SELECT * FROM students ORDER BY id DESC LIMIT 5'
    );

    results.step5_read_test = {
      status: 'PASS',
      row_count: readResult.rows.length,
      rows: readResult.rows,
    };

    await client.execute({
      sql: "DELETE FROM students WHERE studentName = ?",
      args: ['DEBUG TEST'],
    });

    results.step6_delete_test = 'PASS';
    results.overall = 'ALL TESTS PASSED';
  } catch (error) {
    results.error = {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500),
    };
    results.overall = 'FAILED';
  }

  return NextResponse.json(results, {
    headers: { 'Content-Type': 'application/json' },
  });
}