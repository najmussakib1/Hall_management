import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path in project root or data directory
const dbDirectory = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = path.join(dbDirectory, 'hall_management.db');
const db = new Database(dbPath);

// Enable WAL mode & foreign keys for performance and data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'manager',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      room_number TEXT NOT NULL,
      department TEXT,
      session TEXT,
      monthly_fee REAL NOT NULL DEFAULT 1500.0,
      status TEXT NOT NULL DEFAULT 'resident', -- 'resident', 'former', 'suspended'
      admission_date DATE DEFAULT (DATE('now')),
      guardian_name TEXT,
      guardian_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_no TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      month_year TEXT NOT NULL, -- e.g. "October 2026"
      amount_paid REAL NOT NULL,
      due_adjusted REAL DEFAULT 0.0,
      payment_method TEXT DEFAULT 'Cash', -- 'Cash', 'bKash', 'Nagad', 'Bank Transfer'
      transaction_id TEXT,
      remarks TEXT,
      received_by TEXT DEFAULT 'Manager',
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL, -- e.g. "Monthly Fee - Oct 2026", "Mess Caution Fee", "Late Fine"
      month_year TEXT,
      amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0.0,
      status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'partially_paid'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  // Ensure paid_amount column exists if already created
  try {
    db.exec(`ALTER TABLE dues ADD COLUMN paid_amount REAL DEFAULT 0.0;`);
  } catch (e) {
    // column already exists
  }

  // Seed default manager if none exists
  db.prepare(`
    INSERT OR IGNORE INTO managers (id, username, password, name, role)
    VALUES (1, 'manager', 'admin123', 'Chief Hall Provost / Manager', 'manager')
  `).run();

  // Seed initial sample resident students if empty
  const countStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
  if (countStudents.count === 0) {
    const insertStudent = db.prepare(`
      INSERT OR IGNORE INTO students (student_id, name, email, phone, room_number, department, session, monthly_fee, status, guardian_name, guardian_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const s1 = insertStudent.run('CSE-2022-042', 'Tariqul Islam', 'tariq@example.com', '01711000001', '302-A', 'Computer Science & Engineering', '2021-2022', 2500, 'resident', 'Md. Rafiqul Islam', '01811000001');
    const s2 = insertStudent.run('EEE-2022-115', 'Nusrat Jahan', 'nusrat@example.com', '01711000002', '205-B', 'Electrical & Electronic Eng.', '2021-2022', 2500, 'resident', 'Nazmul Huda', '01811000002');
    const s3 = insertStudent.run('BBA-2023-088', 'Sadman Shakib', 'sadman@example.com', '01711000003', '108-A', 'Business Administration', '2022-2023', 2200, 'resident', 'Kazi Mahbub', '01811000003');
    const s4 = insertStudent.run('ME-2021-019', 'Tanvir Ahmed', 'tanvir@example.com', '01711000004', '412-C', 'Mechanical Engineering', '2020-2021', 2500, 'resident', 'Ali Ahmed', '01811000004');
    const s5 = insertStudent.run('CE-2023-054', 'Farzana Akter', 'farzana@example.com', '01711000005', '210-A', 'Civil Engineering', '2022-2023', 2200, 'resident', 'Abdur Rashid', '01811000005');

    // Add initial dues and payments
    const insertDue = db.prepare(`INSERT INTO dues (student_id, title, month_year, amount, status) VALUES (?, ?, ?, ?, ?)`);
    if (s1.lastInsertRowid) insertDue.run(s1.lastInsertRowid, 'Monthly Fee - September 2026', 'September 2026', 2500, 'unpaid');
    if (s2.lastInsertRowid) insertDue.run(s2.lastInsertRowid, 'Monthly Fee - August 2026', 'August 2026', 2500, 'paid');
    if (s3.lastInsertRowid) insertDue.run(s3.lastInsertRowid, 'Utility & Maintenance Due', 'September 2026', 600, 'unpaid');

    const insertPayment = db.prepare(`
      INSERT OR IGNORE INTO payments (receipt_no, student_id, month_year, amount_paid, payment_method, remarks, received_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    if (s2.lastInsertRowid) insertPayment.run('REC-20260901-001', s2.lastInsertRowid, 'August 2026', 2500, 'Cash', 'Cleared in full with August rent', 'Manager');
  }
}

// Global cache for db instance across Next.js reloads
declare global {
  // eslint-disable-next-line no-var
  var __hall_db_initialized: boolean | undefined;
}

if (!global.__hall_db_initialized) {
  initDB();
  global.__hall_db_initialized = true;
}

export default db;
