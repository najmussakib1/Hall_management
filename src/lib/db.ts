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
    CREATE TABLE IF NOT EXISTS halls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 500,
      monthly_fee REAL NOT NULL DEFAULT 2000.0,
      location TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'manager', -- 'superadmin' | 'manager'
      hall_id INTEGER,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hall_id INTEGER NOT NULL DEFAULT 1,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hall_id) REFERENCES halls(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_no TEXT UNIQUE NOT NULL,
      student_id INTEGER NOT NULL,
      month_year TEXT NOT NULL,
      amount_paid REAL NOT NULL,
      due_adjusted REAL DEFAULT 0.0,
      payment_method TEXT DEFAULT 'Cash',
      transaction_id TEXT,
      remarks TEXT,
      received_by TEXT DEFAULT 'Manager',
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS dues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      month_year TEXT,
      amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0.0,
      status TEXT DEFAULT 'unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  // Migrations for existing databases:
  try {
    db.exec(`ALTER TABLE dues ADD COLUMN paid_amount REAL DEFAULT 0.0;`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE managers ADD COLUMN hall_id INTEGER REFERENCES halls(id);`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE managers ADD COLUMN email TEXT;`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE managers ADD COLUMN phone TEXT;`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE students ADD COLUMN hall_id INTEGER DEFAULT 1;`);
  } catch (e) {}

  try {
    db.exec(`ALTER TABLE halls ADD COLUMN monthly_fee REAL DEFAULT 2000.0;`);
  } catch (e) {}

  // Seed default halls if none exist
  const countHalls = db.prepare('SELECT COUNT(*) as count FROM halls').get() as { count: number };
  if (countHalls.count === 0) {
    const insertHall = db.prepare(`
      INSERT INTO halls (id, name, code, capacity, monthly_fee, location, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertHall.run(1, 'Sher-e-Bangla Hall', 'SBH', 450, 2000, 'North Campus Zone A', 'Premier male residential hall');
    insertHall.run(2, 'Begum Rokeya Hall', 'BRH', 500, 2000, 'South Campus Zone B', 'Premier female residential hall');
    insertHall.run(3, 'Fazlul Huq Muslim Hall', 'FHMH', 400, 2000, 'Central Science Campus', 'Undergraduate and graduate hall');
    insertHall.run(4, 'Shahidullah Hall', 'SHH', 380, 2000, 'East Campus Quad', 'Science faculty residential hall');
  }

  // Seed default superadmin if not exists
  db.prepare(`
    INSERT OR IGNORE INTO managers (id, username, password, name, role, hall_id)
    VALUES (100, 'superadmin', 'admin123', 'Central University Controller', 'superadmin', NULL)
  `).run();

  // Seed default hall manager assigned to Hall 1
  db.prepare(`
    INSERT OR IGNORE INTO managers (id, username, password, name, role, hall_id, email, phone)
    VALUES (1, 'manager', 'admin123', 'Chief Hall Provost / Manager', 'manager', 1, 'manager.sbh@university.edu', '01711223344')
  `).run();

  // Ensure default manager has hall_id = 1
  db.prepare(`UPDATE managers SET hall_id = 1 WHERE username = 'manager' AND hall_id IS NULL`).run();

  // Seed sample resident students if empty
  const countStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
  if (countStudents.count === 0) {
    const insertStudent = db.prepare(`
      INSERT OR IGNORE INTO students (student_id, hall_id, name, email, phone, room_number, department, session, monthly_fee, status, guardian_name, guardian_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Hall 1 students
    const s1 = insertStudent.run('CSE-2022-042', 1, 'Tariqul Islam', 'tariq@example.com', '01711000001', '302-A', 'Computer Science & Engineering', '2021-2022', 2000, 'resident', 'Md. Rafiqul Islam', '01811000001');
    const s2 = insertStudent.run('EEE-2022-115', 1, 'Nusrat Jahan', 'nusrat@example.com', '01711000002', '205-B', 'Electrical & Electronic Eng.', '2021-2022', 2000, 'resident', 'Nazmul Huda', '01811000002');
    const s3 = insertStudent.run('BBA-2023-088', 1, 'Sadman Shakib', 'sadman@example.com', '01711000003', '108-A', 'Business Administration', '2022-2023', 2000, 'resident', 'Kazi Mahbub', '01811000003');

    // Hall 2 students
    const s4 = insertStudent.run('ME-2021-019', 2, 'Farhana Yesmin', 'farhana@example.com', '01711000004', '412-C', 'Mechanical Engineering', '2020-2021', 2000, 'resident', 'Ali Ahmed', '01811000004');
    const s5 = insertStudent.run('CE-2023-054', 2, 'Farzana Akter', 'farzana@example.com', '01711000005', '210-A', 'Civil Engineering', '2022-2023', 2000, 'resident', 'Abdur Rashid', '01811000005');

    // Add initial dues and payments
    const insertDue = db.prepare(`INSERT INTO dues (student_id, title, month_year, amount, status) VALUES (?, ?, ?, ?, ?)`);
    if (s1.lastInsertRowid) insertDue.run(s1.lastInsertRowid, 'Monthly Fee - September 2026', 'September 2026', 2500, 'unpaid');
    if (s2.lastInsertRowid) insertDue.run(s2.lastInsertRowid, 'Monthly Fee - August 2026', 'August 2026', 2500, 'paid');
    if (s3.lastInsertRowid) insertDue.run(s3.lastInsertRowid, 'Utility & Maintenance Due', 'September 2026', 600, 'unpaid');
    if (s4.lastInsertRowid) insertDue.run(s4.lastInsertRowid, 'Monthly Fee - September 2026', 'September 2026', 2500, 'unpaid');

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
