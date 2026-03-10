import { NextResponse } from 'next/server';
import { deleteStudent, getAllStudents, getStudentStats } from '../../../lib/turso';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    await deleteStudent(id);
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, message: 'Student deleted successfully', students, stats });
  } catch (error) {
    console.error('DELETE /api/students/delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}