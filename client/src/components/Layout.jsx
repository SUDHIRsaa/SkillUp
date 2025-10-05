import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Starfield from './Starfield.jsx';

function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <div>© {new Date().getFullYear()} SkillUp</div>
        <div className="space-x-4">
          <a className="hover:text-brand-600" href="/leaderboard">Leaderboards</a>
          {/* Coding removed */}
          <a className="hover:text-brand-600" href="/aptitude">Aptitude</a>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  // ...existing code...
  const location = useLocation();
  const isAdminRoute = (location?.pathname || '').startsWith('/admin');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <div className="min-h-screen relative bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-gray-100 flex flex-col">
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none select-none">
        <Starfield
          density={160}
          twinkleSpeed={1.4}
          sizeMultiplier={2.2}
          lightColors={[[99,102,241],[56,189,248],[34,197,94]]}
          darkColor={[255,255,255]}
        />
      </div>
      {!isAdminRoute && (
        <Navbar onToggleTheme={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))} theme={theme} />
      )}
  <main className={isAdminRoute ? 'relative z-10 flex-1 w-full px-4 py-6' : 'relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-6'}>{children}</main>
      <Footer />
    </div>
  );
}
