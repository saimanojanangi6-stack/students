import './globals.css';

export const metadata = {
  title: 'SchoolPro CRM — Student Fee Management System',
  description: 'Premium modern school CRM for managing student fees and records.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" style={{ background: '#F0F4F8' }}>
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}