import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hallId = searchParams.get('hall_id');

    let studentWhere = '1=1';
    let paymentWhere = '1=1';
    let dueWhere = '1=1';
    const params: any[] = [];

    if (hallId && hallId !== 'all') {
      const parsedHallId = parseInt(hallId, 10);
      studentWhere = `s.hall_id = ?`;
      paymentWhere = `s.hall_id = ?`;
      dueWhere = `s.hall_id = ?`;
      params.push(parsedHallId);
    }

    // 1. KPI Stats
    const totalHalls = db.prepare('SELECT COUNT(*) as count FROM halls').get() as { count: number };

    const totalStudents = db.prepare(`
      SELECT COUNT(*) as count FROM students s WHERE ${studentWhere}
    `).get(...params) as { count: number };

    const residentStudents = db.prepare(`
      SELECT COUNT(*) as count FROM students s WHERE s.status = 'resident' AND ${studentWhere}
    `).get(...params) as { count: number };

    const totalDue = db.prepare(`
      SELECT COALESCE(SUM(d.amount - COALESCE(d.paid_amount, 0)), 0) as total 
      FROM dues d 
      JOIN students s ON s.id = d.student_id 
      WHERE d.status IN ('unpaid', 'partially_paid') AND ${dueWhere}
    `).get(...params) as { total: number };

    const totalPaid = db.prepare(`
      SELECT COALESCE(SUM(p.amount_paid), 0) as total 
      FROM payments p 
      JOIN students s ON s.id = p.student_id 
      WHERE ${paymentWhere}
    `).get(...params) as { total: number };

    // 2. Hall-by-Hall breakdown statistics (for cross-hall comparison)
    const hallStats = db.prepare(`
      SELECT 
        h.id,
        h.name,
        h.code,
        h.capacity,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN s.status = 'resident' THEN s.id END) as resident_students,
        COALESCE(SUM(p.amount_paid), 0) as total_collected,
        COALESCE(SUM(d.amount - COALESCE(d.paid_amount, 0)), 0) as total_due,
        (SELECT m.name FROM managers m WHERE m.hall_id = h.id LIMIT 1) as manager_name
      FROM halls h
      LEFT JOIN students s ON s.hall_id = h.id
      LEFT JOIN payments p ON p.student_id = s.id
      LEFT JOIN dues d ON d.student_id = s.id AND d.status IN ('unpaid', 'partially_paid')
      GROUP BY h.id
      ORDER BY h.id ASC
    `).all();

    // 3. Payment collection timeline / monthly distribution
    const monthlyCollections = db.prepare(`
      SELECT 
        p.month_year,
        SUM(p.amount_paid) as amount,
        COUNT(p.id) as count
      FROM payments p
      JOIN students s ON s.id = p.student_id
      WHERE ${paymentWhere}
      GROUP BY p.month_year
      ORDER BY p.id DESC
      LIMIT 6
    `).all(...params);

    // 4. Payment method distribution
    const methodDistribution = db.prepare(`
      SELECT 
        p.payment_method as method,
        SUM(p.amount_paid) as total_amount,
        COUNT(p.id) as total_transactions
      FROM payments p
      JOIN students s ON s.id = p.student_id
      WHERE ${paymentWhere}
      GROUP BY p.payment_method
    `).all(...params);

    // 5. Recent 6 payments
    const recentPayments = db.prepare(`
      SELECT 
        p.*, 
        s.name as student_name, 
        s.room_number, 
        s.student_id as student_code,
        h.name as hall_name,
        h.code as hall_code
      FROM payments p
      JOIN students s ON s.id = p.student_id
      JOIN halls h ON h.id = s.hall_id
      WHERE ${paymentWhere}
      ORDER BY p.paid_at DESC, p.id DESC
      LIMIT 6
    `).all(...params);

    // 6. Top outstanding dues
    const duesByStudent = db.prepare(`
      SELECT 
        s.id, s.name, s.student_id, s.room_number, s.phone,
        h.name as hall_name,
        h.code as hall_code,
        COALESCE(SUM(d.amount - COALESCE(d.paid_amount, 0)), 0) as total_due
      FROM students s
      JOIN halls h ON h.id = s.hall_id
      JOIN dues d ON d.student_id = s.id AND d.status IN ('unpaid', 'partially_paid')
      WHERE ${studentWhere}
      GROUP BY s.id
      HAVING total_due > 0
      ORDER BY total_due DESC
      LIMIT 6
    `).all(...params);

    return NextResponse.json({
      success: true,
      stats: {
        totalHalls: totalHalls.count,
        totalStudents: totalStudents.count,
        residentStudents: residentStudents.count,
        totalDue: totalDue.total,
        totalPaid: totalPaid.total,
      },
      hallStats,
      monthlyCollections,
      methodDistribution,
      recentPayments,
      duesByStudent,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
