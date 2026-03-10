import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function PUT(request) {
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

    if (!user.permissions || !user.permissions.includes('edit')) {
      return NextResponse.json(
        { success: false, error: 'No permission to edit' },
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

    const id = parseInt(String(body.id || '0'), 10);
    const paidFee = parseInt(String(body.paidFee || '0'), 10);
    const totalFee = parseInt(String(body.totalFee || '0'), 10);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid student ID required' },
        { status: 400 }
      );
    }
    if (paidFee > totalFee) {
      return NextResponse.json(
        { success: false, error: 'Paid fee cannot exceed total fee' },
        { status: 400 }
      );
    }

    const { updateStudent, getAllStudents, getStudentStats } = await import('../../../lib/turso');

    await updateStudent(id, paidFee, totalFee);

    const students = await getAllStudents();
    const stats = await getStudentStats();

    return NextResponse.json({
      success: true,
      message: 'Updated successfully',
      students,
      stats,
    });
  } catch (error) {
    console.error('PUT /api/students/update:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}