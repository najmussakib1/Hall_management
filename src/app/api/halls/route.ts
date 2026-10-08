import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: List all halls with aggregated metrics (students, collections, dues, and current manager)
export async function GET() {
  try {
    const halls = db.prepare(`
      SELECT 
        h.*,
        (SELECT COUNT(*) FROM students WHERE hall_id = h.id) as total_students,
        (SELECT COUNT(*) FROM students WHERE hall_id = h.id AND status = 'resident') as resident_students,
        (SELECT COALESCE(SUM(p.amount_paid), 0) 
         FROM payments p 
         JOIN students s ON s.id = p.student_id 
         WHERE s.hall_id = h.id) as total_collected,
        (SELECT COALESCE(SUM(d.amount - COALESCE(d.paid_amount, 0)), 0) 
         FROM dues d 
         JOIN students s ON s.id = d.student_id 
         WHERE s.hall_id = h.id AND d.status IN ('unpaid', 'partially_paid')) as total_due,
        m.name as manager_name,
        m.username as manager_username,
        m.email as manager_email,
        m.phone as manager_phone
      FROM halls h
      LEFT JOIN managers m ON m.hall_id = h.id
      ORDER BY h.id ASC
    `).all();

    return NextResponse.json({ success: true, halls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Superadmin can create a new Hall
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, code, capacity = 400, location = '', description = '' } = data;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Hall name and code are required' }, { status: 400 });
    }

    const checkExists = db.prepare('SELECT id FROM halls WHERE name = ? OR code = ?').get(name.trim(), code.trim());
    if (checkExists) {
      return NextResponse.json({ success: false, error: 'A hall with this name or code already exists' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO halls (name, code, capacity, location, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      code.trim().toUpperCase(),
      parseInt(capacity, 10),
      location ? location.trim() : null,
      description ? description.trim() : null
    );

    return NextResponse.json({ success: true, hallId: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
