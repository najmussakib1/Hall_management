'use client';

import React, { useEffect, useState } from 'react';
import { Printer, X, Loader2, FileText } from 'lucide-react';

interface PrintableReportModalProps {
  hallId: number;
  month: string;
  onClose: () => void;
}

const formatMonth = (month: string) => {
  const [year, m] = month.split('-').map((v) => parseInt(v, 10));
  return new Date(year, m - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
};

export default function PrintableReportModal({ hallId, month, onClose }: PrintableReportModalProps) {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/halls/${hallId}/report?month=${month}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load report');
        if (active) setReport(data);
      } catch (err: any) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [hallId, month]);

  const handlePrint = () => window.print();

  const money = (v: number) => `${(v || 0).toLocaleString()} ৳`;

  const dues = report?.dues || [];
  const payments = report?.payments || [];
  const summary = report?.summary || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar (Hidden during printing) */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {report?.hall?.name ? `${report.hall.name} — Monthly Report` : 'Hall Monthly Report'}
              </h2>
              <p className="text-xs text-slate-300">
                Billing period: {formatMonth(month)} • Printable A4 report
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              disabled={!report}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow flex items-center space-x-1.5 transition text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-4 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-sm font-medium">Generating report...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-red-600">
              <p className="text-sm font-semibold">Could not generate report</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
          ) : (
            <div
              id="printable-receipt-area"
              className="w-full bg-white shadow-lg p-6 border border-slate-200 text-slate-800 text-xs"
              style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-4">
                <div>
                  <h1 className="font-bold text-lg tracking-wide text-slate-900 uppercase">
                    {report.hall.name} / HOSTEL MANAGEMENT
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hall Code: <strong className="text-slate-700">{report.hall.code}</strong>
                    {report.hall.location ? ` • ${report.hall.location}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Provost / Manager: <strong className="text-slate-700">{report.hall.manager_name || 'Unassigned'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block font-semibold px-3 py-1 rounded text-[11px] uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Monthly Report
                  </span>
                  <p className="text-[11px] mt-2 text-slate-600">
                    Billing Period: <strong className="text-slate-900">{formatMonth(report.month)}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Generated: {new Date(report.generatedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-5">
                <h2 className="font-bold text-sm text-slate-900 mb-2">Hall Summary</h2>
                <div className="grid grid-cols-4 gap-3">
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Students</p>
                    <p className="text-lg font-bold text-slate-900">{summary.totalStudents}</p>
                  </div>
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Paid This Month</p>
                    <p className="text-lg font-bold text-emerald-700">{summary.paidStudentsCount}</p>
                  </div>
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Pending Students</p>
                    <p className="text-lg font-bold text-amber-700">{summary.pendingStudentsCount}</p>
                  </div>
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Collected</p>
                    <p className="text-lg font-bold text-emerald-700">{money(summary.totalCollected)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Dues Billed</p>
                    <p className="text-sm font-bold text-slate-900">{money(summary.totalDueBilled)}</p>
                  </div>
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Outstanding Due</p>
                    <p className="text-sm font-bold text-amber-700">{money(summary.totalDueAmount)}</p>
                  </div>
                  <div className="border border-slate-200 rounded p-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Due Records / Payments</p>
                    <p className="text-sm font-bold text-slate-900">
                      {summary.dueCount} / {summary.paymentCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dues Table */}
              <div className="mb-5">
                <h2 className="font-bold text-sm text-slate-900 mb-1.5">
                  Dues Logged — {formatMonth(report.month)}
                </h2>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-1 px-2 border-b border-slate-200">Title</th>
                      <th className="py-1 px-2 border-b border-slate-200">Student</th>
                      <th className="py-1 px-2 border-b border-slate-200">ID / Roll</th>
                      <th className="py-1 px-2 border-b border-slate-200">Room</th>
                      <th className="py-1 px-2 border-b border-slate-200 text-right">Amount</th>
                      <th className="py-1 px-2 border-b border-slate-200 text-right">Paid</th>
                      <th className="py-1 px-2 border-b border-slate-200 text-right">Remaining</th>
                      <th className="py-1 px-2 border-b border-slate-200 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dues.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-3 px-2 text-center text-slate-400">
                          No dues recorded for this month.
                        </td>
                      </tr>
                    ) : (
                      dues.map((d: any) => (
                        <tr key={d.id} className="border-b border-slate-100">
                          <td className="py-1 px-2 font-medium">{d.title}</td>
                          <td className="py-1 px-2">{d.student_name}</td>
                          <td className="py-1 px-2 font-mono">{d.student_code}</td>
                          <td className="py-1 px-2">{d.room_number}</td>
                          <td className="py-1 px-2 text-right">{money(d.amount)}</td>
                          <td className="py-1 px-2 text-right">{money(d.paid_amount || 0)}</td>
                          <td className="py-1 px-2 text-right font-semibold text-amber-700">
                            {money(d.remaining_amount ?? d.amount - (d.paid_amount || 0))}
                          </td>
                          <td className="py-1 px-2 text-center capitalize">{String(d.status).replace('_', ' ')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payments Table */}
              <div className="mb-5">
                <h2 className="font-bold text-sm text-slate-900 mb-1.5">
                  Payments Received — {formatMonth(report.month)}
                </h2>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-1 px-2 border-b border-slate-200">Receipt No</th>
                      <th className="py-1 px-2 border-b border-slate-200">Student</th>
                      <th className="py-1 px-2 border-b border-slate-200">Room</th>
                      <th className="py-1 px-2 border-b border-slate-200">Billing Month</th>
                      <th className="py-1 px-2 border-b border-slate-200">Method</th>
                      <th className="py-1 px-2 border-b border-slate-200">Date</th>
                      <th className="py-1 px-2 border-b border-slate-200 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-3 px-2 text-center text-slate-400">
                          No payments recorded for this month.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p: any) => (
                        <tr key={p.id} className="border-b border-slate-100">
                          <td className="py-1 px-2 font-mono">{p.receipt_no}</td>
                          <td className="py-1 px-2">{p.student_name}</td>
                          <td className="py-1 px-2">{p.room_number}</td>
                          <td className="py-1 px-2">{p.month_year}</td>
                          <td className="py-1 px-2">{p.payment_method}</td>
                          <td className="py-1 px-2">{new Date(p.paid_at).toLocaleDateString()}</td>
                          <td className="py-1 px-2 text-right font-semibold text-emerald-700">
                            {money(p.amount_paid)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {payments.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={6} className="py-1 px-2 text-right">Total Collected</td>
                        <td className="py-1 px-2 text-right text-emerald-700">{money(summary.totalCollected)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Signatures Footer */}
              <div className="pt-8 mt-6 border-t border-dashed border-slate-300 grid grid-cols-3 text-center text-[10px] text-slate-500">
                <div>
                  <div className="border-t border-slate-400 mx-4 pt-1">Hall Accountant</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-4 pt-1 font-medium text-slate-700">
                    Provost / Hall Manager
                  </div>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-4 pt-1">Central Accounts / Seal</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
