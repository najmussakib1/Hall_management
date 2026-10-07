import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const residentStudents = db.prepare("SELECT COUNT(*) as count FROM students WHERE status = 'resident'").get() as { count: number };
    const totalDue = db.prepare("SELECT COALESCE(SUM(amount - COALESCE(paid_amount, 0)), 0) as total FROM dues WHERE status IN ('unpaid', 'partially_paid')").get() as { total: number };
    const totalPaid = db.prepare('SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments').get() as { total: number };

    // Recent 5 payments
    const recentPayments = db.prepare(`
      SELECT p.*, s.name as student_name, s.room_number, s.student_id as student_code
      FROM payments p
      JOIN students s ON s.id = p.student_id
      ORDER BY p.paid_at DESC, p.id DESC
      LIMIT 5
    `).all();

    // Students with highest dues
    const duesByStudent = db.prepare(`
      SELECT 
        s.id, s.name, s.student_id, s.room_number, s.phone,
        COALESCE(SUM(d.amount - COALESCE(d.paid_amount, 0)), 0) as total_due
      FROM students s
      JOIN dues d ON d.student_id = s.id AND d.status IN ('unpaid', 'partially_paid')
      GROUP BY s.id
      HAVING total_due > 0
      ORDER BY total_due DESC
      LIMIT 5
    `).all();

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: totalStudents.count,
        residentStudents: residentStudents.count,
        totalDue: totalDue.total,
        totalPaid: totalPaid.total,
      },
      recentPayments,
      duesByStudent,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
