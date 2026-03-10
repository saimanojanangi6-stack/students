'use client';

import { useState, useEffect, useCallback } from 'react';
import StudentForm from './StudentForm';
import StudentTable from './StudentTable';
import SearchBar from './SearchBar';

export default function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalFees: 0, collectedFees: 0, pendingFees: 0, pendingStudents: 0 });
  const [searchClass, setSearchClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/students', { cache: 'no-store' });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.success) { setStudents(data.students || []); setStats(data.stats || stats); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    update(); const t = setInterval(update, 60000); return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) { console.error(err); }
    onLogout();
  };

  const handleDataUpdate = (s, st) => { setStudents(s || []); setStats(st || stats); };
  const fmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;
  const rate = stats.totalFees > 0 ? ((stats.collectedFees / stats.totalFees) * 100).toFixed(1) : 0;

  const roleConfig = {
    principal: { label: 'Principal', gradient: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#2563EB' },
    receptionist: { label: 'Receptionist', gradient: 'linear-gradient(135deg, #10B981, #059669)', color: '#10B981' },
  };
  const rc = roleConfig[user?.role] || roleConfig.receptionist;

  const cards = [
    { title: 'Total Students', value: stats.totalStudents, grad: 'gradient-primary', shadow: 'rgba(37,99,235,0.2)', bg: '#EFF6FF', tc: '#2563EB', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { title: 'Total Fees', value: fmt(stats.totalFees), grad: 'gradient-info', shadow: 'rgba(6,182,212,0.2)', bg: '#ECFEFF', tc: '#0891B2', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Collected', value: fmt(stats.collectedFees), grad: 'gradient-success', shadow: 'rgba(16,185,129,0.2)', bg: '#F0FDF4', tc: '#059669', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', extra: `${rate}% collected` },
    { title: 'Pending', value: fmt(stats.pendingFees), grad: 'gradient-danger', shadow: 'rgba(239,68,68,0.2)', bg: '#FEF2F2', tc: '#DC2626', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', extra: `${stats.pendingStudents} pending` },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F0F4F8' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(229,231,235,0.5)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl gradient-primary flex items-center justify-center" style={{ boxShadow: '0 8px 16px rgba(37,99,235,0.25)' }}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div><h1 className="text-lg sm:text-xl font-extrabold text-gray-900">School<span className="text-gradient">Pro</span></h1><p className="text-xs text-gray-500 hidden sm:block">Fee Management</p></div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {/* User info */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: rc.color }}></span>
                  <p className="text-xs font-medium" style={{ color: rc.color }}>{rc.label}</p>
                </div>
              </div>
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center" style={{ background: rc.gradient, boxShadow: `0 8px 16px ${rc.color}40` }}>
                <span className="text-sm sm:text-base font-bold text-white">{user?.avatar || 'U'}</span>
              </div>
              {/* Logout */}
              <button onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 transition-all cursor-pointer disabled:opacity-50" style={{ background: '#F3F4F6' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#4B5563'; }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome */}
        <div className="animate-slide-up">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 sm:p-8 lg:p-10" style={{ boxShadow: '0 25px 50px rgba(37,99,235,0.2)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(25%,-50%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', transform: 'translate(-25%,50%)' }} />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2">Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
                <p className="text-sm sm:text-base max-w-lg" style={{ color: '#BFDBFE' }}>
                  {user?.role === 'principal' ? 'Full dashboard access. Manage students, fees, and delete records.' : 'You can view, add, and edit student records.'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{rc.label}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.15)', color: '#BFDBFE' }}>{currentTime}</span>
                </div>
              </div>
              <div className="px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#BFDBFE' }}>Collection Rate</p>
                <p className="text-2xl font-extrabold text-white">{rate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((c, i) => (
            <div key={i} className="animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
              <div className="group bg-white rounded-2xl premium-shadow p-5 sm:p-6 transition-all duration-300 cursor-default" style={{ border: '1px solid rgba(243,244,246,0.5)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 0 1px ${c.shadow}, 0 4px 8px ${c.shadow}, 0 20px 40px ${c.shadow}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.05)'; }}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${c.grad} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`} style={{ boxShadow: `0 8px 16px ${c.shadow}` }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} /></svg>
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{c.title}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{loading ? '...' : c.value}</p>
                {c.extra && <p className="text-xs font-medium mt-1" style={{ color: c.tc }}>{c.extra}</p>}
              </div>
            </div>
          ))}
        </div>

        <StudentForm onStudentAdded={handleDataUpdate} userPermissions={user?.permissions} />
        <SearchBar searchClass={searchClass} setSearchClass={setSearchClass} />
        <StudentTable students={students} searchClass={searchClass} onDataUpdate={handleDataUpdate} loading={loading} userPermissions={user?.permissions} />

        <footer className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
            SchoolPro CRM — Built with ❤️
          </div>
        </footer>
      </main>
    </div>
  );
}