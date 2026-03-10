import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { deleteStudent, getAllStudents, getStudentStats } from '../../../lib/turso';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function DELETE(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Expired' }, { status: 401 });
    if (!user.permissions?.includes('delete')) return NextResponse.json({ success: false, error: 'Only Principal can delete' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0', 10);

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await deleteStudent(id);
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, students, stats });
  } catch (error) {
    console.error('DELETE ERROR:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}