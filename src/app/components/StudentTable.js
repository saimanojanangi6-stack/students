'use client';

import { useState } from 'react';
import EditStudentModal from './EditStudentModal';

export default function StudentTable({ students, searchClass, onDataUpdate, loading }) {
  const [editStudent, setEditStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const filtered = searchClass
    ? students.filter((s) => s.class?.toLowerCase() === searchClass.toLowerCase())
    : students;

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?\n\nThis action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/delete?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) onDataUpdate(data.students, data.stats);
      else alert(data.error || 'Failed to delete student');
    } catch (err) {
      alert('Network error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  const fmtDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl premium-shadow p-8 animate-slide-up" style={{ animationDelay: '0.4s', border: '1px solid rgba(243,244,246,0.5)' }}>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl loading-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-lg loading-shimmer" />
                <div className="h-3 w-1/5 rounded-lg loading-shimmer" />
              </div>
              <div className="h-8 w-20 rounded-lg loading-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
      {editStudent && (
        <EditStudentModal student={editStudent} onClose={() => setEditStudent(null)} onUpdate={onDataUpdate} />
      )}

      <div className="bg-white rounded-2xl premium-shadow overflow-hidden" style={{ border: '1px solid rgba(243,244,246,0.5)' }}>
        <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E0E7FF' }}>
              <svg className="w-5 h-5" style={{ color: '#4F46E5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Student Records</h3>
              <p className="text-xs text-gray-500">
                {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
                {searchClass && ` in Class ${searchClass}`}
              </p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">No Students Found</h4>
            <p className="text-sm text-gray-500">
              {searchClass ? `No students in Class ${searchClass}. Try a different class.` : 'Add your first student to get started.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(249,250,251,0.8)' }}>
                    {['Student', 'Class', 'Mobile', 'Total Fee', 'Paid', 'Remaining', 'Date', 'Actions'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${
                          ['Total Fee', 'Paid', 'Remaining'].includes(h) ? 'text-right' : h === 'Actions' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, index) => {
                    const rem = Number(s.remainingFee) || 0;
                    const pending = rem > 0;

                    return (
                      <tr
                        key={s.id}
                        className="table-row-enter transition-colors duration-200"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          opacity: deletingId === s.id ? 0.5 : 1,
                          borderBottom: '1px solid #F9FAFB',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,246,255,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
                              <span className="text-sm font-bold text-white">{s.studentName?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{s.studentName}</p>
                              <p className="text-xs text-gray-400">ID: #{s.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{s.class}</span>
                            <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">{s.section}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 font-medium">{s.parentMobile}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900">{fmt(s.totalFee)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold" style={{ color: '#16A34A' }}>{fmt(s.paidFee)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                            style={{
                              background: pending ? '#FEF2F2' : '#F0FDF4',
                              color: pending ? '#B91C1C' : '#15803D',
                              border: pending ? '1px solid #FECACA' : '1px solid #BBF7D0',
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: pending ? '#EF4444' : '#22C55E',
                                animation: pending ? 'pulseGlow 2s cubic-bezier(0.4,0,0.6,1) infinite' : 'none',
                              }}
                            />
                            {fmt(rem)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-500 font-medium">{fmtDate(s.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditStudent(s)}
                              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                              style={{ background: '#EFF6FF' }}
                              title="Edit Fee"
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                            >
                              <svg className="w-4 h-4" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.studentName)}
                              disabled={deletingId === s.id}
                              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50"
                              style={{ background: '#FEF2F2' }}
                              title="Delete"
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                            >
                              {deletingId === s.id ? (
                                <svg className="animate-spin h-4 w-4" style={{ color: '#EF4444' }} viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {filtered.map((s, index) => {
                const rem = Number(s.remainingFee) || 0;
                const pending = rem > 0;

                return (
                  <div
                    key={s.id}
                    className="p-5 animate-slide-up"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      opacity: deletingId === s.id ? 0.5 : 1,
                      borderBottom: '1px solid #F9FAFB',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.15)' }}>
                          <span className="text-base font-bold text-white">{s.studentName?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{s.studentName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>Class {s.class}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">Sec {s.section}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: pending ? '#FEF2F2' : '#F0FDF4',
                          color: pending ? '#B91C1C' : '#15803D',
                          border: pending ? '1px solid #FECACA' : '1px solid #BBF7D0',
                        }}
                      >
                        {pending ? 'PENDING' : 'CLEARED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '10px' }}>Total</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{fmt(s.totalFee)}</p>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: '#F0FDF4' }}>
                        <p className="font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '10px' }}>Paid</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: '#16A34A' }}>{fmt(s.paidFee)}</p>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: pending ? '#FEF2F2' : '#F0FDF4' }}>
                        <p className="font-medium text-gray-500 uppercase tracking-wider" style={{ fontSize: '10px' }}>Due</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: pending ? '#DC2626' : '#16A34A' }}>{fmt(rem)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>📱 {s.parentMobile}</span>
                        <span>•</span>
                        <span>{fmtDate(s.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditStudent(s)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          style={{ background: '#EFF6FF', color: '#2563EB' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.studentName)}
                          disabled={deletingId === s.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          style={{ background: '#FEF2F2', color: '#EF4444' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
                        >
                          {deletingId === s.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}