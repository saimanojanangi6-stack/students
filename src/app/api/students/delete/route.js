import { NextResponse } from 'next/server';
import { deleteStudent, getAllStudents, getStudentStats } from '../../../lib/turso';
import { verifyToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    if (!user.permissions?.includes('delete')) {
      return NextResponse.json({ success: false, error: 'No permission to delete students. Only Principal can delete.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    await deleteStudent(parseInt(id, 10));
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, message: 'Deleted successfully', students, stats });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}