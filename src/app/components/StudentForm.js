'use client';

import { useState } from 'react';

export default function StudentForm({ onStudentAdded }) {
  const [formData, setFormData] = useState({
    studentName: '',
    class: '',
    section: '',
    parentMobile: '',
    totalFee: '',
    paidFee: '',
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setFormData({ studentName: '', class: '', section: '', parentMobile: '', totalFee: '', paidFee: '' });
        showNotif('Student added successfully!');
        setShowForm(false);
        onStudentAdded(data.students, data.stats);
      } else {
        showNotif(data.error || 'Failed to add student', 'error');
      }
    } catch (err) {
      showNotif('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const remainingFee =
    formData.totalFee && formData.paidFee
      ? Math.max(0, Number(formData.totalFee) - Number(formData.paidFee))
      : formData.totalFee
      ? Number(formData.totalFee)
      : 0;

  const handleFocus = (e) => {
    e.target.style.border = '2px solid #2563EB';
    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)';
  };

  const handleBlur = (e) => {
    e.target.style.border = '2px solid #E5E7EB';
    e.target.style.boxShadow = 'none';
  };

  const inputClasses = "w-full px-4 py-3.5 bg-gray-50 rounded-xl text-sm font-medium transition-all duration-200 outline-none";

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {notification && (
        <div className="fixed top-6 right-6 z-50 toast-enter">
          <div
            className="px-6 py-4 rounded-2xl flex items-center gap-3 text-white font-medium"
            style={{
              background: notification.type === 'error' ? '#EF4444' : 'linear-gradient(135deg, #2563EB, #4F46E5)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <span className="text-xl">{notification.type === 'error' ? '❌' : '✅'}</span>
            {notification.message}
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full group bg-white rounded-2xl premium-shadow p-6 transition-all duration-300 cursor-pointer"
          style={{ border: '2px dashed #D1D5DB' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#60A5FA';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(37,99,235,0.1), 0 4px 8px rgba(37,99,235,0.1), 0 20px 40px rgba(37,99,235,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.05)';
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{ boxShadow: '0 8px 16px rgba(37,99,235,0.25)' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900">Add New Student</h3>
              <p className="text-sm text-gray-500">Click to register a new student record</p>
            </div>
          </div>
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl premium-shadow overflow-hidden animate-scale-in" style={{ border: '1px solid rgba(243,244,246,0.5)' }}>
          <div className="gradient-primary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Register New Student</h2>
                  <p className="text-sm" style={{ color: '#BFDBFE' }}>Fill in the details below</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#2563EB' }}></span>
                    Student Name
                  </span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className={inputClasses}
                  style={{ border: '2px solid #E5E7EB' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#4F46E5' }}></span>
                    Class
                  </span>
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className={inputClasses + " cursor-pointer appearance-none"}
                  style={{ border: '2px solid #E5E7EB' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select Class</option>
                  {['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#7C3AED' }}></span>
                    Section
                  </span>
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  className={inputClasses + " cursor-pointer appearance-none"}
                  style={{ border: '2px solid #E5E7EB' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select Section</option>
                  {['A', 'B', 'C', 'D', 'E'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }}></span>
                    Parent Mobile Number
                  </span>
                </label>
                <input
                  type="tel"
                  name="parentMobile"
                  value={formData.parentMobile}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                  className={inputClasses}
                  style={{ border: '2px solid #E5E7EB' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }}></span>
                    Total Fee (₹)
                  </span>
                </label>
                <input
                  type="number"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  className={inputClasses}
                  style={{ border: '2px solid #E5E7EB' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: '#059669' }}></span>
                    Paid Fee (₹)
                  </span>
                </label>
                <input
                  type="number"
                  name="paidFee"
                  value={formData.paidFee}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max={formData.totalFee || undefined}
                  required
                  className={inputClasses}
                  style={{ border: '2px solid #E5E7EB' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div className="md:col-span-2">
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{
                    background: remainingFee > 0 ? '#FEF2F2' : '#F0FDF4',
                    border: remainingFee > 0 ? '2px solid #FECACA' : '2px solid #BBF7D0',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: remainingFee > 0 ? '#FEE2E2' : '#DCFCE7' }}
                    >
                      <span className="text-xl">{remainingFee > 0 ? '⏳' : '✅'}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Fee</p>
                      <p className="text-2xl font-bold" style={{ color: remainingFee > 0 ? '#DC2626' : '#16A34A' }}>
                        ₹{remainingFee.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: remainingFee > 0 ? '#FEE2E2' : '#DCFCE7',
                      color: remainingFee > 0 ? '#B91C1C' : '#15803D',
                    }}
                  >
                    {remainingFee > 0 ? 'PENDING' : 'CLEARED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-primary text-white py-4 px-8 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 8px 20px rgba(37,99,235,0.25)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Adding Student...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Student</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-8 py-4 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 transition-all duration-200 cursor-pointer"
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}