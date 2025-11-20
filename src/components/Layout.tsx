import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, BookOpen, FileText, LogOut, Settings, Sun, Moon, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const OWNER_EMAIL = 'singh.yogeshwar5608@gmail.com';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user?.email === OWNER_EMAIL;
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/diary', icon: BookOpen, label: 'Diary' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/profile', icon: UserIcon, label: 'Profile' },
    ...(isAdmin ? [{ to: '/admin', icon: Settings, label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 dark:text-slate-50 flex flex-col">
      <header className="bg-blue-600 dark:bg-slate-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/Logo.svg" alt="Milkman Diary Logo" className="h-7 w-7 object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold">Milkman Diary</h1>
            </div>
            {user && (
              <button
                onClick={toggleTheme}
                className="sm:hidden ml-3 p-2 rounded-full bg-blue-500/80 hover:bg-blue-700 text-white flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
          </div>

          {user && (
            <div className="hidden sm:flex items-center space-x-3 text-sm">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-blue-500/80 hover:bg-blue-700 text-white flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <span className="text-blue-100 truncate max-w-[200px]">
                {user.email}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-700 text-white text-xs font-medium"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Desktop / tablet top navigation */}
      <nav className="hidden md:block bg-white dark:bg-slate-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-sky-300 border-b-2 border-blue-600 dark:border-sky-400'
                      : 'text-gray-600 dark:text-slate-200 hover:text-blue-600 dark:hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 pb-24 pt-6 md:pt-8 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border-t border-gray-200 dark:border-slate-700 backdrop-blur">
        <div className="max-w-3xl mx-auto flex justify-between px-2 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center px-2 py-1 text-[11px] font-medium rounded-xl mx-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-sky-300 bg-blue-50 dark:bg-slate-800'
                    : 'text-gray-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span className="mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
