'use client';

import React, { useState } from 'react';
import { X, Building2, Plus, MapPin, Users, FileText } from 'lucide-react';
import { Hall } from '@/types';

interface HallModalProps {
  hall?: Hall | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HallModal({ hall, onClose, onSuccess }: HallModalProps) {
  const isEditing = !!hall;

  const [formData, setFormData] = useState({
    name: hall?.name || '',
    code: hall?.code || '',
    capacity: hall?.capacity ? hall.capacity.toString() : '400',
    monthly_fee: hall?.monthly_fee ? hall.monthly_fee.toString() : '2000',
    location: hall?.location || '',
    description: hall?.description || '',
    update_students_fee: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setError('Please provide Hall Name and Code');
      return;
    }

    if (!formData.monthly_fee || parseFloat(formData.monthly_fee) < 0) {
      setError('Please provide a valid monthly fee amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = '/api/halls';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing ? { ...formData, id: hall.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save hall');
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">
              {isEditing ? `Edit Hall: ${hall.code}` : 'Add New Residential Hall'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
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
              Hall Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bangabandhu Sheikh Mujibur Rahman Hall"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Hall Code / Short *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. BSMRH"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Total Capacity (Beds) *
              </label>
              <input
                type="number"
                required
                min="50"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="400"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Monthly Hall Fee Setting */}
          <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950">
                Monthly Hall Fee (৳) *
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/80 px-2 py-0.5 rounded-full">
                Visible to Managers
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Default baseline fee charged to resident students of this hall each billing cycle.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-2 text-indigo-600 font-bold text-sm">৳</span>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                placeholder="2000"
                className="w-full pl-8 pr-3 py-2 border border-indigo-200 rounded-lg text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {isEditing && (
              <label className="flex items-center space-x-2 mt-3 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.update_students_fee}
                  onChange={(e) => setFormData({ ...formData, update_students_fee: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Also sync this new monthly fee to all current resident students in this hall</span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Campus Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. West Campus, Sector 4"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes or details about the hall"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
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
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Hall' : 'Create Hall'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
