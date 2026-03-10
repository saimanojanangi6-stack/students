import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { updateStudent, getAllStudents, getStudentStats } from '../../../lib/turso';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Expired' }, { status: 401 });
    if (!user.permissions?.includes('edit')) return NextResponse.json({ success: false, error: 'No permission' }, { status: 403 });

    const body = await request.json();
    const id = parseInt(String(body.id || '0'), 10);
    const paidFee = parseInt(String(body.paidFee || '0'), 10);
    const totalFee = parseInt(String(body.totalFee || '0'), 10);

    if (!id || paidFee > totalFee) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    await updateStudent(id, paidFee, totalFee);
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, students, stats });
  } catch (error) {
    console.error('UPDATE ERROR:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}