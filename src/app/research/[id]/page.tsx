'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Tag, Calendar, User, ExternalLink, Mail, 
  CheckCircle2, AlertTriangle, Info, Bookmark, ChevronRight, 
  ShieldAlert, BookOpen, AlertCircle, Terminal
} from 'lucide-react';

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/research/${id}`);
      if (!res.ok) {
        throw new Error('Research profile not found');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleSaveToggle = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/research/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev: any) => ({
          ...prev,
          isSaved: json.saved
        }));
      } else {
        router.push('/auth');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm text-zinc-500">Loading research profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center flex flex-col items-center gap-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Error Loading Details</h3>
        <p className="text-sm text-zinc-550 dark:text-zinc-500">{error || 'Record not found'}</p>
        <Link href="/feed" className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/10">
          Back to feed
        </Link>
      </div>
    );
  }

  const { item, relatedItems, isSaved } = data;
  const scores = item.confidenceScores as Record<string, number>;
  
  // Calculate average confidence score
  const avgConfidence = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length * 100
  );

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 0.5) return 'text-amber-550 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getConfidenceProgressColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500';
    if (score >= 0.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 min-h-screen flex flex-col gap-6 animate-fade-in">
      
      {/* Action Row */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <Link 
          href="/feed" 
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>

        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            isSaved 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-500 dark:bg-indigo-950/20 dark:border-indigo-900/30'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/20'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved Brief' : 'Save Brief'}
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Brief details (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="card-surface p-6 md:p-8 flex flex-col gap-6">
            
            {/* Header tags */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.university.name}
                </span>
                {item.department && (
                  <>
                    <span>•</span>
                    <span>{item.department.name}</span>
                  </>
                )}
                <span>•</span>
                <span>{item.sourceType}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug mt-1">
                {item.title}
              </h1>

              {/* Verification Info Alert Banner */}
              <div className="mt-2.5">
                {item.isVerified ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Public Record
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/50 border border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 text-[9px] font-bold uppercase tracking-widest">
                    <Info className="w-3.5 h-3.5" />
                    Pending Admin Verification
                  </div>
                )}
              </div>
            </div>

            {/* Student Summary */}
            <div className="flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-6">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-wider text-accent-gradient">
                Simplified Summary
              </h3>
              <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
                {item.summary}
              </p>
            </div>

            {/* Why it matters box */}
            {item.significance && (
              <div className="flex flex-col gap-2.5 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/20">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-505 dark:text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                  Significance & Impact
                </h3>
                <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-450 leading-relaxed font-normal">
                  {item.significance}
                </p>
              </div>
            )}

            {/* Topic Badges */}
            {item.topics && item.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Keywords:
                </span>
                {item.topics.map((t: any) => (
                  <span 
                    key={t.topic.id}
                    className="text-[10px] font-bold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350 border border-zinc-205 dark:border-zinc-700/50"
                  >
                    {t.topic.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related Items grid */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs uppercase tracking-wider pl-1">
              Related Research Briefs
            </h3>
            {relatedItems.length === 0 ? (
              <span className="text-[11px] text-zinc-400 font-semibold pl-1">No other related research indexed.</span>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedItems.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/research/${rel.id}`}
                    className="card-surface p-5 hover-lift flex flex-col gap-3 group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-semibold">
                        {rel.university.name}
                      </span>
                      <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-200 leading-snug group-hover:text-indigo-500 line-clamp-2">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1 mt-auto">
                      Explore Brief
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sidebar metadata & Logs (1/3) */}
        <div className="flex flex-col gap-6">
          
          {/* Researcher Profile card */}
          <div className="card-surface p-5 flex flex-col gap-4">
            <h3 className="font-bold text-zinc-805 dark:text-zinc-200 text-[10px] uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              Principal Researcher
            </h3>
            
            {item.professor ? (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">
                    Prof. {item.professor.name}
                  </h4>
                  {item.professor.title && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-normal">{item.professor.title}</p>
                  )}
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 block mt-1">{item.university.name}</span>
                </div>

                {/* Info links */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-350">
                  {item.professor.email ? (
                    <a 
                      href={`mailto:${item.professor.email}`}
                      className="flex items-center gap-2 hover:text-indigo-500 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                      {item.professor.email}
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 text-zinc-400 font-medium">
                      <ShieldAlert className="w-4 h-4 text-zinc-300 shrink-0" />
                      Email Not Available
                    </span>
                  )}

                  {item.professor.publicProfileUrl && (
                    <a 
                      href={item.professor.publicProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-indigo-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
                      Research CV Webpage
                    </a>
                  )}
                </div>

                <Link
                  href={`/professor/${item.professor.id}?draftFor=${item.id}`}
                  className="w-full text-center py-3 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Reach Out to Professor
                </Link>
              </div>
            ) : (
              <div className="text-center py-3 flex flex-col items-center gap-1">
                <AlertCircle className="w-7 h-7 text-zinc-300" />
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                  No professor profiles associated.
                </p>
              </div>
            )}

            {/* Source documents links */}
            <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">
                Source Document
              </span>
              <a 
                href={item.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 font-bold hover:underline"
              >
                Go to original research link
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quality metric bar */}
          <div className="card-surface p-5 flex flex-col gap-4">
            <h3 className="font-bold text-zinc-805 dark:text-zinc-200 text-[10px] uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              Extraction Quality
            </h3>

            {/* Radial score */}
            <div className="flex items-center gap-4 py-1">
              <div className="w-14 h-14 rounded-full border-4 border-zinc-100 dark:border-zinc-800 flex items-center justify-center font-bold text-xs shrink-0">
                <span className={getConfidenceColor(avgConfidence/100)}>{avgConfidence}%</span>
              </div>
              <div>
                <h4 className="font-bold text-zinc-700 dark:text-zinc-200 text-xs">Quality Index</h4>
                <p className="text-[9px] text-zinc-450 leading-normal mt-0.5 font-medium">
                  Confidence scores evaluated from source DOM metadata tags and entity patterns.
                </p>
              </div>
            </div>

            {/* Fields list */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {Object.entries(scores).map(([field, score]) => (
                <div key={field} className="flex flex-col gap-1 text-[10px] font-bold">
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-450">
                    <span className="capitalize">{field}</span>
                    <span>{Math.round(score * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-150 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getConfidenceProgressColor(score)}`}
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Warnings list */}
            {item.missingInfoFlags && item.missingInfoFlags.length > 0 && (
              <div className="p-3 bg-rose-50/50 dark:bg-rose-955/10 border border-rose-100 dark:border-rose-900/20 rounded-xl flex flex-col gap-1 text-[9px] font-semibold">
                <div className="flex items-center gap-1 text-rose-500 font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Missing Parameters Detected
                </div>
                <ul className="list-disc list-inside text-zinc-500 dark:text-zinc-400 pl-0.5 font-medium">
                  {item.missingInfoFlags.map((flag: string) => (
                    <li key={flag} className="capitalize">{flag.replace(/([A-Z])/g, ' $1').trim()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Crawler Log Terminal console */}
          <div className="card-surface p-5 flex flex-col gap-4">
            <h3 className="font-bold text-zinc-805 dark:text-zinc-200 text-[10px] uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              Crawler Operations logs
            </h3>

            {item.researchLink?.logs && item.researchLink.logs.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1 bg-zinc-950 p-4 rounded-xl font-mono text-[9px] text-zinc-300 border border-zinc-900 shadow-inner">
                {item.researchLink.logs.map((log: any) => (
                  <div key={log.id} className="flex gap-2 items-start leading-normal">
                    <span className="text-zinc-500 select-none">&gt;</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-indigo-400">{log.stepName}</span>
                        <span className={`text-[8px] font-semibold font-mono ${
                          log.status === 'SUCCESS' ? 'text-emerald-400' :
                          log.status === 'ERROR' ? 'text-rose-400' :
                          'text-zinc-450'
                        }`}>
                          [{log.status}]
                        </span>
                      </div>
                      <p className="text-zinc-300 mt-0.5">{log.message}</p>
                      <span className="text-[8px] text-zinc-500 font-sans mt-0.5 font-semibold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-400 font-semibold">No operational logs recorded.</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

// Metric visuals

// Terminal backdrop

// Metric visuals

// Terminal backdrop
