import { useState } from 'react';
import { AcademicCapIcon, CodeBracketSquareIcon, UserCircleIcon, TrophyIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const links = [
  { href: '/admin', label: 'Dashboard', icon: Cog6ToothIcon },
  { href: '/admin/questions', label: 'MCQs', icon: AcademicCapIcon },
  { href: '/admin/subtopics', label: 'Aptitude Subtopics', icon: AcademicCapIcon },
  // { href: '/admin/coding', label: 'Coding Qs', icon: CodeBracketSquareIcon },
  { href: '/admin/users', label: 'Users', icon: UserCircleIcon },
  { href: '/admin/aptitude', label: 'Aptitude Subs', icon: AcademicCapIcon },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const LinkList = () => (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <a key={href} href={href} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium transition-colors" onClick={() => setOpen(false)}>
          <Icon className="h-5 w-5" />
          {label}
        </a>
      ))}
    </>
  );
  return (
    <>
      {/* Mobile header for admin pages */}
      <div className="md:hidden sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-base font-semibold">Admin Panel</div>
          <button className="inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(true)} aria-label="Open menu">
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 py-6 px-3 gap-2 sticky top-0">
        <div className="mb-6 text-xl font-bold tracking-wide">Admin Panel</div>
        <LinkList />
      </aside>

      {/* Mobile drawer sidebar */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Admin Panel</div>
              <button className="inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setOpen(false)} aria-label="Close menu">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <LinkList />
          </div>
        </div>
      )}
    </>
  );
}
