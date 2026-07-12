'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Search, User, LogOut, Settings, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Load session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname]);

  // Ensure documentElement has dark class globally for styling matching
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      if (res.ok) {
        setCurrentUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-100 dark:border-zinc-800/50 py-3.5 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-all">
          <BookOpen className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight text-zinc-850 dark:text-zinc-100">
          Detect<span className="text-indigo-500">Research</span>
        </span>
      </Link>

      {/* Nav Links - Desktop */}
      <div className="hidden md:flex items-center gap-8 font-medium">
        <Link 
          href="/feed" 
          className={`flex items-center gap-2 text-sm hover:text-indigo-505 transition-colors ${
            pathname.startsWith('/feed') ? 'text-indigo-500 dark:text-indigo-400 font-semibold' : 'text-zinc-650 dark:text-zinc-300'
          }`}
        >
          <Search className="w-4 h-4" />
          Browse Feed
        </Link>

        {currentUser?.isAdmin && (
          <Link 
            href="/admin" 
            className={`flex items-center gap-2 text-sm hover:text-indigo-505 transition-colors ${
              pathname.startsWith('/admin') ? 'text-indigo-500 dark:text-indigo-400 font-semibold' : 'text-zinc-650 dark:text-zinc-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* Action Area - Desktop */}
      <div className="hidden md:flex items-center gap-4">
        {/* Auth States */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-3 border-l border-zinc-205 dark:border-zinc-800">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{currentUser.name}</span>
              <span className="text-xs text-indigo-550 dark:text-indigo-400 capitalize font-medium">{currentUser.role.toLowerCase()}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl border border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-955/25 flex items-center justify-center text-rose-500 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 cursor-pointer"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5 w-5 justify-center">
            <span className={`h-0.5 w-full bg-current transform transition duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-full bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`h-0.5 w-full bg-current transform transition duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-20 left-0 right-0 p-6 mx-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 shadow-xl flex flex-col gap-4 md:hidden transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          <Link 
            href="/feed" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium"
          >
            <Search className="w-4 h-4" />
            Browse Feed
          </Link>
          
          {currentUser?.isAdmin && (
            <Link 
              href="/admin" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <Settings className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1"></div>

          {currentUser ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentUser.name}</span>
                  <span className="text-xs text-indigo-505 capitalize">{currentUser.role.toLowerCase()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-250 hover:bg-rose-50 text-rose-550 dark:border-rose-900/30 dark:hover:bg-rose-955/20 font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium shadow-md shadow-zinc-500/10 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

// Enforce dark mode

// Zinc colors

// Enforce dark mode

// Zinc colors
