'use client';

import React, { useState } from 'react';
import { X, UserPlus, Building, Key, ShieldCheck, Mail, Phone, Lock } from 'lucide-react';
import { Hall, ManagerUser } from '@/types';

interface ManagerModalProps {
  halls: Hall[];
  manager?: ManagerUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManagerModal({ halls, manager, onClose, onSuccess }: ManagerModalProps) {
  const isEditing = !!manager;

  const [formData, setFormData] = useState({
    username: manager?.username || '',
    password: '',
    name: manager?.name || '',
    hall_id: manager?.hall_id ? manager.hall_id.toString() : halls[0]?.id?.toString() || '1',
    email: manager?.email || '',
    phone: manager?.phone || '',
    role: manager?.role || 'manager',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Please provide the full name');
      return;
    }

    if (!isEditing && (!formData.username || !formData.password)) {
      setError('Username and password are required for new manager accounts');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = '/api/managers';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing ? { ...formData, id: manager.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save manager account');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-300" />
            <div>
              <h3 className="font-semibold text-lg">
                {isEditing ? `Edit Manager: ${manager.name}` : 'Create New Hall Manager Account'}
              </h3>
              <p className="text-xs text-purple-200">Assign credentials and designated hall to supervise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-purple-700/50 cursor-pointer"
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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Mohammad Shamsuzzaman"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Username {isEditing ? '(Read-only)' : '*'}
              </label>
              <input
                type="text"
                required={!isEditing}
                disabled={isEditing}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="manager_sbh"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password {isEditing ? '(Leave blank to keep)' : '*'}
              </label>
              <input
                type="password"
                required={!isEditing}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isEditing ? '••••••••' : 'Set password'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Assigned Hall */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assigned Hall to Manage *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={formData.hall_id}
                onChange={(e) => setFormData({ ...formData, hall_id: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-slate-50 font-medium"
                required
              >
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name} ({hall.code}) — Capacity: {hall.capacity} students
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="manager@hall.edu"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01711000000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Manager' : 'Create Manager Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
