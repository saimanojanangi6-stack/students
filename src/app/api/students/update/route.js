import { NextResponse } from 'next/server';
import { updateStudent, getAllStudents, getStudentStats } from '../../../lib/turso';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, paidFee, totalFee } = body;

    if (!id || paidFee === undefined || totalFee === undefined) {
      return NextResponse.json({ success: false, error: 'ID, paidFee, and totalFee are required' }, { status: 400 });
    }

    if (Number(paidFee) > Number(totalFee)) {
      return NextResponse.json({ success: false, error: 'Paid fee cannot exceed total fee' }, { status: 400 });
    }

    await updateStudent(id, paidFee, totalFee);
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, message: 'Student updated successfully', students, stats });
  } catch (error) {
    console.error('PUT /api/students/update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}