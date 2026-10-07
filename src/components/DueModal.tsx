'use client';

import React, { useState } from 'react';
import { X, AlertCircle, PlusCircle } from 'lucide-react';
import { Student } from '@/types';

interface DueModalProps {
  students: Student[];
  preSelectedStudent?: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DueModal({
  students,
  preSelectedStudent,
  onClose,
  onSuccess,
}: DueModalProps) {
  const residentStudents = students.filter((s) => s.status === 'resident');
  const defaultStudent = preSelectedStudent || residentStudents[0];

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [isBulk, setIsBulk] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(defaultStudent ? defaultStudent.id : 0);
  const [title, setTitle] = useState<string>(`Monthly Fee - ${currentMonth}`);
  const [monthYear, setMonthYear] = useState<string>(currentMonth);
  const [amount, setAmount] = useState<string>(defaultStudent ? defaultStudent.monthly_fee.toString() : '2000');
  const [bulkFeeType, setBulkFeeType] = useState<'individual_default' | 'fixed'>('individual_default');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = isBulk
        ? {
            bulk_resident: true,
            title,
            month_year: monthYear,
            amount: bulkFeeType === 'individual_default' ? 'use_default' : amount,
          }
        : {
            student_id: selectedStudentId,
            title,
            month_year: monthYear,
            amount: parseFloat(amount),
          };

      const res = await fetch('/api/dues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record due');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-amber-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-200" />
            <h3 className="font-semibold text-lg">
              {isBulk ? 'Generate Monthly Dues for All Residents' : 'Add Fee / Due to Student'}
            </h3>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Toggle individual vs bulk */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsBulk(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${!isBulk ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Single Student Due
            </button>
            <button
              type="button"
              onClick={() => setIsBulk(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${isBulk ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Bulk Charge (All Residents)
            </button>
          </div>

          {!isBulk ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Select Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  setSelectedStudentId(id);
                  const s = students.find((st) => st.id === id);
                  if (s) setAmount(s.monthly_fee.toString());
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — Room {st.room_number} ({st.student_id}) [{st.status}]
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
              <p className="font-semibold">
                Will post this due record to all <strong>{residentStudents.length} active resident students</strong>.
              </p>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="bulkType"
                    checked={bulkFeeType === 'individual_default'}
                    onChange={() => setBulkFeeType('individual_default')}
                    className="text-amber-600"
                  />
                  <span>Charge each resident student their individual monthly seat fee</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="bulkType"
                    checked={bulkFeeType === 'fixed'}
                    onChange={() => setBulkFeeType('fixed')}
                    className="text-amber-600"
                  />
                  <span>Charge uniform fixed amount to everyone</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Due Title / Purpose *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Fee - October 2026, Mess Fee, Caution"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Month / Period
              </label>
              <input
                type="text"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="e.g. October 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Amount (BDT) {!isBulk || bulkFeeType === 'fixed' ? '*' : '(Ignored)'}
              </label>
              <input
                type="number"
                min="0"
                step="50"
                disabled={isBulk && bulkFeeType === 'individual_default'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Posting...' : isBulk ? 'Generate Dues' : 'Add Due'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
