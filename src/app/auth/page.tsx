'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, UserPlus, BookOpen, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  
  // Auth state toggles
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in, redirect
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.push(data.user.role === 'ADMIN' ? '/admin' : '/feed');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = isLogin 
        ? { action: 'login', email, password }
        : { action: 'register', email, password, name, role };

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Refresh page and redirect based on role
      router.refresh();
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/feed');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 md:p-12 animate-fade-in">
      <div className="w-full max-w-md card-surface p-8 shadow-sm relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-3xl pointer-events-none"></div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-2 mb-8 relative">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-zinc-550 dark:text-zinc-500 text-center font-medium">
            {isLogin 
              ? 'Sign in to access research feeds & outreach templates' 
              : 'Join as a student or administrator to get started'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm flex gap-2.5 items-start">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative font-semibold">
          {/* Name Field (Register Only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-transparent text-sm transition-all"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-transparent text-sm transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-transparent text-sm transition-all"
            />
          </div>

          {/* Role Field (Register Only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
                Register as
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`py-3 rounded-xl border font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                    role === 'STUDENT'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                  }`}
                >
                  STUDENT
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-3 rounded-xl border font-semibold text-xs tracking-wider transition-all cursor-pointer ${
                    role === 'ADMIN'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                  }`}
                >
                  ADMINISTRATOR
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center text-sm font-medium">
          <p className="text-zinc-500 dark:text-zinc-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-500 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
