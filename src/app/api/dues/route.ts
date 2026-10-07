import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all dues, optionally filtered by student_id and status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status'); // 'unpaid', 'all', etc.

    let query = `
      SELECT 
        d.*,
        (d.amount - COALESCE(d.paid_amount, 0)) as remaining_amount,
        s.name as student_name,
        s.student_id as student_code,
        s.room_number
      FROM dues d
      JOIN students s ON s.id = d.student_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (studentId) {
      query += ` AND d.student_id = ?`;
      params.push(parseInt(studentId, 10));
    }

    if (status && status !== 'all') {
      if (status === 'unpaid') {
        query += ` AND d.status IN ('unpaid', 'partially_paid')`;
      } else {
        query += ` AND d.status = ?`;
        params.push(status);
      }
    }

    query += ` ORDER BY d.id DESC`;

    const dues = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, dues });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add new due to a student (or bulk generate dues for resident students)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { student_id, title, month_year, amount, bulk_resident = false } = data;

    if (bulk_resident) {
      if (!month_year || !amount) {
        return NextResponse.json({ success: false, error: 'Month/Year and amount are required for bulk generation' }, { status: 400 });
      }

      const residentStudents = db.prepare("SELECT id, monthly_fee FROM students WHERE status = 'resident'").all() as any[];
      const insertDue = db.prepare(`
        INSERT INTO dues (student_id, title, month_year, amount, paid_amount, status)
        VALUES (?, ?, ?, ?, 0.0, 'unpaid')
      `);

      let addedCount = 0;
      const runBulk = db.transaction(() => {
        for (const s of residentStudents) {
          const dueFee = amount === 'use_default' ? s.monthly_fee : parseFloat(amount);
          insertDue.run(s.id, title || `Monthly Fee - ${month_year}`, month_year, dueFee);
          addedCount++;
        }
      });

      runBulk();

      return NextResponse.json({ success: true, message: `Added dues for ${addedCount} resident students` });
    }

    if (!student_id || !title || !amount) {
      return NextResponse.json({ success: false, error: 'Student, Title and Amount are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO dues (student_id, title, month_year, amount, paid_amount, status)
      VALUES (?, ?, ?, ?, 0.0, 'unpaid')
    `);

    stmt.run(student_id, title, month_year || null, parseFloat(amount));

    return NextResponse.json({ success: true, message: 'Due added successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
