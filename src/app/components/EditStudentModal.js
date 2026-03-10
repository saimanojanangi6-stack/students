'use client';

import { useState, useEffect } from 'react';

export default function EditStudentModal({ student, onClose, onUpdate }) {
  const [paidFee, setPaidFee] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (student) setPaidFee(String(student.paidFee)); }, [student]);
  if (!student) return null;

  const totalFee = Number(student.totalFee);
  const currentPaid = Number(paidFee) || 0;
  const remainingFee = Math.max(0, totalFee - currentPaid);
  const progress = totalFee > 0 ? Math.min(100, (currentPaid / totalFee) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentPaid > totalFee) { alert('Paid fee cannot exceed total fee!'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/students/update', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: student.id, paidFee: parseInt(paidFee, 10) || 0, totalFee }) });
      const data = await res.json();
      if (data.success) { onUpdate(data.students, data.stats); onClose(); } else alert(data.error || 'Failed');
    } catch (err) { alert('Network error'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay-anim" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }} />
      <div className="relative bg-white rounded-3xl premium-shadow max-w-lg w-full overflow-hidden modal-content-anim" onClick={(e) => e.stopPropagation()}>
        <div className="gradient-primary px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div><h2 className="text-xl font-bold text-white">Update Fee</h2><p className="text-sm" style={{ color: '#BFDBFE' }}>Modify paid amount</p></div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)', border: '1px solid #BFDBFE' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center" style={{ boxShadow: '0 8px 16px rgba(37,99,235,0.2)' }}><span className="text-2xl font-bold text-white">{student.studentName?.charAt(0)?.toUpperCase()}</span></div>
              <div><h3 className="text-lg font-bold text-gray-900">{student.studentName}</h3><p className="text-sm text-gray-500">Class {student.class} • Section {student.section}</p></div>
            </div>
          </div>
          <div className="mb-6"><div className="flex justify-between mb-2"><span className="text-xs font-semibold text-gray-500 uppercase">Progress</span><span className="text-xs font-bold" style={{ color: '#2563EB' }}>{progress.toFixed(1)}%</span></div><div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} /></div></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-medium text-gray-500 uppercase">Total</p><p className="text-xl font-bold text-gray-900 mt-1">₹{totalFee.toLocaleString('en-IN')}</p></div>
            <div className="rounded-xl p-4" style={{ background: remainingFee > 0 ? '#FEF2F2' : '#F0FDF4' }}><p className="text-xs font-medium text-gray-500 uppercase">Remaining</p><p className="text-xl font-bold mt-1" style={{ color: remainingFee > 0 ? '#DC2626' : '#16A34A' }}>₹{remainingFee.toLocaleString('en-IN')}</p></div>
          </div>
          <div className="mb-8"><label className="block text-sm font-semibold text-gray-700 mb-2">Paid Fee (₹)</label><input type="number" value={paidFee} onChange={(e) => setPaidFee(e.target.value)} min="0" max={totalFee} required className="w-full px-5 py-4 bg-gray-50 rounded-xl text-lg font-bold text-gray-900 outline-none" style={{ border: '2px solid #E5E7EB' }} onFocus={(e) => { e.target.style.border = '2px solid #2563EB'; }} onBlur={(e) => { e.target.style.border = '2px solid #E5E7EB'; }} /></div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading || currentPaid > totalFee} className="flex-1 gradient-primary text-white py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50" style={{ boxShadow: '0 8px 20px rgba(37,99,235,0.25)' }}>{loading ? 'Updating...' : 'Update Payment'}</button>
            <button type="button" onClick={onClose} className="px-8 py-4 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 cursor-pointer">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}