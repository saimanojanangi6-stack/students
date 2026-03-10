import { NextResponse } from 'next/server';
import { getAllStudents, addStudent, getStudentStats } from '../../lib/turso';
import { verifyToken } from '../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function authenticate(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const students = await getAllStudents();
    const stats = await getStudentStats();
    return NextResponse.json({ success: true, students, stats });
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.permissions?.includes('add')) {
      return NextResponse.json({ success: false, error: 'No permission to add students' }, { status: 403 });
    }

    const body = await request.json();
    const { studentName, class: cls, section, parentMobile, totalFee, paidFee } = body;

    if (!studentName || !cls || !section || !parentMobile) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const totalFeeNum = parseInt(totalFee, 10) || 0;
    const paidFeeNum = parseInt(paidFee, 10) || 0;

    if (paidFeeNum > totalFeeNum) {
      return NextResponse.json({ success: false, error: 'Paid fee cannot exceed total fee' }, { status: 400 });
    }

    await addStudent({
      studentName: String(studentName).trim(),
      class: String(cls).trim(),
      section: String(section).trim(),
      parentMobile: String(parentMobile).trim(),
      totalFee: totalFeeNum,
      paidFee: paidFeeNum,
    });

    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, message: 'Student added successfully', students, stats });
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}