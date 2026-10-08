'use client';

import React from 'react';
import { Building2, DollarSign, Users, AlertCircle, TrendingUp, BarChart3, PieChart, ShieldCheck } from 'lucide-react';
import { Hall } from '@/types';

interface SuperadminAnalyticsProps {
  stats: any;
  halls: Hall[];
  hallStats: any[];
  monthlyCollections: any[];
  methodDistribution: any[];
  selectedHallFilter: string;
  onSelectHallFilter: (hallId: string) => void;
  onOpenCreateHall: () => void;
  onOpenCreateManager: () => void;
}

export default function SuperadminAnalytics({
  stats,
  halls,
  hallStats,
  monthlyCollections,
  methodDistribution,
  selectedHallFilter,
  onSelectHallFilter,
  onOpenCreateHall,
  onOpenCreateManager,
}: SuperadminAnalyticsProps) {
  // Financial calculations
  const totalDue = stats.totalDue || 0;
  const totalPaid = stats.totalPaid || 0;
  const totalBilled = totalDue + totalPaid;
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  // Max value for bar chart scaling
  const maxMonthly = monthlyCollections.length > 0 
    ? Math.max(...monthlyCollections.map((m: any) => m.amount), 1000)
    : 1000;

  const maxHallRevenue = hallStats.length > 0
    ? Math.max(...hallStats.map((h: any) => Math.max(h.total_collected, h.total_due)), 1000)
    : 1000;

  return (
    <div className="space-y-6">
      {/* Superadmin Executive Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-purple-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold uppercase tracking-wider">
              Central University Hall Controller
            </span>
            <span className="text-xs text-slate-400">• Multi-Hall Oversight</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Superadmin Financial & Hall Analytics</h2>
          <p className="text-xs text-purple-200 mt-1 max-w-2xl">
            Real-time aggregate calculations, revenue collection rates, dues breakdown, and manager hall supervision across the university network.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onOpenCreateHall}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Add New Hall</span>
          </button>
          <button
            onClick={onOpenCreateManager}
            className="flex-1 md:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>New Manager Account</span>
          </button>
        </div>
      </div>

      {/* Hall Filter Pill Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto gap-3">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Scope:</span>
          <button
            onClick={() => onSelectHallFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedHallFilter === 'all'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Halls (Consolidated)
          </button>
          {halls.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelectHallFilter(h.id.toString())}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                selectedHallFilter === h.id.toString()
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{h.name}</span>
            </button>
          ))}
        </div>

        <div className="text-right text-[11px] text-slate-500 shrink-0">
          Showing data for: <strong className="text-slate-800">{selectedHallFilter === 'all' ? 'Entire University' : halls.find(h => h.id.toString() === selectedHallFilter)?.name}</strong>
        </div>
      </div>

      {/* Macro Financial Calculations & KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Halls / Managed */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Halls in Network</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalHalls || halls.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Central administrative units</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue Collected */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Collected</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{totalPaid.toLocaleString()} ৳</h3>
            <p className="text-[11px] text-emerald-600/90 font-medium mt-0.5">✓ Collection rate: {collectionRate}%</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Outstanding Dues */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Unsettled Dues</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{totalDue.toLocaleString()} ৳</h3>
            <p className="text-[11px] text-amber-600/90 font-medium mt-0.5">Pending collection from residents</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Resident Students */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resident Population</p>
            <h3 className="text-2xl font-extrabold text-purple-700 mt-1">{stats.residentStudents}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Total registered: {stats.totalStudents}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Financial Health Progress Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider">
            Overall University Billing Settlement Ratio
          </span>
          <span className="font-extrabold text-indigo-700 text-sm">
            {collectionRate}% Collected ({totalPaid.toLocaleString()} ৳ of {totalBilled.toLocaleString()} ৳)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${collectionRate}%` }}
            title={`Paid: ${totalPaid.toLocaleString()} ৳`}
          ></div>
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${100 - collectionRate}%` }}
            title={`Pending Due: ${totalDue.toLocaleString()} ৳`}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-500">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Collected Cash/Bank: <strong>{totalPaid.toLocaleString()} ৳</strong></span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span>Outstanding Dues: <strong>{totalDue.toLocaleString()} ৳</strong></span>
          </span>
        </div>
      </div>

      {/* Interactive Charts & Comparisons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Hall Comparison Bar Chart (Collected vs Dues) */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span>Hall Comparison: Collections vs Dues</span>
                </h3>
                <p className="text-xs text-slate-400">Comparing financial efficiency across residential halls</p>
              </div>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block"></span>
                  <span className="text-slate-600 font-medium">Collected</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm inline-block"></span>
                  <span className="text-slate-600 font-medium">Due</span>
                </span>
              </div>
            </div>

            {/* Custom SVG / Pure CSS Visual Bar Chart */}
            <div className="space-y-4 pt-2">
              {hallStats.map((h: any) => {
                const collectedPct = Math.min(100, Math.round((h.total_collected / maxHallRevenue) * 100));
                const duePct = Math.min(100, Math.round((h.total_due / maxHallRevenue) * 100));

                return (
                  <div key={h.id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{h.name} ({h.code})</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Manager: <strong className="text-slate-700">{h.manager_name || 'Unassigned'}</strong>
                      </span>
                    </div>

                    {/* Collected Bar */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] w-14 text-slate-400 font-medium">Paid</span>
                      <div className="flex-1 bg-slate-100 rounded-md h-4 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-md transition-all duration-500 flex items-center px-1.5 text-[9px] text-white font-bold"
                          style={{ width: `${Math.max(collectedPct, 5)}%` }}
                        >
                          {h.total_collected > 0 ? `${h.total_collected.toLocaleString()}৳` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Due Bar */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] w-14 text-slate-400 font-medium">Due</span>
                      <div className="flex-1 bg-slate-100 rounded-md h-4 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-md transition-all duration-500 flex items-center px-1.5 text-[9px] text-white font-bold"
                          style={{ width: `${Math.max(duePct, 5)}%` }}
                        >
                          {h.total_due > 0 ? `${h.total_due.toLocaleString()}৳` : '0৳'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Visual scale based on highest hall revenue</span>
            <span>Refreshes automatically upon collection</span>
          </div>
        </div>

        {/* GRAPH 2: Monthly Timeline Collection Trend & Payment Channels */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Monthly Collection Inflow</span>
                </h3>
                <p className="text-xs text-slate-400">Total fees settled over billing cycles</p>
              </div>
            </div>

            {/* Vertical Trend Bars */}
            {monthlyCollections.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No collections recorded yet</div>
            ) : (
              <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-200">
                {monthlyCollections.map((m: any, i: number) => {
                  const heightPct = Math.max(12, Math.round((m.amount / maxMonthly) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip on hover */}
                      <span className="text-[10px] font-bold text-indigo-700 mb-1 opacity-90">
                        {m.amount.toLocaleString()}৳
                      </span>
                      <div
                        className="w-full max-w-[40px] bg-gradient-to-t from-indigo-700 to-purple-500 rounded-t-lg group-hover:from-indigo-600 group-hover:to-purple-400 transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      ></div>
                      <span className="text-[10px] text-slate-600 font-medium mt-2 text-center truncate w-full">
                        {m.month_year.replace(' 2026', '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Payment Method Distribution */}
            <div className="mt-4 pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Payment Channel Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {methodDistribution.map((md: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 block">{md.method}</span>
                    <span className="font-extrabold text-indigo-700 text-sm">{md.total_amount.toLocaleString()} ৳</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{md.total_transactions} transactions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Hall Directory & Status Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">University Residential Halls Master Roster</h3>
            <p className="text-xs text-slate-500">Hall details, capacities, assigned provosts/managers, and revenue metrics</p>
          </div>
          <button
            onClick={onOpenCreateHall}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center space-x-1 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Add Hall</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hall Name & Code</th>
                <th className="py-3 px-3">Campus Location</th>
                <th className="py-3 px-3">Capacity & Occupancy</th>
                <th className="py-3 px-3">Designated Manager</th>
                <th className="py-3 px-3 text-right">Total Collected</th>
                <th className="py-3 px-3 text-right">Pending Dues</th>
                <th className="py-3 px-4 text-center">Filter View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {halls.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                    <div className="font-mono text-purple-700 text-[11px] font-semibold">{h.code}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{h.location || 'Central Campus'}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{h.resident_students || 0} residents</span>
                    <span className="block text-[11px] text-slate-400">Capacity: {h.capacity} beds</span>
                  </td>
                  <td className="py-3 px-3">
                    {h.manager_name ? (
                      <div>
                        <span className="font-semibold text-slate-900">{h.manager_name}</span>
                        <span className="block font-mono text-[11px] text-slate-400">@{h.manager_username}</span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                        No Manager Assigned
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 text-sm">
                    {(h.total_collected || 0).toLocaleString()} ৳
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600 text-sm">
                    {(h.total_due || 0).toLocaleString()} ৳
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectHallFilter(h.id.toString())}
                      className="px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      View Students & Dues →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
