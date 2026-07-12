'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, Microscope, Mail, ExternalLink, ChevronRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/research');
        if (res.ok) {
          const data = await res.json();
          setFeaturedItems(data.items.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/feed?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/feed');
    }
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-24 pb-20 md:pt-36 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[80px] font-bold tracking-tight leading-[1.05] text-zinc-900 dark:text-white">
            Find research.
            <br />
            <span className="text-accent-gradient">Reach professors.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Browse university research, read simplified summaries, and draft outreach emails to connect with labs — all from public sources.
          </p>

          {/* Search Bar - Clean, single-line like Vercel */}
          <form onSubmit={handleSearch} className="mt-12 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, professor, or university..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-905 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-850 dark:hover:bg-zinc-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                Search
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Quantum Computing', 'Gene Editing', 'AI Safety', 'Climate Tech', 'Bioelectronics'].map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/feed?topic=${encodeURIComponent(t)}`)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-550 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl transition-all cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar - like Linear's trust signals */}
      <section className="border-y border-zinc-100 dark:border-zinc-800/50 py-8">
        <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">4</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">Universities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">5+</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">Research Areas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">100%</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">Public Data</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">Free</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">For Students</div>
          </div>
        </div>
      </section>

      {/* Featured Research - Bento-style grid */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Latest Research
              </h2>
              <p className="mt-2 text-sm text-zinc-550 dark:text-zinc-500 font-medium">
                Recently processed and verified by administrators.
              </p>
            </div>
            <Link
              href="/feed"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-surface p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <Microscope className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No research indexed yet. Admins can add links to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/research/${item.id}`}
                  className="card-surface p-6 hover-lift group flex flex-col gap-3 transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span className="text-indigo-500 font-semibold">{item.university.name}</span>
                    <span className="text-zinc-300 dark:text-zinc-800">·</span>
                    <span>{item.sourceType}</span>
                    {item.isVerified && (
                      <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded">
                        Verified
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-indigo-500 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 font-normal">
                    {item.summary}
                  </p>

                  <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      {item.publicationDate
                        ? new Date(item.publicationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'Recent'}
                    </span>
                    <span className="text-indigo-500 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read brief
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-indigo-500 border border-indigo-200 dark:border-indigo-900/30 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
            >
              Browse all research
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards - Bento Grid like Linear */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white text-center">
            Built for undergraduate discovery
          </h2>
          <p className="mt-3 text-sm text-zinc-550 dark:text-zinc-500 text-center max-w-lg mx-auto font-medium">
            Everything you need to find research opportunities and connect with professors.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-surface p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Simplified Summaries</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Complex papers broken down into plain language so you can quickly understand what a professor researches.
              </p>
            </div>

            <div className="card-surface p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-violet-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Direct Source Links</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Every profile links directly to the professor's official page and the original research source.
              </p>
            </div>

            <div className="card-surface p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Email Draft Composer</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Generate respectful, personalized outreach emails with your details filled in automatically.
              </p>
            </div>
          </div>

          {/* Secondary feature row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-surface p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Quality Verified</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Each entry shows confidence scores and extraction quality metrics. Admins manually verify data accuracy.
              </p>
            </div>

            <div className="card-surface p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent First</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Research is ranked by recency so you see the latest work first. Filter by university, department, or topic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Start exploring research today
          </h2>
          <p className="mt-3 text-sm text-zinc-550 dark:text-zinc-500 font-medium">
            No sign-up required to browse. Create an account to save briefs and draft emails.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/feed"
              className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
            >
              Browse Research
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth"
              className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Bento Redesign

// Hero Font Style
