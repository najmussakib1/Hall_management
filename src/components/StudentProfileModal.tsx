'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  User,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { Student, Payment, Due } from '@/types';

interface StudentProfileModalProps {
  studentId: number;
  onClose: () => void;
  onAddPayment: (student: Student) => void;
  onAddDue: (student: Student) => void;
  onPrintReceipt: (payment: Payment) => void;
}

export default function StudentProfileModal({
  studentId,
  onClose,
  onAddPayment,
  onAddDue,
  onPrintReceipt,
}: StudentProfileModalProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'dues'>('payments');

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/${studentId}`);
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
          setPayments(data.payments);
          setDues(data.dues);
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [studentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-slate-600 font-medium">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const unpaidDues = dues.filter((d) => d.status === 'unpaid');
  const paidDues = dues.filter((d) => d.status === 'paid');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xl font-bold text-white shadow-inner">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">{student.name}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                    student.status === 'resident'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 text-slate-300 border border-slate-600'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                ID: {student.student_id} • Room: <strong className="text-indigo-300">{student.room_number}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action quick bar & metrics summary */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Monthly Seat Fee</span>
              <span className="font-bold text-slate-800">{student.monthly_fee.toLocaleString()} ৳</span>
            </div>
            <div className="border-l pl-4 border-slate-200">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Outstanding Dues</span>
              <span className={`font-bold ${student.total_due && student.total_due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {student.total_due ? student.total_due.toLocaleString() : 0} ৳
              </span>
            </div>
            <div className="border-l pl-4 border-slate-200">
              <span className="text-slate-500 text-xs uppercase tracking-wider block">Total Paid to Date</span>
              <span className="font-bold text-slate-900">{student.total_paid ? student.total_paid.toLocaleString() : 0} ৳</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {student.status === 'resident' && (
              <button
                onClick={() => onAddPayment(student)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Add Monthly Payment</span>
              </button>
            )}
            <button
              onClick={() => onAddDue(student)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Charge Due / Fee</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-500 flex items-center space-x-1">
                <User className="w-3.5 h-3.5" /> <span>Academic Information</span>
              </span>
              <p><strong className="text-slate-700">Department:</strong> {student.department || 'Not recorded'}</p>
              <p><strong className="text-slate-700">Session:</strong> {student.session || 'Not recorded'}</p>
              <p><strong className="text-slate-700">Admission Date:</strong> {student.admission_date}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-slate-500 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5" /> <span>Student Contact</span>
              </span>
              <p><strong className="text-slate-700">Phone:</strong> {student.phone}</p>
              <p><strong className="text-slate-700">Email:</strong> {student.email || 'N/A'}</p>
              <p><strong className="text-slate-700">Room No:</strong> {student.room_number}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-slate-500 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" /> <span>Guardian Info</span>
              </span>
              <p><strong className="text-slate-700">Guardian Name:</strong> {student.guardian_name || 'Not provided'}</p>
              <p><strong className="text-slate-700">Guardian Phone:</strong> {student.guardian_phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Navigation Tabs for History */}
          <div>
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-4 text-sm font-semibold border-b-2 cursor-pointer flex items-center space-x-2 transition ${
                  activeTab === 'payments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Full Payment History ({payments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('dues')}
                className={`py-2 px-4 text-sm font-semibold border-b-2 cursor-pointer flex items-center space-x-2 transition ${
                  activeTab === 'dues'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Dues & Charges Record ({dues.length})</span>
                {unpaidDues.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                    {unpaidDues.length} Unpaid
                  </span>
                )}
              </button>
            </div>

            {/* Payments List */}
            {activeTab === 'payments' && (
              <div className="mt-4">
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No payment transactions recorded for this student yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Receipt No</th>
                          <th className="py-2.5 px-3">Billing Month</th>
                          <th className="py-2.5 px-3">Date Paid</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3 text-right">Amount Paid</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                              {p.receipt_no}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-indigo-700">
                              {p.month_year}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {new Date(p.paid_at).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {p.payment_method}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {p.amount_paid.toLocaleString()} ৳
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  onPrintReceipt({
                                    ...p,
                                    student_name: student.name,
                                    student_code: student.student_id,
                                    room_number: student.room_number,
                                    student_phone: student.phone,
                                    student_department: student.department || '',
                                    remaining_due: student.total_due || 0,
                                  });
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-black text-white rounded text-[11px] font-medium inline-flex items-center space-x-1 transition cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>3-Part Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Dues List */}
            {activeTab === 'dues' && (
              <div className="mt-4">
                {dues.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No dues or fees posted for this student.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Title / Description</th>
                          <th className="py-2.5 px-3">Applicable Month</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Total Due</th>
                          <th className="py-2.5 px-3 text-right">Paid</th>
                          <th className="py-2.5 px-3 text-right">Remaining</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dues.map((d) => {
                          const paid = d.paid_amount || 0;
                          const rem = Math.max(0, d.amount - paid);
                          return (
                            <tr key={d.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {d.title}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {d.month_year || '—'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    d.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : d.status === 'partially_paid'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {d.status === 'paid' ? '✓ Paid' : d.status === 'partially_paid' ? '◐ Partial' : '● Unpaid'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-700">
                                {d.amount.toLocaleString()} ৳
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                                {paid > 0 ? `${paid.toLocaleString()} ৳` : '0 ৳'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {rem > 0 ? (
                                  <span className="text-amber-700">{rem.toLocaleString()} ৳</span>
                                ) : (
                                  <span className="text-emerald-700">0 ৳</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {rem > 0 && student.status === 'resident' && (
                                  <button
                                    onClick={() => onAddPayment(student)}
                                    className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-medium transition cursor-pointer"
                                  >
                                    Pay Due
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
