import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: List all managers and superadmins
export async function GET() {
  try {
    const managers = db.prepare(`
      SELECT 
        m.id,
        m.username,
        m.name,
        m.role,
        m.hall_id,
        m.email,
        m.phone,
        m.created_at,
        h.name as hall_name,
        h.code as hall_code
      FROM managers m
      LEFT JOIN halls h ON h.id = m.hall_id
      ORDER BY m.role DESC, m.id ASC
    `).all();

    return NextResponse.json({ success: true, managers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Superadmin creates a manager account and assigns them to a hall
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, password, name, hall_id, email, phone, role = 'manager' } = data;

    if (!username || !password || !name) {
      return NextResponse.json({ success: false, error: 'Username, password and name are required' }, { status: 400 });
    }

    const checkExists = db.prepare('SELECT id FROM managers WHERE username = ?').get(username.trim());
    if (checkExists) {
      return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 400 });
    }

    const parsedHallId = hall_id ? parseInt(hall_id, 10) : null;

    const stmt = db.prepare(`
      INSERT INTO managers (username, password, name, role, hall_id, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      username.trim(),
      password.trim(),
      name.trim(),
      role,
      parsedHallId,
      email ? email.trim() : null,
      phone ? phone.trim() : null
    );

    return NextResponse.json({ success: true, managerId: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Superadmin can edit manager credentials, password, and assign/reassign hall
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, password, name, hall_id, email, phone } = data;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'Manager ID and name are required' }, { status: 400 });
    }

    const parsedHallId = hall_id ? parseInt(hall_id, 10) : null;

    if (password && password.trim().length > 0) {
      db.prepare(`
        UPDATE managers 
        SET name = ?, password = ?, hall_id = ?, email = ?, phone = ?
        WHERE id = ?
      `).run(name.trim(), password.trim(), parsedHallId, email || null, phone || null, id);
    } else {
      db.prepare(`
        UPDATE managers 
        SET name = ?, hall_id = ?, email = ?, phone = ?
        WHERE id = ?
      `).run(name.trim(), parsedHallId, email || null, phone || null, id);
    }

    return NextResponse.json({ success: true, message: 'Manager updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
