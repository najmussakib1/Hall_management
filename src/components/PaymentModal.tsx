'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Student, Payment, Due } from '@/types';

interface PaymentModalProps {
  students: Student[];
  preSelectedStudent?: Student | null;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export default function PaymentModal({
  students,
  preSelectedStudent,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const residentStudents = students.filter((s) => s.status === 'resident');
  const defaultStudent = preSelectedStudent || residentStudents[0];

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedStudentId, setSelectedStudentId] = useState<number>(defaultStudent ? defaultStudent.id : 0);
  const [studentDues, setStudentDues] = useState<Due[]>([]);
  const [loadingDues, setLoadingDues] = useState<boolean>(false);
  const [selectedDueId, setSelectedDueId] = useState<number | null>(null);

  const [monthYear, setMonthYear] = useState<string>(currentMonth);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Load unpaid / active dues whenever selected student changes
  useEffect(() => {
    if (!selectedStudentId) return;

    let isMounted = true;
    async function fetchDues() {
      setLoadingDues(true);
      try {
        const res = await fetch(`/api/dues?student_id=${selectedStudentId}&status=unpaid`);
        const data = await res.json();
        if (isMounted && data.success) {
          const dues: Due[] = data.dues || [];
          setStudentDues(dues);

          if (dues.length > 0) {
            // Pick the latest added due as the default selection!
            const latestDue = dues[0];
            setSelectedDueId(latestDue.id);
            const remaining = typeof latestDue.remaining_amount === 'number' 
              ? latestDue.remaining_amount 
              : latestDue.amount - (latestDue.paid_amount || 0);
            
            // Set the default amount to the due's remaining amount
            setAmount(remaining.toString());
            if (latestDue.month_year) {
              setMonthYear(latestDue.month_year);
            }
          } else {
            // If student has no pending dues, default to student's regular monthly fee
            setSelectedDueId(null);
            const stud = students.find((s) => s.id === selectedStudentId);
            setAmount(stud ? stud.monthly_fee.toString() : '2000');
            setMonthYear(currentMonth);
          }
        }
      } catch (err) {
        console.error('Failed to load student dues:', err);
      } finally {
        if (isMounted) setLoadingDues(false);
      }
    }

    fetchDues();

    return () => {
      isMounted = false;
    };
  }, [selectedStudentId]);

  // When manager clicks a different due from the list
  const handleSelectDue = (due: Due) => {
    setSelectedDueId(due.id);
    const remaining = typeof due.remaining_amount === 'number'
      ? due.remaining_amount
      : due.amount - (due.paid_amount || 0);
    setAmount(remaining.toString());
    if (due.month_year) {
      setMonthYear(due.month_year);
    }
  };

  const handleCustomWithoutDue = () => {
    setSelectedDueId(null);
    if (selectedStudent) {
      setAmount(selectedStudent.monthly_fee.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError('Please select a resident student');
      return;
    }

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentId,
          month_year: monthYear,
          amount_paid: parsed,
          due_id: selectedDueId,
          payment_method: paymentMethod,
          transaction_id: transactionId || null,
          remarks: remarks || null,
          received_by: 'Hall Manager',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process payment');
      }

      onSuccess(data.payment);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Month options for quick pick
  const monthOptions = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    monthOptions.push(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
  }

  const selectedDue = studentDues.find((d) => d.id === selectedDueId);
  const selectedDueRemaining = selectedDue
    ? (typeof selectedDue.remaining_amount === 'number' ? selectedDue.remaining_amount : selectedDue.amount - (selectedDue.paid_amount || 0))
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-200" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">Receive Payment & Settle Due</h3>
              <p className="text-xs text-indigo-200">Automatically settles dues and generates 3-part receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-indigo-600/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Select Resident Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm bg-slate-50 font-medium text-slate-800"
              required
            >
              {residentStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — Room {st.room_number} ({st.student_id}) [Total Due: {st.total_due || 0} ৳]
                </option>
              ))}
            </select>
          </div>

          {/* Dues Selection Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Due to Settle</span>
              </span>
              {loadingDues && <span className="text-[11px] text-slate-400">Loading dues...</span>}
            </div>

            {studentDues.length === 0 ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No outstanding unpaid dues for this student. Recording general monthly payment.</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {studentDues.map((d, index) => {
                  const rem = typeof d.remaining_amount === 'number' ? d.remaining_amount : d.amount - (d.paid_amount || 0);
                  const isSelected = selectedDueId === d.id;
                  const isLatest = index === 0;

                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDue(d)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="selectedDue"
                          checked={isSelected}
                          onChange={() => handleSelectDue(d)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-900">{d.title}</span>
                            {isLatest && (
                              <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-bold rounded-sm uppercase tracking-wide">
                                Latest Due
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {d.month_year || 'General'} • Status: <span className="capitalize font-medium text-amber-700">{d.status}</span>
                            {d.paid_amount && d.paid_amount > 0 ? ` (Already paid: ${d.paid_amount} ৳)` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-amber-700 text-sm block">{rem} ৳</span>
                        <span className="text-[10px] text-slate-400">Due Remaining</span>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleCustomWithoutDue}
                  className={`w-full py-1 text-center text-xs rounded transition cursor-pointer ${
                    selectedDueId === null
                      ? 'text-indigo-700 font-bold bg-indigo-50 border border-indigo-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Or enter unlinked advance / general payment
                </button>
              </div>
            )}
          </div>

          {/* Month and Amount Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Month / Period *
              </label>
              <select
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Amount Paid (৳) *
                </label>
                {selectedDueRemaining !== null && (
                  <button
                    type="button"
                    onClick={() => setAmount(selectedDueRemaining.toString())}
                    className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Exact Due: {selectedDueRemaining}৳
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (e.g. 2500)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm font-bold text-indigo-900 bg-white"
                required
              />
            </div>
          </div>

          {/* Due Settlement Preview */}
          {selectedDueRemaining !== null && parseFloat(amount) > 0 && (
            <div className="p-2.5 rounded-lg text-xs border bg-amber-50/70 border-amber-200 text-amber-900 flex items-center justify-between">
              <div>
                <span>Due before payment: <strong>{selectedDueRemaining} ৳</strong></span>
                <span className="mx-2 text-slate-400">→</span>
                <span>
                  After payment of <strong>{amount} ৳</strong>:
                </span>
              </div>
              <span className="font-bold text-sm">
                {selectedDueRemaining - parseFloat(amount) <= 0 ? (
                  <span className="text-emerald-700">✓ Fully Cleared (0 ৳)</span>
                ) : (
                  <span className="text-amber-800">{(selectedDueRemaining - parseFloat(amount)).toLocaleString()} ৳ Remaining</span>
                )}
              </span>
            </div>
          )}

          {/* Payment Method & Trx ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm"
              >
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Trx ID / Ref No
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Remarks / Note
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared monthly hostel fee"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Updating Dues & Processing...' : 'Pay & Update Dues'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
