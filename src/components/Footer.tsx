import Link from 'next/link';
import { BookOpen, GraduationCap, Link2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-950 py-12 px-6 md:px-12 text-zinc-500 dark:text-zinc-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Information */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <BookOpen className="text-white w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              ResearchLink
            </span>
          </div>
          <p className="text-sm max-w-sm leading-relaxed text-zinc-505 dark:text-zinc-400">
            Bridging the gap between undergraduate students and cutting-edge university research. Search, discover, and reach out to professors directly.
          </p>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm tracking-wider uppercase">Platform</h4>
          <Link href="/feed" className="text-sm hover:text-indigo-505 transition-colors">Browse Research</Link>
          <Link href="/" className="text-sm hover:text-indigo-505 transition-colors">Search Portal</Link>
          <Link href="/auth" className="text-sm hover:text-indigo-505 transition-colors">Join as Student</Link>
        </div>

        {/* Legal & Respect Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 text-sm tracking-wider uppercase">Respect & Trust</h4>
          <div className="flex items-center gap-2 text-sm text-indigo-500 dark:text-indigo-400 font-medium">
            <GraduationCap className="w-4.5 h-4.5" />
            <span>Undergrad Friendly</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
            <Link2 className="w-4.5 h-4.5" />
            <span>Public Info Only</span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-tight">
            We honor robots.txt, protect public records, and discourage unsolicited mass emails.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; {new Date().getFullYear()} ResearchLink. Built for undergraduate discovery.</p>
        <div className="flex gap-6">
          <span className="hover:text-indigo-505 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-indigo-505 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-indigo-505 transition-colors cursor-pointer">Robots.txt Integrity</span>
        </div>
      </div>
    </footer>
  );
}

// Zinc footer
