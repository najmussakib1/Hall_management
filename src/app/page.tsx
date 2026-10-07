'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Printer,
  Eye,
  LogOut,
  Building,
  TrendingUp,
  DollarSign,
  UserCheck,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { Student, Payment, ManagerUser } from '@/types';
import LoginForm from '@/components/LoginForm';
import PrintableReceiptModal from '@/components/PrintableReceiptModal';
import PaymentModal from '@/components/PaymentModal';
import StudentModal from '@/components/StudentModal';
import DueModal from '@/components/DueModal';
import StudentProfileModal from '@/components/StudentProfileModal';

export default function ManagerDashboard() {
  const [currentUser, setCurrentUser] = useState<ManagerUser | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'payments' | 'overview'>('students');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    residentStudents: 0,
    totalDue: 0,
    totalPaid: 0,
  });
  const [recentDuesList, setRecentDuesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('resident');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);

  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showDueModal, setShowDueModal] = useState<boolean>(false);
  const [selectedStudentForDue, setSelectedStudentForDue] = useState<Student | null>(null);

  const [activeReceiptPayment, setActiveReceiptPayment] = useState<any | null>(null);
  const [profileModalStudentId, setProfileModalStudentId] = useState<number | null>(null);

  // Check login session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hostel_manager_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('hostel_manager_user');
      }
    }
  }, []);

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students
      const studentRes = await fetch(`/api/students?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`);
      const studentData = await studentRes.json();
      if (studentData.success) {
        setStudents(studentData.students);
      }

      // 2. Fetch Payments
      const paymentRes = await fetch('/api/payments?limit=50');
      const paymentData = await paymentRes.json();
      if (paymentData.success) {
        setPayments(paymentData.payments);
      }

      // 3. Fetch Stats
      const statRes = await fetch('/api/stats');
      const statData = await statRes.json();
      if (statData.success) {
        setStats(statData.stats);
        setRecentDuesList(statData.duesByStudent || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, statusFilter, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('hostel_manager_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Sher-e-Bangla Hall Management</h1>
              <p className="text-[11px] text-slate-400">Hostel Resident & Accounts Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{currentUser.name}</p>
              <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-mono">Manager Access</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* KPI Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Residents</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.residentStudents}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Total Registered: {stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dues Pending</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.totalDue.toLocaleString()} ৳</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Unsettled hall charges</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collected</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalPaid.toLocaleString()} ৳</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Recorded fee revenue</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Quick Actions</p>
              <h4 className="text-sm font-semibold mt-1">Receive & Print Receipt</h4>
            </div>
            <button
              onClick={() => {
                setSelectedStudentForPayment(null);
                setShowPaymentModal(true);
              }}
              className="mt-3 w-full py-2 bg-white text-indigo-700 font-semibold rounded-xl text-xs shadow hover:bg-indigo-50 transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Monthly Payment</span>
            </button>
          </div>
        </div>

        {/* Tab Header & Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students Directory ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeTab === 'payments'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Payment Records & Receipts ({payments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Dues Analytics</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedStudentForDue(null);
                setShowDueModal(true);
              }}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate Dues</span>
            </button>
            <button
              onClick={() => {
                setEditingStudent(null);
                setShowStudentModal(true);
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student Profile</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Students Section */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, room, phone..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="resident">Residents Only</option>
                  <option value="former">Former Residents</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student & ID</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Department & Phone</th>
                    <th className="py-3 px-3 text-right">Monthly Fee</th>
                    <th className="py-3 px-3 text-right">Outstanding Due</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {loading ? 'Loading students...' : 'No students matching the criteria found.'}
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-sm">{student.name}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{student.student_id}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {student.room_number}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{student.department || 'General'}</div>
                          <div className="text-slate-500 text-[11px]">{student.phone}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {student.monthly_fee.toLocaleString()} ৳
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`font-bold ${
                              student.total_due && student.total_due > 0
                                ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'
                                : 'text-emerald-600'
                            }`}
                          >
                            {student.total_due ? `${student.total_due.toLocaleString()} ৳` : '0 ৳ (Clear)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              student.status === 'resident'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setProfileModalStudentId(student.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1"
                              title="View Full Profile, Dues & History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Profile</span>
                            </button>

                            {student.status === 'resident' && (
                              <button
                                onClick={() => {
                                  setSelectedStudentForPayment(student);
                                  setShowPaymentModal(true);
                                }}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 border border-indigo-200"
                                title="Add Monthly Payment"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedStudentForDue(student);
                                setShowDueModal(true);
                              }}
                              className="px-2 py-1 hover:bg-amber-50 text-amber-700 rounded-lg text-xs transition cursor-pointer"
                              title="Add Due/Fine"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Payments & Receipts Records */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Payment Collection Records</h3>
                <p className="text-xs text-slate-500">
                  Every transaction here provides instant 1-page triplicate PDF printing (Office, Student, Preservation copies).
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentForPayment(null);
                  setShowPaymentModal(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Monthly Payment</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Billing Month</th>
                    <th className="py-3 px-3">Date Paid</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-center">Receipt PDF Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No payments recorded yet. Click &quot;New Monthly Payment&quot; to begin.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {p.receipt_no}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {p.student_name}
                          <span className="block font-mono text-[11px] text-slate-400 font-normal">
                            {p.student_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{p.room_number}</td>
                        <td className="py-3 px-3 font-semibold text-indigo-600">{p.month_year}</td>
                        <td className="py-3 px-3 text-slate-600">{new Date(p.paid_at).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                          {p.amount_paid.toLocaleString()} ৳
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setActiveReceiptPayment(p)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer inline-flex items-center space-x-1.5"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Print 3-Part Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Dues & Balances Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Top Outstanding Student Dues</h3>
                  <p className="text-xs text-slate-500">Students with highest pending amounts</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudentForDue(null);
                    setShowDueModal(true);
                  }}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200 hover:bg-amber-100 cursor-pointer"
                >
                  Generate Dues
                </button>
              </div>

              <div className="space-y-3">
                {recentDuesList.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No pending dues found! All clear.</p>
                ) : (
                  recentDuesList.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{st.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Room: {st.room_number} • ID: {st.student_id} • Phone: {st.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-600 text-sm">{st.total_due.toLocaleString()} ৳</span>
                        <div className="mt-1">
                          <button
                            onClick={() => setProfileModalStudentId(st.id)}
                            className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                          >
                            View Breakdown →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">Automated Monthly Billing Policy</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The hostel management portal allows the manager to post individual dues or trigger a
                  <strong> bulk monthly charge</strong> across all current residents with a single click.
                </p>
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                  <p className="font-semibold">Receipt Triplicate System:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li><strong>Part 1: Office Copy</strong> - Stored in hall registry for audits.</li>
                    <li><strong>Part 2: Student Copy</strong> - Handed to the resident with signature stamp.</li>
                    <li><strong>Part 3: Preservation Copy</strong> - Retained by Accounts division archive.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Database: SQLite 3 (WAL mode)</span>
                <span>Role: Hall Provost / Accounts Manager</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          students={students}
          preSelectedStudent={selectedStudentForPayment}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(payment) => {
            setShowPaymentModal(false);
            fetchData();
            setActiveReceiptPayment(payment);
          }}
        />
      )}

      {/* 2. Student Add/Edit Modal */}
      {showStudentModal && (
        <StudentModal
          student={editingStudent}
          onClose={() => setShowStudentModal(false)}
          onSuccess={() => {
            setShowStudentModal(false);
            fetchData();
          }}
        />
      )}

      {/* 3. Due Creation Modal */}
      {showDueModal && (
        <DueModal
          students={students}
          preSelectedStudent={selectedStudentForDue}
          onClose={() => setShowDueModal(false)}
          onSuccess={() => {
            setShowDueModal(false);
            fetchData();
          }}
        />
      )}

      {/* 4. Student Full Profile Modal */}
      {profileModalStudentId && (
        <StudentProfileModal
          studentId={profileModalStudentId}
          onClose={() => setProfileModalStudentId(null)}
          onAddPayment={(student) => {
            setProfileModalStudentId(null);
            setSelectedStudentForPayment(student);
            setShowPaymentModal(true);
          }}
          onAddDue={(student) => {
            setProfileModalStudentId(null);
            setSelectedStudentForDue(student);
            setShowDueModal(true);
          }}
          onPrintReceipt={(payment) => {
            setActiveReceiptPayment(payment);
          }}
        />
      )}

      {/* 5. Printable Triplicate Receipt Modal */}
      {activeReceiptPayment && (
        <PrintableReceiptModal
          payment={activeReceiptPayment}
          onClose={() => setActiveReceiptPayment(null)}
        />
      )}
    </div>
  );
}
