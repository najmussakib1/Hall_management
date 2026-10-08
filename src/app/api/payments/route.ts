import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Helper to generate receipt number like REC-YYYYMMDD-XXXX
function generateReceiptNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REC-${dateStr}-${randomSuffix}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const hallId = searchParams.get('hall_id');

    let query = `
      SELECT 
        p.*,
        s.name as student_name,
        s.room_number as room_number,
        s.student_id as student_code,
        s.phone as student_phone,
        s.department as student_department,
        h.name as hall_name,
        h.code as hall_code
      FROM payments p
      JOIN students s ON s.id = p.student_id
      JOIN halls h ON h.id = s.hall_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (hallId && hallId !== 'all') {
      query += ` AND s.hall_id = ?`;
      params.push(parseInt(hallId, 10));
    }

    query += ` ORDER BY p.paid_at DESC, p.id DESC LIMIT ?`;
    params.push(limit);

    const payments = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      student_id,
      month_year,
      amount_paid,
      due_id = null,
      payment_method = 'Cash',
      transaction_id = null,
      remarks = null,
      received_by = 'Manager',
    } = data;

    if (!student_id || !month_year || !amount_paid) {
      return NextResponse.json({ success: false, error: 'Student, Month/Year, and Amount are required' }, { status: 400 });
    }

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id) as any;
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const receipt_no = generateReceiptNumber();
    const parsedAmount = parseFloat(amount_paid);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Payment amount must be greater than 0' }, { status: 400 });
    }

    // Database transaction: record payment and update dues accurately
    const executePayment = db.transaction(() => {
      let targetDue = null;
      if (due_id) {
        targetDue = db.prepare('SELECT * FROM dues WHERE id = ? AND student_id = ?').get(due_id, student_id) as any;
      }

      if (!targetDue) {
        targetDue = db.prepare(`
          SELECT * FROM dues 
          WHERE student_id = ? AND status IN ('unpaid', 'partially_paid') 
          ORDER BY id DESC LIMIT 1
        `).get(student_id) as any;
      }

      let remainingPayment = parsedAmount;

      if (targetDue) {
        const curPaid = targetDue.paid_amount || 0;
        const curRemaining = targetDue.amount - curPaid;

        if (remainingPayment >= curRemaining) {
          db.prepare(`
            UPDATE dues 
            SET paid_amount = amount, status = 'paid' 
            WHERE id = ?
          `).run(targetDue.id);
          remainingPayment -= curRemaining;
        } else {
          const newPaid = curPaid + remainingPayment;
          db.prepare(`
            UPDATE dues 
            SET paid_amount = ?, status = 'partially_paid' 
            WHERE id = ?
          `).run(newPaid, targetDue.id);
          remainingPayment = 0;
        }
      }

      if (remainingPayment > 0) {
        const otherDues = db.prepare(`
          SELECT * FROM dues 
          WHERE student_id = ? AND status IN ('unpaid', 'partially_paid') ${targetDue ? 'AND id != ?' : ''}
          ORDER BY id ASC
        `).all(...(targetDue ? [student_id, targetDue.id] : [student_id])) as any[];

        for (const od of otherDues) {
          if (remainingPayment <= 0) break;
          const odRemaining = od.amount - (od.paid_amount || 0);
          if (remainingPayment >= odRemaining) {
            db.prepare(`
              UPDATE dues 
              SET paid_amount = amount, status = 'paid' 
              WHERE id = ?
            `).run(od.id);
            remainingPayment -= odRemaining;
          } else {
            db.prepare(`
              UPDATE dues 
              SET paid_amount = paid_amount + ?, status = 'partially_paid' 
              WHERE id = ?
            `).run(remainingPayment, od.id);
            remainingPayment = 0;
          }
        }
      }

      const paymentResult = db.prepare(`
        INSERT INTO payments (receipt_no, student_id, month_year, amount_paid, due_adjusted, payment_method, transaction_id, remarks, received_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        receipt_no,
        student_id,
        month_year,
        parsedAmount,
        parsedAmount,
        payment_method,
        transaction_id || null,
        remarks || null,
        received_by
      );

      return paymentResult.lastInsertRowid;
    });

    const paymentId = executePayment();

    const completePayment = db.prepare(`
      SELECT 
        p.*,
        s.name as student_name,
        s.room_number as room_number,
        s.student_id as student_code,
        s.phone as student_phone,
        s.department as student_department,
        s.session as student_session,
        h.name as hall_name,
        h.code as hall_code,
        (SELECT COALESCE(SUM(amount - COALESCE(paid_amount, 0)), 0) FROM dues WHERE student_id = s.id AND status IN ('unpaid', 'partially_paid')) as remaining_due
      FROM payments p
      JOIN students s ON s.id = p.student_id
      JOIN halls h ON h.id = s.hall_id
      WHERE p.id = ?
    `).get(paymentId);

    return NextResponse.json({
      success: true,
      payment: completePayment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
