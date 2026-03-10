'use client';

export default function SearchBar({ searchClass, setSearchClass }) {
  const classes = [
    'All Classes', 'Nursery', 'LKG', 'UKG',
    '1', '2', '3', '4', '5',
    '6', '7', '8', '9', '10', '11', '12',
  ];

  const quickFilters = ['', '1', '5', '10', '12'];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="bg-white rounded-2xl premium-shadow p-6" style={{ border: '1px solid rgba(243,244,246,0.5)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"
              style={{ boxShadow: '0 8px 16px rgba(37,99,235,0.25)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Filter Students</h3>
              <p className="text-xs text-gray-500">Search by class</p>
            </div>
          </div>

          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <select
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
                className="w-full sm:w-64 appearance-none bg-gray-50 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 transition-all duration-200 cursor-pointer outline-none"
                style={{ border: '2px solid #E5E7EB' }}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #2563EB';
                  e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid #E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {classes.map((cls) => (
                  <option key={cls} value={cls === 'All Classes' ? '' : cls}>
                    {cls === 'All Classes' ? 'All Classes' : `Class ${cls}`}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            {quickFilters.map((cls, index) => (
              <button
                key={index}
                onClick={() => setSearchClass(cls)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  background: searchClass === cls ? 'linear-gradient(135deg, #2563EB, #4F46E5)' : '#F3F4F6',
                  color: searchClass === cls ? 'white' : '#4B5563',
                  boxShadow: searchClass === cls ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
                }}
              >
                {cls === '' ? 'All' : `Class ${cls}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}