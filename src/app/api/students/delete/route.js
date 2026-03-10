import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    if (!user.permissions || !user.permissions.includes('delete')) {
      return NextResponse.json(
        { success: false, error: 'Only Principal can delete' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid student ID required' },
        { status: 400 }
      );
    }

    const { deleteStudent, getAllStudents, getStudentStats } = await import('../../../lib/turso');

    await deleteStudent(id);

    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully',
      students,
      stats,
    });
  } catch (error) {
    console.error('DELETE /api/students/delete:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}