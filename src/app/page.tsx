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
  BarChart3,
  ShieldCheck,
  Building2,
  Layers,
} from 'lucide-react';
import { Student, Payment, ManagerUser, Hall } from '@/types';
import LoginForm from '@/components/LoginForm';
import PrintableReceiptModal from '@/components/PrintableReceiptModal';
import PaymentModal from '@/components/PaymentModal';
import StudentModal from '@/components/StudentModal';
import DueModal from '@/components/DueModal';
import StudentProfileModal from '@/components/StudentProfileModal';
import SuperadminAnalytics from '@/components/SuperadminAnalytics';
import ManagersDirectory from '@/components/ManagersDirectory';
import ManagerModal from '@/components/ManagerModal';
import HallModal from '@/components/HallModal';

export default function AppHome() {
  const [currentUser, setCurrentUser] = useState<ManagerUser | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'managers' | 'students' | 'payments' | 'overview'>('students');

  // Multi-hall state
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallFilter, setSelectedHallFilter] = useState<string>('all');
  const [managers, setManagers] = useState<ManagerUser[]>([]);

  // Analytics states
  const [hallStats, setHallStats] = useState<any[]>([]);
  const [monthlyCollections, setMonthlyCollections] = useState<any[]>([]);
  const [methodDistribution, setMethodDistribution] = useState<any[]>([]);

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>({
    totalHalls: 0,
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

  // Superadmin modals
  const [showHallModal, setShowHallModal] = useState<boolean>(false);
  const [showManagerModal, setShowManagerModal] = useState<boolean>(false);
  const [editingManager, setEditingManager] = useState<ManagerUser | null>(null);

  // Check login session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hostel_manager_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'superadmin') {
          setActiveTab('analytics');
          setSelectedHallFilter('all');
        } else if (parsed.hall_id) {
          setSelectedHallFilter(parsed.hall_id.toString());
          setActiveTab('students');
        }
      } catch (e) {
        localStorage.removeItem('hostel_manager_user');
      }
    }
  }, []);

  // Fetch halls & managers
  const fetchHallsAndManagers = async () => {
    try {
      const [hallRes, mgrRes] = await Promise.all([
        fetch('/api/halls'),
        fetch('/api/managers'),
      ]);
      const hallData = await hallRes.json();
      const mgrData = await mgrRes.json();
      if (hallData.success) setHalls(hallData.halls);
      if (mgrData.success) setManagers(mgrData.managers);
    } catch (err) {
      console.error('Error fetching halls/managers:', err);
    }
  };

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      const hallParam = currentUser?.role === 'superadmin' ? selectedHallFilter : (currentUser?.hall_id ? currentUser.hall_id.toString() : 'all');

      // 1. Fetch Students
      const studentRes = await fetch(`/api/students?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}&hall_id=${hallParam}`);
      const studentData = await studentRes.json();
      if (studentData.success) {
        setStudents(studentData.students);
      }

      // 2. Fetch Payments
      const paymentRes = await fetch(`/api/payments?limit=50&hall_id=${hallParam}`);
      const paymentData = await paymentRes.json();
      if (paymentData.success) {
        setPayments(paymentData.payments);
      }

      // 3. Fetch Stats & Graph Breakdown
      const statRes = await fetch(`/api/stats?hall_id=${hallParam}`);
      const statData = await statRes.json();
      if (statData.success) {
        setStats(statData.stats);
        setHallStats(statData.hallStats || []);
        setMonthlyCollections(statData.monthlyCollections || []);
        setMethodDistribution(statData.methodDistribution || []);
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
      fetchHallsAndManagers();
      fetchData();
    }
  }, [currentUser, selectedHallFilter, statusFilter, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('hostel_manager_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLoginSuccess={(user) => {
      setCurrentUser(user);
      if (user.role === 'superadmin') {
        setActiveTab('analytics');
        setSelectedHallFilter('all');
      } else {
        setSelectedHallFilter(user.hall_id ? user.hall_id.toString() : '1');
        setActiveTab('students');
      }
    }} />;
  }

  const isSuperadmin = currentUser.role === 'superadmin';
  const assignedHall = halls.find((h) => h.id === currentUser.hall_id);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${isSuperadmin ? 'bg-purple-600' : 'bg-indigo-600'}`}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base leading-tight">
                  {isSuperadmin
                    ? 'University Multi-Hall Management System'
                    : assignedHall ? `${assignedHall.name} (${assignedHall.code})` : 'Hall & Hostel Management'}
                </h1>
                {isSuperadmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                    Superadmin Central
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Hall Manager Portal
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isSuperadmin
                  ? 'Central Superadmin Oversight • All Halls & Finance Controls'
                  : `Provost / Manager Office • Hall Code: ${assignedHall?.code || 'N/A'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{currentUser.name}</p>
              <span className={`text-[10px] uppercase tracking-wider font-mono ${isSuperadmin ? 'text-purple-400' : 'text-indigo-400'}`}>
                {isSuperadmin ? 'Superadmin Authority' : `Assigned: ${assignedHall?.code || 'Manager'}`}
              </span>
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
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex flex-wrap space-x-1 bg-slate-100 p-1 rounded-xl">
            {isSuperadmin && (
              <>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                    activeTab === 'analytics'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Central Analytics & Graphs</span>
                </button>
                <button
                  onClick={() => setActiveTab('managers')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                    activeTab === 'managers'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Managers & Accounts ({managers.length})</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-xs'
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
                  ? 'bg-indigo-600 text-white shadow-xs'
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
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Dues Analytics</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedStudentForPayment(null);
                setShowPaymentModal(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Receive Payment</span>
            </button>
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
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: SUPERADMIN ANALYTICS TAB */}
        {activeTab === 'analytics' && isSuperadmin && (
          <SuperadminAnalytics
            stats={stats}
            halls={halls}
            hallStats={hallStats}
            monthlyCollections={monthlyCollections}
            methodDistribution={methodDistribution}
            selectedHallFilter={selectedHallFilter}
            onSelectHallFilter={(hallId) => setSelectedHallFilter(hallId)}
            onOpenCreateHall={() => setShowHallModal(true)}
            onOpenCreateManager={() => {
              setEditingManager(null);
              setShowManagerModal(true);
            }}
          />
        )}

        {/* VIEW 2: SUPERADMIN MANAGERS & ACCOUNTS DIRECTORY */}
        {activeTab === 'managers' && isSuperadmin && (
          <ManagersDirectory
            managers={managers}
            halls={halls}
            onOpenCreateManager={() => {
              setEditingManager(null);
              setShowManagerModal(true);
            }}
            onEditManager={(mgr) => {
              setEditingManager(mgr);
              setShowManagerModal(true);
            }}
          />
        )}

        {/* VIEW 3: STUDENTS DIRECTORY */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* KPI Banner for selected hall or global */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Residents</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.residentStudents}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Total Registered: {stats.totalStudents}</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dues Pending</p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.totalDue.toLocaleString()} ৳</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Unsettled hall charges</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
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

            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              {/* Filter and Search Bar */}
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, ID, room, phone..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {/* Hall filter dropdown if superadmin */}
                  {isSuperadmin && (
                    <select
                      value={selectedHallFilter}
                      onChange={(e) => setSelectedHallFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                    >
                      <option value="all">All Halls</option>
                      {halls.map((h) => (
                        <option key={h.id} value={h.id.toString()}>
                          {h.name} ({h.code})
                        </option>
                      ))}
                    </select>
                  )}

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
                      <th className="py-3 px-3">Hall & Room</th>
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
                          {loading ? 'Loading students...' : 'No students found.'}
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
                            <span className="block text-[10px] text-purple-700 font-bold mt-1">
                              {student.hall_code || 'SBH'}
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
          </div>
        )}

        {/* VIEW 4: PAYMENTS & RECEIPTS TAB */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Payment Collection Records & Printable Receipts</h3>
                <p className="text-xs text-slate-500">
                  Every transaction generates a 1-page A4 triplicate receipt (Office, Student, Preservation copies).
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
                    <th className="py-3 px-3">Student & Hall</th>
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
                        No payments recorded yet.
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
                            {p.student_code} • <strong className="text-purple-700">{p.hall_code || 'SBH'}</strong>
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

        {/* VIEW 5: DUES OVERVIEW TAB */}
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
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-slate-900 text-xs">{st.name}</p>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                            {st.hall_code || 'SBH'}
                          </span>
                        </div>
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
                  Provosts and hall managers can charge specific student dues or trigger
                  <strong> bulk monthly billing</strong> across all active residents of their hall.
                </p>
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                  <p className="font-semibold">Receipt Triplicate System:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li><strong>Part 1: Office Copy</strong> - Stored in hall registry for audits.</li>
                    <li><strong>Part 2: Student Copy</strong> - Handed to the resident with signature stamp.</li>
                    <li><strong>Part 3: Preservation Copy</strong> - Retained by university accounts archive.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Database: SQLite 3 Multi-Hall Architecture</span>
                <span>Active User: {currentUser.name}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
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

      {showStudentModal && (
        <StudentModal
          halls={halls}
          defaultHallId={currentUser.hall_id || 1}
          student={editingStudent}
          onClose={() => setShowStudentModal(false)}
          onSuccess={() => {
            setShowStudentModal(false);
            fetchData();
          }}
        />
      )}

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

      {activeReceiptPayment && (
        <PrintableReceiptModal
          payment={activeReceiptPayment}
          onClose={() => setActiveReceiptPayment(null)}
        />
      )}

      {/* Superadmin Hall Creation Modal */}
      {showHallModal && (
        <HallModal
          onClose={() => setShowHallModal(false)}
          onSuccess={() => {
            setShowHallModal(false);
            fetchHallsAndManagers();
            fetchData();
          }}
        />
      )}

      {/* Superadmin Manager Account Creation/Edit Modal */}
      {showManagerModal && (
        <ManagerModal
          halls={halls}
          manager={editingManager}
          onClose={() => setShowManagerModal(false)}
          onSuccess={() => {
            setShowManagerModal(false);
            fetchHallsAndManagers();
            fetchData();
          }}
        />
      )}
    </div>
  );
}
