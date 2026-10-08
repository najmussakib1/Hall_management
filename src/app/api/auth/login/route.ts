import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    const user = db.prepare(`
      SELECT 
        m.id, 
        m.username, 
        m.name, 
        m.role, 
        m.password, 
        m.hall_id, 
        m.email, 
        m.phone,
        h.name as hall_name,
        h.code as hall_code
      FROM managers m
      LEFT JOIN halls h ON h.id = m.hall_id
      WHERE m.username = ?
    `).get(username) as any;

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
