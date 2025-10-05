import { useState } from 'react';
import { Bars3Icon, SunIcon, MoonIcon, HomeIcon, AcademicCapIcon, CodeBracketSquareIcon, TrophyIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, Cog6ToothIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.svg';
import { TOPICS } from '../data/topics';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

export default function Navbar({ onToggleTheme, theme }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user && (user.role === 'admin' || user.role === 'moderator');
  const linkClass = "inline-flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";
  const NavLinks = () => (
    <>
      <a href="/" className={linkClass}><HomeIcon className="h-4 w-4"/> Home</a>
  <a href="/aptitude" className={linkClass}><AcademicCapIcon className="h-4 w-4"/> Aptitude</a>
  <a href="/aptitude/topics" className={linkClass}><BookOpenIcon className="h-4 w-4"/> Topics</a>
  {/* Flashcards and MCQ generation removed */}
  {/* Coding feature removed */}
      <a href="/leaderboard" className={linkClass}><TrophyIcon className="h-4 w-4"/> Leaderboard</a>
      {user && !isAdmin && <a href="/profile" className={linkClass}><UserCircleIcon className="h-4 w-4"/> Profile</a>}
      {isAdmin && (
        <>
          <a href="/admin" className={linkClass}><Cog6ToothIcon className="h-4 w-4"/> Admin</a>
          <a href="/admin/questions" className={linkClass}><AcademicCapIcon className="h-4 w-4"/> MCQs</a>
          {/* Coding Qs removed */}
          <a href="/admin/users" className={linkClass}><UserCircleIcon className="h-4 w-4"/> Users</a>
          <a href="/admin/submissions" className={linkClass}><TrophyIcon className="h-4 w-4"/> Coding Subs</a>
          <a href="/admin/aptitude" className={linkClass}><AcademicCapIcon className="h-4 w-4"/> Aptitude Subs</a>
        </>
      )}
      {!user ? (
        <>
          <a href="/login" className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 hover:border-brand-500 transition-colors"><ArrowRightOnRectangleIcon className="h-4 w-4"/> Login</a>
          <Button as="a" href="/signup" variant="gradient" leadingIcon={ArrowLeftOnRectangleIcon}>Sign up</Button>
        </>
      ) : (
        <Button variant="secondary" onClick={logout} leadingIcon={ArrowRightOnRectangleIcon}>Logout</Button>
      )}
    </>
  );
  return (
    <header className="w-full bg-white/80 backdrop-blur border-b border-gray-100 dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="SkillUp" className="h-9 w-9 rounded-xl shadow" />
          <span className="font-semibold tracking-wide text-lg">SkillUp</span>
        </a>
  <div className="flex-1 flex justify-end ml- items-center gap-3">
          <nav className="text-sm hidden md:flex items-center gap-3">
            <NavLinks />
            <Button variant="secondary" onClick={onToggleTheme} leadingIcon={theme === 'dark' ? SunIcon : MoonIcon}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </nav>
          <button className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(o=>!o)} aria-label="Toggle menu">
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 flex flex-col gap-2 text-sm">
            <NavLinks />
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800" />
            <Button variant="secondary" onClick={onToggleTheme} leadingIcon={theme === 'dark' ? SunIcon : MoonIcon}>
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
