'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { Payment } from '@/types';

interface PrintableReceiptProps {
  payment: Payment & {
    student_phone?: string;
    student_department?: string;
    student_session?: string;
    remaining_due?: number;
  };
  onClose: () => void;
}

export default function PrintableReceiptModal({ payment, onClose }: PrintableReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(payment.paid_at || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderReceiptVoucher = (copyTitle: string, badgeColor: string) => (
    <div className="border border-slate-300 rounded p-3 text-xs bg-white text-slate-800 flex flex-col justify-between h-[31.5%] relative">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start border-b border-slate-200 pb-1.5 mb-2">
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
              {payment.hall_name ? `${payment.hall_name.toUpperCase()} / HOSTEL MANAGEMENT` : 'UNIVERSITY HALL / HOSTEL MANAGEMENT'}
            </h1>
            <p className="text-[10px] text-slate-500">Hall Administration & Accounts Section</p>
          </div>
          <div className="text-right">
            <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${badgeColor}`}>
              {copyTitle}
            </span>
            <p className="text-[10px] text-slate-600 mt-0.5 font-mono">#{payment.receipt_no}</p>
          </div>
        </div>

        {/* Student & Payment Info Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 text-[11px]">
          <div>
            <span className="text-slate-500 font-medium">Student Name: </span>
            <span className="font-semibold text-slate-900">{payment.student_name}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Date & Time: </span>
            <span className="text-slate-900">{formattedDate}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Student ID / Roll: </span>
            <span className="font-mono font-semibold text-slate-900">{payment.student_code}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Room Number: </span>
            <span className="font-semibold text-slate-900">{payment.room_number}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Department: </span>
            <span className="text-slate-900">{payment.student_department || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Billing Period: </span>
            <span className="font-semibold text-indigo-700">{payment.month_year}</span>
          </div>
        </div>

        {/* Amount Table */}
        <div className="border border-slate-200 rounded overflow-hidden mb-2">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-1 px-2">Description / Purpose</th>
                <th className="py-1 px-2 text-center">Payment Method</th>
                <th className="py-1 px-2 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-2 font-medium">
                  Hostel Accommodation & Monthly Fee ({payment.month_year})
                  {payment.remarks && <span className="block text-[10px] text-slate-500 font-normal italic">Note: {payment.remarks}</span>}
                </td>
                <td className="py-1 px-2 text-center text-slate-600">
                  {payment.payment_method} {payment.transaction_id ? `(${payment.transaction_id})` : ''}
                </td>
                <td className="py-1 px-2 text-right font-bold text-slate-900">
                  {payment.amount_paid.toLocaleString()} ৳
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Due status notice */}
        <div className="flex justify-between items-center text-[10px] text-slate-600 px-1">
          <div>
            {typeof payment.remaining_due === 'number' && payment.remaining_due > 0 ? (
              <span className="text-amber-700 font-semibold">
                ⚠️ Outstanding Balance / Dues: {payment.remaining_due.toLocaleString()} ৳
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ Dues status: Clear for this period</span>
            )}
          </div>
          <div>
            <span>Received By: <strong className="text-slate-800">{payment.received_by || 'Hall Accounts Manager'}</strong></span>
          </div>
        </div>
      </div>

      {/* Signatures Footer */}
      <div className="pt-2 border-t border-dashed border-slate-300 grid grid-cols-3 text-center text-[10px] text-slate-500 mt-1">
        <div>
          <div className="h-5"></div>
          <div className="border-t border-slate-400 mx-2 pt-0.5">Student Signature</div>
        </div>
        <div>
          <div className="h-5"></div>
          <div className="border-t border-slate-400 mx-2 pt-0.5">Hall Accountant</div>
        </div>
        <div>
          <div className="h-5"></div>
          <div className="border-t border-slate-400 mx-2 pt-0.5 font-medium text-slate-700">Provost / Seal</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar (Hidden during printing) */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Official Money Receipt #{payment.receipt_no}</h2>
              <p className="text-xs text-slate-300">
                1-Page Triplicate Printout: Office Copy, Student Copy, and Preservation Copy
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow flex items-center space-x-1.5 transition text-sm cursor-pointer"
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
          <div
            id="printable-receipt-area"
            className="w-full bg-white shadow-lg p-5 flex flex-col justify-between border border-slate-200"
            style={{ width: '210mm', minHeight: '297mm', maxHeight: '297mm', boxSizing: 'border-box' }}
          >
            {/* PART 1: Office Copy */}
            {renderReceiptVoucher('OFFICE COPY', 'bg-blue-100 text-blue-800 border border-blue-200')}

            {/* Perforation Divider Line */}
            <div className="relative py-1 flex items-center justify-center my-1 print:my-0.5">
              <div className="border-t-2 border-dashed border-slate-300 w-full"></div>
              <span className="absolute bg-white px-3 text-[9px] font-mono text-slate-400 tracking-wider">
                ✂ CUT HERE ✂
              </span>
            </div>

            {/* PART 2: Student Copy */}
            {renderReceiptVoucher("STUDENT'S COPY", 'bg-emerald-100 text-emerald-800 border border-emerald-200')}

            {/* Perforation Divider Line */}
            <div className="relative py-1 flex items-center justify-center my-1 print:my-0.5">
              <div className="border-t-2 border-dashed border-slate-300 w-full"></div>
              <span className="absolute bg-white px-3 text-[9px] font-mono text-slate-400 tracking-wider">
                ✂ CUT HERE ✂
              </span>
            </div>

            {/* PART 3: Preservation Copy */}
            {renderReceiptVoucher('PRESERVATION / AUDIT COPY', 'bg-amber-100 text-amber-800 border border-amber-200')}
          </div>
        </div>
      </div>
    </div>
  );
}
