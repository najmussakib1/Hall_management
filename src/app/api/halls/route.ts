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
        (SELECT m.name FROM managers m WHERE m.hall_id = h.id LIMIT 1) as manager_name,
        (SELECT m.username FROM managers m WHERE m.hall_id = h.id LIMIT 1) as manager_username,
        (SELECT m.email FROM managers m WHERE m.hall_id = h.id LIMIT 1) as manager_email,
        (SELECT m.phone FROM managers m WHERE m.hall_id = h.id LIMIT 1) as manager_phone
      FROM halls h
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
    const { name, code, capacity = 400, monthly_fee = 2000, location = '', description = '' } = data;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Hall name and code are required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const upperCode = code.trim().toUpperCase();
    const parsedCapacity = parseInt(capacity, 10) || 400;
    const parsedMonthlyFee = parseFloat(monthly_fee) || 2000;

    const checkExists = db.prepare(`
      SELECT id, name, code FROM halls 
      WHERE LOWER(name) = LOWER(?) OR UPPER(code) = UPPER(?)
    `).get(trimmedName, upperCode) as any;

    if (checkExists) {
      const matchType = checkExists.code.toUpperCase() === upperCode ? 'code' : 'name';
      return NextResponse.json({ 
        success: false, 
        error: `A hall with this ${matchType} (${matchType === 'code' ? checkExists.code : checkExists.name}) already exists` 
      }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO halls (name, code, capacity, monthly_fee, location, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      trimmedName,
      upperCode,
      parsedCapacity,
      parsedMonthlyFee,
      location ? location.trim() : null,
      description ? description.trim() : null
    );

    const createdHall = db.prepare('SELECT * FROM halls WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, hallId: result.lastInsertRowid, hall: createdHall });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Superadmin can update an existing Hall (including monthly_fee)
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, code, capacity, monthly_fee, location, description, update_students_fee } = data;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Hall ID is required' }, { status: 400 });
    }

    const hall = db.prepare('SELECT * FROM halls WHERE id = ?').get(id) as any;
    if (!hall) {
      return NextResponse.json({ success: false, error: 'Hall not found' }, { status: 404 });
    }

    const trimmedName = name !== undefined ? name.trim() : hall.name;
    const upperCode = code !== undefined ? code.trim().toUpperCase() : hall.code;
    const parsedCapacity = capacity !== undefined ? parseInt(capacity, 10) || hall.capacity : hall.capacity;
    const parsedMonthlyFee = monthly_fee !== undefined ? parseFloat(monthly_fee) || hall.monthly_fee : hall.monthly_fee;
    const updatedLocation = location !== undefined ? (location ? location.trim() : null) : hall.location;
    const updatedDesc = description !== undefined ? (description ? description.trim() : null) : hall.description;

    // Check duplicate code or name for other halls
    const checkExists = db.prepare(`
      SELECT id, name, code FROM halls 
      WHERE (LOWER(name) = LOWER(?) OR UPPER(code) = UPPER(?)) AND id != ?
    `).get(trimmedName, upperCode, id) as any;

    if (checkExists) {
      const matchType = checkExists.code.toUpperCase() === upperCode ? 'code' : 'name';
      return NextResponse.json({ 
        success: false, 
        error: `Another hall with this ${matchType} (${matchType === 'code' ? checkExists.code : checkExists.name}) already exists` 
      }, { status: 400 });
    }

    db.prepare(`
      UPDATE halls 
      SET name = ?, code = ?, capacity = ?, monthly_fee = ?, location = ?, description = ?
      WHERE id = ?
    `).run(
      trimmedName,
      upperCode,
      parsedCapacity,
      parsedMonthlyFee,
      updatedLocation,
      updatedDesc,
      id
    );

    // If superadmin checked option to sync all current resident students in this hall with the new monthly fee:
    if (update_students_fee) {
      db.prepare(`
        UPDATE students
        SET monthly_fee = ?
        WHERE hall_id = ?
      `).run(parsedMonthlyFee, id);
    }

    const updatedHall = db.prepare('SELECT * FROM halls WHERE id = ?').get(id);

    return NextResponse.json({ success: true, message: 'Hall updated successfully', hall: updatedHall });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
