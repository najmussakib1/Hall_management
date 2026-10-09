import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all students with hall filtering and due calculation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const hallId = searchParams.get('hall_id');

    let query = `
      SELECT 
        s.*,
        h.name as hall_name,
        h.code as hall_code,
        h.monthly_fee as hall_monthly_fee,
        COALESCE((SELECT SUM(amount - COALESCE(paid_amount, 0)) FROM dues WHERE student_id = s.id AND status IN ('unpaid', 'partially_paid')), 0) as total_due,
        COALESCE((SELECT SUM(amount_paid) FROM payments WHERE student_id = s.id), 0) as total_paid
      FROM students s
      JOIN halls h ON h.id = s.hall_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (hallId && hallId !== 'all') {
      query += ` AND s.hall_id = ?`;
      params.push(parseInt(hallId, 10));
    }

    if (status && status !== 'all') {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (s.name LIKE ? OR s.student_id LIKE ? OR s.room_number LIKE ? OR s.phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY s.room_number ASC, s.name ASC`;

    const students = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new student
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      student_id,
      hall_id = 1,
      name,
      email,
      phone,
      room_number,
      department,
      session,
      monthly_fee,
      status = 'resident',
      guardian_name,
      guardian_phone,
    } = data;

    if (!student_id || !name || !phone || !room_number || !monthly_fee) {
      return NextResponse.json({ success: false, error: 'Please provide all mandatory student details' }, { status: 400 });
    }

    const checkExists = db.prepare('SELECT id FROM students WHERE student_id = ?').get(student_id);
    if (checkExists) {
      return NextResponse.json({ success: false, error: 'A student with this Student ID already exists' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO students (student_id, hall_id, name, email, phone, room_number, department, session, monthly_fee, status, guardian_name, guardian_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      student_id.trim(),
      parseInt(hall_id, 10),
      name.trim(),
      email ? email.trim() : null,
      phone.trim(),
      room_number.trim(),
      department ? department.trim() : null,
      session ? session.trim() : null,
      parseFloat(monthly_fee),
      status,
      guardian_name ? guardian_name.trim() : null,
      guardian_phone ? guardian_phone.trim() : null
    );

    return NextResponse.json({ success: true, studentId: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
