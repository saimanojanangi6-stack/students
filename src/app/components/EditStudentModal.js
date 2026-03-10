'use client';

import { useState, useEffect } from 'react';

export default function EditStudentModal({ student, onClose, onUpdate }) {
  const [paidFee, setPaidFee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) setPaidFee(String(student.paidFee));
  }, [student]);

  if (!student) return null;

  const totalFee = Number(student.totalFee);
  const currentPaid = Number(paidFee) || 0;
  const remainingFee = Math.max(0, totalFee - currentPaid);
  const progressPercent = totalFee > 0 ? Math.min(100, (currentPaid / totalFee) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentPaid > totalFee) { alert('Paid fee cannot exceed total fee!'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/students/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, paidFee: currentPaid, totalFee }),
      });
      const data = await res.json();
      if (data.success) { onUpdate(data.students, data.stats); onClose(); }
      else alert(data.error || 'Failed to update');
    } catch (err) {
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (e) => {
    e.target.style.border = '2px solid #2563EB';
    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)';
  };

  const handleBlur = (e) => {
    e.target.style.border = '2px solid #E5E7EB';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-anim"
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />

      <div
        className="relative bg-white rounded-3xl premium-shadow max-w-lg w-full overflow-hidden modal-content-anim"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gradient-primary px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Update Fee Payment</h2>
                <p className="text-sm" style={{ color: '#BFDBFE' }}>Modify paid amount</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              style={{ background: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)', border: '1px solid #BFDBFE' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center"
                style={{ boxShadow: '0 8px 16px rgba(37,99,235,0.2)' }}
              >
                <span className="text-2xl font-bold text-white">{student.studentName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{student.studentName}</h3>
                <p className="text-sm text-gray-500">Class {student.class} • Section {student.section}</p>
                <p className="text-xs text-gray-400 mt-0.5">📱 {student.parentMobile}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Progress</span>
              <span className="text-xs font-bold" style={{ color: '#2563EB' }}>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4" style={{ border: '1px solid #F3F4F6' }}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fee</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₹{totalFee.toLocaleString('en-IN')}</p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: remainingFee > 0 ? '#FEF2F2' : '#F0FDF4',
                border: remainingFee > 0 ? '1px solid #FECACA' : '1px solid #BBF7D0',
              }}
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</p>
              <p className="text-xl font-bold mt-1" style={{ color: remainingFee > 0 ? '#DC2626' : '#16A34A' }}>
                ₹{remainingFee.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }}></span>
                Paid Fee Amount (₹)
              </span>
            </label>
            <input
              type="number"
              value={paidFee}
              onChange={(e) => setPaidFee(e.target.value)}
              placeholder="Enter paid amount"
              min="0"
              max={totalFee}
              required
              className="w-full px-5 py-4 bg-gray-50 rounded-xl text-lg font-bold text-gray-900 transition-all duration-200 outline-none"
              style={{ border: '2px solid #E5E7EB' }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {currentPaid > totalFee && (
              <p className="text-xs font-medium mt-2 flex items-center gap-1" style={{ color: '#EF4444' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Paid fee cannot exceed total fee
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || currentPaid > totalFee}
              className="flex-1 gradient-primary text-white py-4 px-8 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 8px 20px rgba(37,99,235,0.25)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update Payment</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 transition-all duration-200 cursor-pointer"
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}