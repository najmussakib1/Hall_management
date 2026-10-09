'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Users,
  Coins,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Printer,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  DoorOpen,
  Receipt,
  FileText
} from 'lucide-react';
import { Hall, Student, Payment, Due } from '@/types';

interface HallDetailsViewProps {
  hallId: number;
  onBack: () => void;
  onOpenPaymentModal: (student?: Student | null) => void;
  onOpenDueModal: (student?: Student | null) => void;
  onOpenStudentProfile: (studentId: number) => void;
  onPrintReceipt: (payment: Payment) => void;
  onEditHall: (hall: Hall) => void;
}

export default function HallDetailsView({
  hallId,
  onBack,
  onOpenPaymentModal,
  onOpenDueModal,
  onOpenStudentProfile,
  onPrintReceipt,
  onEditHall,
}: HallDetailsViewProps) {
  const [hall, setHall] = useState<Hall | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'dues' | 'collected'>('students');

  // Search & Filters within hall
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('resident');
  const [dueStatusFilter, setDueStatusFilter] = useState<string>('unpaid');

  const fetchHallData = async () => {
    setLoading(true);
    try {
      const [hallsRes, studentsRes, paymentsRes, duesRes] = await Promise.all([
        fetch('/api/halls'),
        fetch(`/api/students?hall_id=${hallId}&status=all`),
        fetch(`/api/payments?hall_id=${hallId}&limit=100`),
        fetch(`/api/dues?hall_id=${hallId}&status=all`),
      ]);

      const hallsData = await hallsRes.json();
      const studentsData = await studentsRes.json();
      const paymentsData = await paymentsRes.json();
      const duesData = await duesRes.json();

      if (hallsData.success) {
        const found = hallsData.halls.find((h: Hall) => h.id === hallId);
        if (found) setHall(found);
      }
      if (studentsData.success) setStudents(studentsData.students);
      if (paymentsData.success) setPayments(paymentsData.payments);
      if (duesData.success) setDues(duesData.dues);
    } catch (err) {
      console.error('Failed to load hall details data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHallData();
  }, [hallId]);

  // Aggregate metrics
  const residentStudents = students.filter((s) => s.status === 'resident');
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalOutstandingDue = dues
    .filter((d) => d.status === 'unpaid' || d.status === 'partially_paid')
    .reduce((sum, d) => sum + (d.remaining_amount !== undefined ? d.remaining_amount : d.amount - (d.paid_amount || 0)), 0);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Filtered Dues
  const filteredDues = dues.filter((d) => {
    if (dueStatusFilter !== 'all') {
      if (dueStatusFilter === 'unpaid' && d.status === 'paid') return false;
      if (dueStatusFilter === 'paid' && d.status !== 'paid') return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const stName = (d.student_name || '').toLowerCase();
      const stCode = (d.student_code || '').toLowerCase();
      const title = (d.title || '').toLowerCase();
      return stName.includes(term) || stCode.includes(term) || title.includes(term);
    }
    return true;
  });

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const stName = (p.student_name || '').toLowerCase();
      const rec = (p.receipt_no || '').toLowerCase();
      return stName.includes(term) || rec.includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Clean Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center space-x-1"
            title="Back to Central Overview"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
            <span className="text-xs font-bold hidden sm:inline">Back to All Halls</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider font-mono">
                {hall?.code || 'HALL'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {hall?.name || 'Hall Management'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Campus Location: <strong className="text-slate-700">{hall?.location || 'Central Quad'}</strong> • Provost / Manager: <strong className="text-slate-800">{hall?.manager_name || 'Unassigned'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hall && (
            <button
              onClick={() => onEditHall(hall)}
              className="px-3 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold border border-slate-300 hover:border-indigo-200 transition cursor-pointer flex items-center space-x-1.5"
            >
              <Coins className="w-4 h-4 text-indigo-600" />
              <span>Configure Monthly Fee</span>
            </button>
          )}
          <button
            onClick={() => onOpenDueModal(null)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Charge Due</span>
          </button>
          <button
            onClick={() => onOpenPaymentModal(null)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Receive Payment</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Residents / Capacity */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residents / Capacity</p>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <h3 className="text-2xl font-black text-slate-900">{residentStudents.length}</h3>
              <span className="text-xs text-slate-400 font-medium">/ {hall?.capacity || 400} beds</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Total Registered: {students.length} students</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Official Monthly Fee */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Monthly Fee</p>
            <h3 className="text-2xl font-black text-indigo-700 mt-1">
              {(hall?.monthly_fee || 2000).toLocaleString()} ৳
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Base standard for this hall</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Revenue</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {totalCollected.toLocaleString()} ৳
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{payments.length} verified transactions</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Outstanding Hall Dues */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unsettled Dues</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {totalOutstandingDue.toLocaleString()} ৳
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              {dues.filter((d) => d.status !== 'paid').length} pending due records
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Clean Navigation Section Tabs (Students, Dues, Collected) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/70">
          <div className="flex space-x-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('students')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Students Info ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('dues')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'dues'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Dues Info ({dues.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('collected')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'collected'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Collected Info ({payments.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, ID, room, phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {activeSubTab === 'students' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="resident">Residents Only</option>
                <option value="former">Former Residents</option>
              </select>
            )}

            {activeSubTab === 'dues' && (
              <select
                value={dueStatusFilter}
                onChange={(e) => setDueStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
              >
                <option value="all">All Dues</option>
                <option value="unpaid">Unpaid / Partially Paid</option>
                <option value="paid">Fully Settled</option>
              </select>
            )}
          </div>
        </div>

        {/* 1. STUDENTS INFO TAB */}
        {activeSubTab === 'students' && (
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
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No students found for this hall.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{st.student_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {st.room_number}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{st.department || 'General'}</div>
                        <div className="text-slate-500 text-[11px]">{st.phone}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {st.monthly_fee.toLocaleString()} ৳
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold ${
                            st.total_due && st.total_due > 0
                              ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'
                              : 'text-emerald-600'
                          }`}
                        >
                          {st.total_due ? `${st.total_due.toLocaleString()} ৳` : '0 ৳ (Clear)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            st.status === 'resident'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onOpenStudentProfile(st.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </button>
                          {st.status === 'resident' && (
                            <button
                              onClick={() => onOpenPaymentModal(st)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 border border-indigo-200"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenDueModal(st)}
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
        )}

        {/* 2. DUES INFO TAB */}
        {activeSubTab === 'dues' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Due Purpose / Title</th>
                  <th className="py-3 px-3">Student & ID</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Billing Cycle</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-right">Paid Amount</th>
                  <th className="py-3 px-3 text-right">Remaining Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No dues found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredDues.map((d) => {
                    const remaining = d.remaining_amount !== undefined ? d.remaining_amount : d.amount - (d.paid_amount || 0);
                    return (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{d.title}</div>
                          <span className="text-[10px] text-slate-400">
                            Logged: {new Date(d.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900">{d.student_name}</span>
                          <span className="block font-mono text-[11px] text-slate-400">{d.student_code}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{d.room_number}</td>
                        <td className="py-3 px-3 font-semibold text-indigo-700">{d.month_year || 'General'}</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800">{d.amount.toLocaleString()} ৳</td>
                        <td className="py-3 px-3 text-right font-medium text-emerald-700">
                          {(d.paid_amount || 0).toLocaleString()} ৳
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-amber-700 text-sm">{remaining.toLocaleString()} ৳</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              d.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : d.status === 'partially_paid'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. COLLECTED REVENUE INFO TAB */}
        {activeSubTab === 'collected' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-3">Student & ID</th>
                  <th className="py-3 px-3">Room</th>
                  <th className="py-3 px-3">Billing Month</th>
                  <th className="py-3 px-3">Date Collected</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Print Triplicate Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payment records found for this hall yet.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{p.receipt_no}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{p.student_name}</span>
                        <span className="block font-mono text-[11px] text-slate-400">{p.student_code}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{p.room_number}</td>
                      <td className="py-3 px-3 font-semibold text-indigo-600">{p.month_year}</td>
                      <td className="py-3 px-3 text-slate-600">{new Date(p.paid_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-700 text-sm">
                        {p.amount_paid.toLocaleString()} ৳
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onPrintReceipt(p)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer inline-flex items-center space-x-1.5"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Print 3-Part PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
