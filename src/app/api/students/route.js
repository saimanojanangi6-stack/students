import { NextResponse } from 'next/server';
import { getAllStudents, addStudent, getStudentStats } from '../../lib/turso';

export async function GET() {
  try {
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
    const body = await request.json();
    const { studentName, class: cls, section, parentMobile, totalFee, paidFee } = body;

    if (!studentName || !cls || !section || !parentMobile || totalFee === undefined || paidFee === undefined) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    if (Number(paidFee) > Number(totalFee)) {
      return NextResponse.json({ success: false, error: 'Paid fee cannot exceed total fee' }, { status: 400 });
    }

    await addStudent(body);
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, message: 'Student added successfully', students, stats });
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}