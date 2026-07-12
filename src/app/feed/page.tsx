'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, MapPin, Tag, Calendar, User, Mail, 
  CheckCircle2, ChevronRight, SlidersHorizontal, BookOpen 
} from 'lucide-react';

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State lists
  const [items, setItems] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    universities: [],
    departments: [],
    topics: []
  });
  const [loading, setLoading] = useState(true);

  // Filter bindings (synced with URL searchParams)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [universityId, setUniversityId] = useState(searchParams.get('universityId') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [sourceType, setSourceType] = useState(searchParams.get('sourceType') || '');
  const [dateStart, setDateStart] = useState(searchParams.get('dateStart') || '');
  const [dateEnd, setDateEnd] = useState(searchParams.get('dateEnd') || '');

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (universityId) params.set('universityId', universityId);
      if (departmentId) params.set('departmentId', departmentId);
      if (topic) params.set('topic', topic);
      if (sourceType) params.set('sourceType', sourceType);
      if (dateStart) params.set('dateStart', dateStart);
      if (dateEnd) params.set('dateEnd', dateEnd);

      const res = await fetch(`/api/research?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setFilters(data.filters);
      }
    } catch (err) {
      console.error('Failed to load feed items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync state with URL when search params change
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setUniversityId(searchParams.get('universityId') || '');
    setDepartmentId(searchParams.get('departmentId') || '');
    setTopic(searchParams.get('topic') || '');
    setSourceType(searchParams.get('sourceType') || '');
    setDateStart(searchParams.get('dateStart') || '');
    setDateEnd(searchParams.get('dateEnd') || '');
    
    fetchFeed();
  }, [searchParams]);

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (universityId) params.set('universityId', universityId);
    if (departmentId) params.set('departmentId', departmentId);
    if (topic) params.set('topic', topic);
    if (sourceType) params.set('sourceType', sourceType);
    if (dateStart) params.set('dateStart', dateStart);
    if (dateEnd) params.set('dateEnd', dateEnd);
    
    router.push(`/feed?${params.toString()}`);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSearch('');
    setUniversityId('');
    setDepartmentId('');
    setTopic('');
    setSourceType('');
    setDateStart('');
    setDateEnd('');
    router.push('/feed');
    setShowMobileFilters(false);
  };

  const getSourceTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'publication') return 'bg-indigo-50/50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/20';
    if (t === 'lab page') return 'bg-violet-50/50 text-violet-650 dark:bg-violet-950/20 dark:text-violet-400 border border-violet-200/50 dark:border-violet-900/20';
    if (t === 'university news') return 'bg-amber-50/50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/20';
    if (t === 'professor page') return 'bg-blue-50/50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/20';
    if (t === 'grant') return 'bg-emerald-50/50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/20';
    return 'bg-zinc-50 text-zinc-600 border border-zinc-200/50 dark:bg-zinc-800/30 dark:text-zinc-405';
  };

  const formatRecency = (dateString?: string, fallbackString?: string) => {
    const targetDate = dateString ? new Date(dateString) : new Date(fallbackString || '');
    if (isNaN(targetDate.getTime())) return 'Recently added';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - targetDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'This week';
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)}w ago`;
    return targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 min-h-screen animate-fade-in">
      
      {/* Search feed header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Research Discovery Feed
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-500 mt-1 font-medium">
            Browse through university research links, ranked from most recent to oldest.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter / Search
        </button>
      </div>

      {/* Grid structure */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <div className="hidden md:block col-span-1">
          <form onSubmit={applyFilters} className="card-surface p-5 flex flex-col gap-4 sticky top-28">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-[10px] uppercase tracking-widest">
                Search Filters
              </span>
              <button 
                type="button" 
                onClick={clearFilters} 
                className="text-[9px] font-bold text-indigo-505 hover:underline uppercase tracking-wide cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Keyword Search */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-0.5">
                Keyword
              </span>
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search keywords..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold focus:ring-1 focus:ring-indigo-505 focus:outline-none"
                />
              </div>
            </div>

            {/* School */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-0.5">
                University
              </span>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-505"
              >
                <option value="">All Universities</option>
                {filters.universities.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-0.5">
                Department
              </span>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550"
              >
                <option value="">All Departments</option>
                {filters.departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.university.name})</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-0.5">
                Research Interest
              </span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-505"
              >
                <option value="">All Topics</option>
                {filters.topics.map((t: any) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Source Type */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-0.5">
                Source Type
              </span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-505"
              >
                <option value="">All Types</option>
                <option value="publication">Publication</option>
                <option value="lab page">Lab Page</option>
                <option value="university news">University News</option>
                <option value="professor page">Professor Page</option>
                <option value="grant">Grant</option>
              </select>
            </div>

            {/* Date Start */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest pl-0.5">
                Published After
              </span>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center"
            >
              Apply Filter
            </button>
          </form>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 p-6 bg-zinc-900/40 backdrop-blur-md md:hidden flex justify-center items-center">
            <div className="w-full max-w-sm card-surface p-6 shadow-xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-zinc-805 dark:text-zinc-100 text-[10px] uppercase tracking-widest">Mobile Filters</span>
                <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-zinc-500">Close</button>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keyword Search..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs focus:ring-1"
                />
                
                <select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1"
                >
                  <option value="">All Schools</option>
                  {filters.universities.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1"
                >
                  <option value="">All Topics</option>
                  {filters.topics.map((t: any) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>

                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs focus:ring-1"
                >
                  <option value="">All Types</option>
                  <option value="publication">Publication</option>
                  <option value="lab page">Lab Page</option>
                  <option value="university news">University News</option>
                  <option value="professor page">Professor Page</option>
                  <option value="grant">Grant</option>
                </select>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={clearFilters}
                    type="button" 
                    className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => applyFilters()}
                    className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-xs font-bold shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards Feed (Right side) */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
          
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-surface p-6 animate-pulse flex flex-col gap-4">
                <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="card-surface p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">No Research Found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-normal">
                We couldn't find any research briefs matching your query. Adjust filters to search again.
              </p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-xl border border-indigo-250 dark:border-indigo-900/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs font-bold text-indigo-500 transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="card-surface p-6 hover-lift flex flex-col gap-4 relative overflow-hidden"
              >
                {item.isVerified && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                )}

                {/* Card Title & Info */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-indigo-500 dark:text-indigo-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-450" />
                        {item.university.name}
                      </span>
                      {item.department && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{item.department.name}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getSourceTypeColor(item.sourceType)}`}>
                        {item.sourceType}
                      </span>
                      {item.isVerified && (
                        <span className="flex items-center gap-0.5 text-emerald-500 bg-emerald-50/50 border border-emerald-200/20 rounded px-2 py-0.5 text-[9px] font-bold tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-zinc-800 dark:text-zinc-100 hover:text-indigo-500 transition-colors leading-snug mt-1">
                    <Link href={`/research/${item.id}`}>{item.title}</Link>
                  </h3>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal line-clamp-3">
                  {item.summary}
                </p>

                {/* Dynamic Topics Tags */}
                {item.topics && item.topics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {item.topics.map((t: any) => (
                      <span 
                        key={t.topic.id}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-350"
                      >
                        {t.topic.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer details & Actions */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 mt-2 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                  <div className="flex flex-wrap items-center gap-4">
                    {item.professor && (
                      <Link 
                        href={`/professor/${item.professor.id}`}
                        className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 transition-colors"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        Prof. {item.professor.name}
                      </Link>
                    )}
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      Updated: {formatRecency(item.publicationDate, item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.professor && (
                      <Link
                        href={`/professor/${item.professor.id}?draftFor=${item.id}`}
                        className="px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/30 text-indigo-505 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-[10px] font-bold transition-all flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reach Out
                      </Link>
                    )}
                    <Link
                      href={`/research/${item.id}`}
                      className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <span className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm text-zinc-500">Loading discovery feed...</p>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}

// Mobile spacing fixes

// Cache optimization

// Mobile spacing fixes

// Cache optimization
