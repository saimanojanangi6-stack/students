import { NextResponse } from 'next/server';
import { verifyToken } from '../../lib/auth';
import { getAllStudents, addStudent, getStudentStats } from '../../lib/turso';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function auth(req) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, students, stats });
  } catch (error) {
    console.error('GET ERROR:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.permissions || !user.permissions.includes('add')) {
      return NextResponse.json({ success: false, error: 'No permission' }, { status: 403 });
    }

    const body = await request.json();

    console.log('RECEIVED BODY:', JSON.stringify(body));

    const studentName = String(body.studentName || '').trim();
    const studentClass = String(body.class || '').trim();
    const section = String(body.section || '').trim();
    const parentMobile = String(body.parentMobile || '').trim();
    const totalFee = parseInt(String(body.totalFee || '0'), 10);
    const paidFee = parseInt(String(body.paidFee || '0'), 10);

    if (!studentName || !studentClass || !section || !parentMobile) {
      return NextResponse.json(
        { success: false, error: `Missing fields: name=${studentName}, class=${studentClass}, section=${section}, mobile=${parentMobile}` },
        { status: 400 }
      );
    }

    if (paidFee > totalFee) {
      return NextResponse.json(
        { success: false, error: 'Paid fee cannot exceed total fee' },
        { status: 400 }
      );
    }

    await addStudent({
      studentName,
      class: studentClass,
      section,
      parentMobile,
      totalFee,
      paidFee,
    });

    const students = await getAllStudents();
    const stats = await getStudentStats();

    console.log('STUDENT ADDED. Total now:', students.length);

    return NextResponse.json({
      success: true,
      message: 'Student added',
      students,
      stats,
    });
  } catch (error) {
    console.error('POST ERROR:', error.message, error.stack);
    return NextResponse.json(
      { success: false, error: 'Add failed: ' + error.message },
      { status: 500 }
    );
  }
}