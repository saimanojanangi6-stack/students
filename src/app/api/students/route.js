import { NextResponse } from 'next/server';
import { verifyToken } from '../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function auth(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { getAllStudents, getStudentStats } = await import('../../lib/turso');

    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({
      success: true,
      students: students,
      stats: stats,
    });
  } catch (error) {
    console.error('GET /api/students:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.permissions || !user.permissions.includes('add')) {
      return NextResponse.json(
        { success: false, error: 'No permission to add students' },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const studentName = String(body.studentName || '').trim();
    const studentClass = String(body.class || '').trim();
    const section = String(body.section || '').trim();
    const parentMobile = String(body.parentMobile || '').trim();
    const totalFee = parseInt(String(body.totalFee || '0'), 10);
    const paidFee = parseInt(String(body.paidFee || '0'), 10);

    if (!studentName) {
      return NextResponse.json(
        { success: false, error: 'Student name is required' },
        { status: 400 }
      );
    }
    if (!studentClass) {
      return NextResponse.json(
        { success: false, error: 'Class is required' },
        { status: 400 }
      );
    }
    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section is required' },
        { status: 400 }
      );
    }
    if (!parentMobile) {
      return NextResponse.json(
        { success: false, error: 'Parent mobile is required' },
        { status: 400 }
      );
    }
    if (isNaN(totalFee) || totalFee < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid total fee' },
        { status: 400 }
      );
    }
    if (isNaN(paidFee) || paidFee < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid paid fee' },
        { status: 400 }
      );
    }
    if (paidFee > totalFee) {
      return NextResponse.json(
        { success: false, error: 'Paid fee cannot exceed total fee' },
        { status: 400 }
      );
    }

    const { addStudent, getAllStudents, getStudentStats } = await import('../../lib/turso');

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

    return NextResponse.json({
      success: true,
      message: 'Student added successfully',
      students,
      stats,
    });
  } catch (error) {
    console.error('POST /api/students:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add student' },
      { status: 500 }
    );
  }
}