import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const studentId = parseInt(id, 10);

    const student = db.prepare(`
      SELECT 
        s.*,
        COALESCE((SELECT SUM(amount - COALESCE(paid_amount, 0)) FROM dues WHERE student_id = s.id AND status IN ('unpaid', 'partially_paid')), 0) as total_due,
        COALESCE((SELECT SUM(amount_paid) FROM payments WHERE student_id = s.id), 0) as total_paid
      FROM students s
      WHERE s.id = ?
    `).get(studentId) as any;

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const payments = db.prepare(`
      SELECT * FROM payments WHERE student_id = ? ORDER BY paid_at DESC, id DESC
    `).all(studentId);

    const dues = db.prepare(`
      SELECT * FROM dues WHERE student_id = ? ORDER BY created_at DESC, id DESC
    `).all(studentId);

    return NextResponse.json({
      success: true,
      student,
      payments,
      dues,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const studentId = parseInt(id, 10);
    const data = await request.json();

    const {
      student_id,
      name,
      email,
      phone,
      room_number,
      department,
      session,
      monthly_fee,
      status,
      guardian_name,
      guardian_phone,
    } = data;

    const stmt = db.prepare(`
      UPDATE students
      SET student_id = ?,
          name = ?,
          email = ?,
          phone = ?,
          room_number = ?,
          department = ?,
          session = ?,
          monthly_fee = ?,
          status = ?,
          guardian_name = ?,
          guardian_phone = ?
      WHERE id = ?
    `);

    stmt.run(
      student_id.trim(),
      name.trim(),
      email ? email.trim() : null,
      phone.trim(),
      room_number.trim(),
      department ? department.trim() : null,
      session ? session.trim() : null,
      parseFloat(monthly_fee),
      status,
      guardian_name ? guardian_name.trim() : null,
      guardian_phone ? guardian_phone.trim() : null,
      studentId
    );

    return NextResponse.json({ success: true, message: 'Student updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const studentId = parseInt(id, 10);

    db.prepare('DELETE FROM students WHERE id = ?').run(studentId);

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
