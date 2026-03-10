import { NextResponse } from 'next/server';
import { updateStudent, getAllStudents, getStudentStats } from '../../../lib/turso';
import { verifyToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    if (!user.permissions?.includes('edit')) {
      return NextResponse.json({ success: false, error: 'No permission to edit' }, { status: 403 });
    }

    const body = await request.json();
    const { id, paidFee, totalFee } = body;

    if (!id || paidFee === undefined || totalFee === undefined) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }

    const paidFeeNum = parseInt(paidFee, 10) || 0;
    const totalFeeNum = parseInt(totalFee, 10) || 0;

    if (paidFeeNum > totalFeeNum) {
      return NextResponse.json({ success: false, error: 'Paid fee cannot exceed total fee' }, { status: 400 });
    }

    await updateStudent(id, paidFeeNum, totalFeeNum);
    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({ success: true, message: 'Updated successfully', students, stats });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}