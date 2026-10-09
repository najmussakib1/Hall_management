import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname; // e.g., /api/halls/1/report
    const match = pathname.match(/\/api\/halls\/(\d+)\/report/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    const hallId = parseInt(match[1], 10);
    const month = url.searchParams.get('month');
    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Missing month query parameter (YYYY-MM)' },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }

    // Hall info (including assigned manager/provost)
    const hall = db
      .prepare(
        `SELECT h.*, m.name as manager_name FROM halls h
         LEFT JOIN managers m ON m.hall_id = h.id
         WHERE h.id = ?`
      )
      .get(hallId) as any;
    if (!hall) {
      return NextResponse.json({ success: false, error: 'Hall not found' }, { status: 404 });
    }

    // Total students in this hall
    const totalStudentsRow = db
      .prepare('SELECT COUNT(*) as cnt FROM students WHERE hall_id = ?')
      .get(hallId) as any;
    const totalStudents = totalStudentsRow.cnt as number;

    // Dues logged for the month
    const dues = db
      .prepare(
        `SELECT d.*, (d.amount - COALESCE(d.paid_amount, 0)) as remaining_amount,
                s.name as student_name, s.student_id as student_code, s.room_number
         FROM dues d
         JOIN students s ON s.id = d.student_id
         WHERE s.hall_id = ? AND strftime('%Y-%m', d.created_at) = ?
         ORDER BY d.id DESC`
      )
      .all(hallId, month) as any[];

    // Payments for the month
    const payments = db
      .prepare(
        `SELECT p.*, s.name as student_name, s.student_id as student_code, s.room_number
         FROM payments p
         JOIN students s ON s.id = p.student_id
         WHERE s.hall_id = ? AND strftime('%Y-%m', p.paid_at) = ?
         ORDER BY p.paid_at DESC, p.id DESC`
      )
      .all(hallId, month) as any[];

    // Count distinct students in this hall who made a payment this month
    const paidStudentsRow = db
      .prepare(
        `SELECT COUNT(DISTINCT p.student_id) as cnt FROM payments p
         JOIN students s ON s.id = p.student_id
         WHERE s.hall_id = ? AND strftime('%Y-%m', p.paid_at) = ?`
      )
      .get(hallId, month) as any;
    const paidStudentsCount = paidStudentsRow.cnt as number;

    const totalDueAmount = dues.reduce(
      (sum, d) => sum + (d.remaining_amount ?? d.amount - (d.paid_amount || 0)),
      0
    );
    const totalDueBilled = dues.reduce((sum, d) => sum + d.amount, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount_paid, 0);

    return NextResponse.json({
      success: true,
      hall,
      month,
      dues,
      payments,
      summary: {
        totalStudents,
        paidStudentsCount,
        pendingStudentsCount: Math.max(totalStudents - paidStudentsCount, 0),
        totalDueAmount,
        totalDueBilled,
        totalCollected,
        dueCount: dues.length,
        paymentCount: payments.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Report generation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
