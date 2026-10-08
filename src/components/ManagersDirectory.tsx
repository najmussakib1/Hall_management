'use client';

import React from 'react';
import { ShieldCheck, UserCheck, Key, Building2, Plus, Edit2, Mail, Phone } from 'lucide-react';
import { ManagerUser, Hall } from '@/types';

interface ManagersDirectoryProps {
  managers: ManagerUser[];
  halls: Hall[];
  onOpenCreateManager: () => void;
  onEditManager: (manager: ManagerUser) => void;
}

export default function ManagersDirectory({
  managers,
  halls,
  onOpenCreateManager,
  onEditManager,
}: ManagersDirectoryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Hall Managers & Provost Administration Accounts</span>
          </h3>
          <p className="text-xs text-slate-500">
            Create manager logins, assign/reassign halls, and manage access passwords
          </p>
        </div>
        <button
          onClick={onOpenCreateManager}
          className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Manager Account</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Manager Name</th>
              <th className="py-3 px-3">Username & Role</th>
              <th className="py-3 px-3">Assigned Residential Hall</th>
              <th className="py-3 px-3">Contact Information</th>
              <th className="py-3 px-3">Created On</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {managers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  No manager accounts created yet.
                </td>
              </tr>
            ) : (
              managers.map((mgr) => {
                const assignedHall = halls.find((h) => h.id === mgr.hall_id);
                const isSuperadmin = mgr.role === 'superadmin';

                return (
                  <tr key={mgr.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                        <span>{mgr.name}</span>
                        {isSuperadmin && (
                          <span className="px-2 py-0.2 bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold rounded-full uppercase">
                            Superadmin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-700 font-semibold">@{mgr.username}</div>
                      <span className="text-[11px] text-slate-400 capitalize">{mgr.role}</span>
                    </td>
                    <td className="py-3 px-3">
                      {isSuperadmin ? (
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-[11px] font-semibold">
                          ✦ All Halls (Full Authority)
                        </span>
                      ) : assignedHall ? (
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-semibold text-slate-800">{assignedHall.name} ({assignedHall.code})</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {mgr.email && <div className="flex items-center space-x-1 text-[11px]"><Mail className="w-3 h-3 text-slate-400" /><span>{mgr.email}</span></div>}
                      {mgr.phone && <div className="flex items-center space-x-1 text-[11px]"><Phone className="w-3 h-3 text-slate-400" /><span>{mgr.phone}</span></div>}
                      {!mgr.email && !mgr.phone && <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {mgr.created_at ? new Date(mgr.created_at).toLocaleDateString() : 'Initial'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onEditManager(mgr)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit / Reset Pass</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
