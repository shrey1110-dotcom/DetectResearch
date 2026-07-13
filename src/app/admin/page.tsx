'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Settings, Database, ListRestart, Trash2, Edit3, CheckCircle, 
  XCircle, Loader, Link as LinkIcon, RefreshCw, AlertCircle, Search, Terminal
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  // Tab state: 'queue' or 'items'
  const [activeTab, setActiveTab] = useState<'queue' | 'items' | 'finder'>('queue');
  
  // Data states
  const [links, setLinks] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit Link Form state
  const [newUrl, setNewUrl] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Active Research Finder Form state
  const [finderUni, setFinderUni] = useState('');
  const [finderTopic, setFinderTopic] = useState('');
  const [finderLoading, setFinderLoading] = useState(false);
  const [finderResults, setFinderResults] = useState<any[]>([]);
  const [finderError, setFinderError] = useState('');

  // Edit Modal states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editSignificance, setEditSignificance] = useState('');
  const [editUni, setEditUni] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editProf, setEditProf] = useState('');
  const [editProfTitle, setEditProfTitle] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfileUrl, setEditProfileUrl] = useState('');
  const [editPubDate, setEditPubDate] = useState('');
  const [editSourceType, setEditSourceType] = useState('publication');
  const [editTopicsString, setEditTopicsString] = useState('');
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [editActivityStatus, setEditActivityStatus] = useState('ACTIVE');
  const [editActivityEvidence, setEditActivityEvidence] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Search items in database
  const [dbSearchQuery, setDbSearchQuery] = useState('');

  // Check admin session and load dashboard data
  const checkAdminAndLoad = async () => {
    setLoading(true);
    setError('');
    try {
      const authRes = await fetch('/api/auth');
      if (!authRes.ok) throw new Error('Auth server error');
      
      const authData = await authRes.json();
      if (!authData.user || authData.user.role !== 'ADMIN') {
        router.push('/auth');
        return;
      }

      const queueRes = await fetch('/api/admin/process');
      if (!queueRes.ok) throw new Error('Failed to load queue');
      const queueData = await queueRes.json();
      setLinks(queueData.links || []);

      const itemsRes = await fetch('/api/research');
      if (!itemsRes.ok) throw new Error('Failed to load research items');
      const itemsData = await itemsRes.json();
      setItems(itemsData.items || []);

    } catch (err: any) {
      setError(err?.message || 'Unauthorized access');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAndLoad();
  }, [router]);

  // Submit link
  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmittingLink(true);

    try {
      const res = await fetch('/api/admin/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to submit URL');
      }

      setNewUrl('');
      
      const queueRes = await fetch('/api/admin/process');
      const queueData = await queueRes.json();
      setLinks(queueData.links || []);

    } catch (err: any) {
      setSubmitError(err?.message || 'Error enqueuing link');
    } finally {
      setSubmittingLink(false);
    }
  };

  // Handle active research search
  const handleFinderSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finderUni.trim()) return;
    setFinderLoading(true);
    setFinderError('');
    setFinderResults([]);
    try {
      const res = await fetch(`/api/admin/find-active-web?university=${encodeURIComponent(finderUni)}&topic=${encodeURIComponent(finderTopic)}`);
      if (!res.ok) {
        throw new Error('Finder API query failed');
      }
      const data = await res.json();
      setFinderResults(data.results || []);
    } catch (err: any) {
      setFinderError(err?.message || 'Error searching web resources');
    } finally {
      setFinderLoading(false);
    }
  };

  // Enqueue URL from finder search results
  const handleEnqueueFromFinder = async (url: string) => {
    try {
      const res = await fetch('/api/admin/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to submit URL');
      }
      alert('URL enqueued successfully! Go to the Links Queue tab to monitor progress.');
      
      // Update queue list
      const queueRes = await fetch('/api/admin/process');
      const queueData = await queueRes.json();
      setLinks(queueData.links || []);
    } catch (err: any) {
      alert(err?.message || 'Error enqueuing URL');
    }
  };

  // Trigger manual reprocessing
  const handleReprocess = async (linkId: string) => {
    try {
      const res = await fetch(`/api/admin/process/${linkId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const queueRes = await fetch('/api/admin/process');
        const queueData = await queueRes.json();
        setLinks(queueData.links || []);
      }
    } catch (err) {
      console.error('Failed to trigger reprocessing:', err);
    }
  };

  // Delete Link
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link and all its extracted research details?')) return;
    try {
      const res = await fetch(`/api/admin/process/${linkId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== linkId));
        setItems(prev => prev.filter(i => i.researchLinkId !== linkId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle verification state immediately
  const handleToggleVerify = async (item: any) => {
    try {
      const res = await fetch(`/api/admin/research/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !item.isVerified })
      });

      if (res.ok) {
        const json = await res.json();
        setItems(prev => prev.map(i => i.id === item.id ? json.researchItem : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modal and fill state
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditSummary(item.summary);
    setEditSignificance(item.significance || '');
    setEditUni(item.university.name);
    setEditDept(item.department?.name || '');
    setEditProf(item.professor?.name || '');
    setEditProfTitle(item.professor?.title || '');
    setEditEmail(item.professor?.email || '');
    setEditProfileUrl(item.professor?.publicProfileUrl || '');
    
    if (item.publicationDate) {
      setEditPubDate(new Date(item.publicationDate).toISOString().split('T')[0]);
    } else {
      setEditPubDate('');
    }
    
    setEditSourceType(item.sourceType);
    
    const topicNames = item.topics.map((t: any) => t.topic.name).join(', ');
    setEditTopicsString(topicNames);
    
    setEditIsVerified(item.isVerified);
    setEditActivityStatus(item.activityStatus || 'ACTIVE');
    setEditActivityEvidence(item.activityEvidence || '');
  };

  // Save changes from Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEdit(true);

    const parsedTopics = editTopicsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      const res = await fetch(`/api/admin/research/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          significance: editSignificance,
          universityName: editUni,
          departmentName: editDept,
          professorName: editProf,
          professorTitle: editProfTitle,
          email: editEmail,
          publicProfileUrl: editProfileUrl,
          publicationDate: editPubDate || null,
          sourceType: editSourceType,
          topics: parsedTopics,
          isVerified: editIsVerified,
          activityStatus: editActivityStatus,
          activityEvidence: editActivityEvidence
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save changes');
      }

      const json = await res.json();
      
      setItems(prev => prev.map(i => i.id === editingItem.id ? json.researchItem : i));
      setEditingItem(null);

    } catch (err) {
      console.error(err);
      alert('Error updating research details');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRefresh = async () => {
    await checkAdminAndLoad();
  };

  const filteredDbItems = items.filter(item => {
    const q = dbSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.professor?.name.toLowerCase().includes(q) ||
      item.university.name.toLowerCase().includes(q) ||
      item.topics.some((t: any) => t.topic.name.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm text-zinc-500">Loading admin resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-xl font-bold text-zinc-805 dark:text-zinc-100">Access Denied</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
        <button onClick={handleRefresh} className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 min-h-screen flex flex-col gap-6 animate-fade-in">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Settings className="text-indigo-500 w-8 h-8 animate-spin-slow" />
            Admin Control Center
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-semibold">
            Process academic sources, examine extraction console pipelines, and verify content records.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="px-4.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Panel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-zinc-800 text-white dark:bg-indigo-600'
              : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Links Queue ({links.length})
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'items'
              ? 'bg-zinc-800 text-white dark:bg-indigo-600'
              : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Index ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('finder')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'finder'
              ? 'bg-zinc-800 text-white dark:bg-indigo-600'
              : 'border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
          }`}
        >
          <Search className="w-4 h-4" />
          Web Finder
        </button>
      </div>

      {/* Tab Panel 1: Queue and submit links */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submit Link Form */}
          <div className="col-span-1">
            <div className="card-surface p-6 flex flex-col gap-5 sticky top-28">
              <div>
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-base flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-indigo-500" />
                  Add Link
                </h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-normal font-medium">
                  Paste university news posts, lab pages, grant pages, or professor bio links.
                </p>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitLink} className="flex flex-col gap-4 font-semibold">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest pl-0.5">
                    Target URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://news.mit.edu/2026/quantum-coherence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/60 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLink}
                  className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-indigo-650 hover:bg-zinc-800 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingLink ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Enqueue URL
                </button>
              </form>
            </div>
          </div>

          {/* Links Queue Table list */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card-surface p-6 overflow-hidden">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm uppercase tracking-wider mb-4 border-b border-zinc-105 dark:border-zinc-800 pb-3">
                Queue Monitor
              </h3>

              {links.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-2">
                  <LinkIcon className="w-8 h-8 text-zinc-300" />
                  <p className="text-xs text-zinc-400 font-semibold">No URLs in the processing queue.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
                  {links.map((link) => (
                    <div key={link.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 relative bg-zinc-50/20 dark:bg-zinc-900/25">
                      
                      {/* Top Row */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className="text-[9px] text-zinc-400 font-bold">
                            Added: {new Date(link.createdAt).toLocaleString()}
                          </span>
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-indigo-500 hover:underline break-all"
                          >
                            {link.url}
                          </a>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${
                            link.status === 'PROCESSED' ? 'bg-emerald-50 text-emerald-500 border-emerald-200/20' :
                            link.status === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-200/20' :
                            link.status === 'PROCESSING' ? 'bg-amber-50 text-amber-500 border-amber-200/20 animate-pulse' :
                            'bg-zinc-100 text-zinc-400 border-zinc-200'
                          }`}>
                            {link.status}
                          </span>
                        </div>
                      </div>

                      {/* Error block */}
                      {link.status === 'FAILED' && link.errorMsg && (
                        <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100/50 text-[10px] text-rose-550 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Error: {link.errorMsg}</span>
                        </div>
                      )}

                      {/* Logs details */}
                      {link.logs && link.logs.length > 0 && (
                        <details className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                          <summary className="cursor-pointer hover:text-indigo-500 font-bold select-none py-1 flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5" />
                            View Extraction Logs ({link.logs.length})
                          </summary>
                          
                          {/* Terminal-style logs container */}
                          <div className="flex flex-col gap-2 mt-2 border border-zinc-900 bg-zinc-950 p-4 rounded-xl font-mono text-[9px] text-zinc-300 max-h-40 overflow-y-auto shadow-inner">
                            {link.logs.map((log: any) => (
                              <div key={log.id} className="flex gap-2 items-start leading-relaxed">
                                <span className="text-zinc-650 select-none">&gt;</span>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1 font-bold">
                                    <span className="text-indigo-400">{log.stepName}</span>
                                    <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : log.status === 'ERROR' ? 'text-rose-400' : 'text-zinc-500'}>
                                      [{log.status}]
                                    </span>
                                  </div>
                                  <p className="text-zinc-300 mt-0.5">{log.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-2.5 mt-1 justify-end text-xs font-bold text-zinc-400">
                        <button
                          onClick={() => handleReprocess(link.id)}
                          className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[10px] text-zinc-650 dark:text-zinc-350 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ListRestart className="w-3.5 h-3.5" />
                          Re-process
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-[10px] text-rose-550 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Link
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab Panel 2: Research Database List & Edit */}
      {activeTab === 'items' && (
        <div className="card-surface p-6 flex flex-col gap-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm uppercase tracking-wider">
              Manage Extracted Profiles ({filteredDbItems.length})
            </h3>
            
            {/* Search */}
            <div className="relative flex items-center max-w-sm w-full">
              <Search className="absolute left-3 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={dbSearchQuery}
                onChange={(e) => setDbSearchQuery(e.target.value)}
                placeholder="Search DB by title, prof, school..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Database Items */}
          {filteredDbItems.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-2">
              <Database className="w-8 h-8 text-zinc-300" />
              <p className="text-xs text-zinc-400 font-semibold">No research records found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDbItems.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden bg-zinc-50/10 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-205">
                  
                  <div className="flex flex-col gap-1 max-w-[70%] text-[10px] font-bold text-zinc-405 dark:text-zinc-500">
                    <div className="flex flex-wrap items-center gap-2 uppercase tracking-wide">
                      <span>{item.university.name}</span>
                      {item.department && (
                        <>
                          <span>•</span>
                          <span>{item.department.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{item.sourceType}</span>
                    </div>

                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 line-clamp-1 hover:text-indigo-500 transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-zinc-500">
                      {item.professor && (
                        <span>Researcher: Prof. {item.professor.name}</span>
                      )}
                      <span>
                        Date: {item.publicationDate ? new Date(item.publicationDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center font-bold text-xs">
                    <button
                      onClick={() => handleToggleVerify(item)}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-1 cursor-pointer transition-all ${
                        item.isVerified
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-550 hover:bg-zinc-50'
                      }`}
                    >
                      {item.isVerified ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {item.isVerified ? 'Verified' : 'Verify'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>

                    <button
                      onClick={() => handleDeleteLink(item.researchLinkId)}
                      className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-550 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Tab Panel 3: Active Research Web Finder */}
      {activeTab === 'finder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Query Form */}
          <div className="col-span-1">
            <div className="card-surface p-6 flex flex-col gap-5 sticky top-28">
              <div>
                <h3 className="font-bold text-zinc-805 dark:text-zinc-100 text-base flex items-center gap-1.5">
                  <Search className="w-5 h-5 text-indigo-500" />
                  Find Active Research
                </h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-normal font-medium">
                  Search faculty, labs, and research portals at any school. Prioritizes student opportunity indicators and ongoing grants.
                </p>
              </div>

              {finderError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{finderError}</span>
                </div>
              )}

              <form onSubmit={handleFinderSearch} className="flex flex-col gap-4 font-semibold text-xs text-zinc-700">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest pl-0.5">
                    University / School Name
                  </label>
                  <input
                    type="text"
                    required
                    value={finderUni}
                    onChange={(e) => setFinderUni(e.target.value)}
                    placeholder="e.g. Stanford University or MIT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/60 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest pl-0.5">
                    Department / Topic Area
                  </label>
                  <input
                    type="text"
                    required
                    value={finderTopic}
                    onChange={(e) => setFinderTopic(e.target.value)}
                    placeholder="e.g. Bioelectronics or Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/60 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={finderLoading}
                  className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-indigo-650 hover:bg-zinc-800 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {finderLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Find Opportunities
                </button>
              </form>
            </div>
          </div>

          {/* Results Table list */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card-surface p-6 overflow-hidden">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm uppercase tracking-wider mb-4 border-b border-zinc-105 dark:border-zinc-800 pb-3">
                Identified Research Web Portals ({finderResults.length})
              </h3>

              {finderResults.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-zinc-350" />
                  <p className="text-xs text-zinc-400 font-semibold">Enter details on the left to locate active web sources.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
                  {finderResults.map((result, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 relative bg-zinc-50/20 dark:bg-zinc-900/25">
                      
                      {/* Top Row */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className={`px-2.5 py-0.5 rounded border text-[8.5px] font-black uppercase tracking-wider self-start mb-1.5 ${
                            result.likelihood.includes('High') 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/20 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                          }`}>
                            {result.likelihood}
                          </span>
                          <a 
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-zinc-705 dark:text-zinc-200 hover:text-indigo-500 hover:underline break-all"
                          >
                            {result.title}
                          </a>
                        </div>

                        <button
                          onClick={() => handleEnqueueFromFinder(result.url)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0 cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Extract Opportunities
                        </button>
                      </div>

                      {/* Snippet / Description */}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-normal">
                        {result.snippet}
                      </p>

                      <div className="text-[9px] text-zinc-400 font-semibold break-all">
                        {result.url}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl card-surface p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200 text-xs font-bold text-zinc-700">
            
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-6">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-150 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="text-indigo-500 w-5 h-5" />
                Edit Research Metadata
              </h3>
              <button 
                onClick={() => setEditingItem(null)} 
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Research Title</span>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Student Summary</span>
                <textarea
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Significance</span>
                <textarea
                  value={editSignificance}
                  onChange={(e) => setEditSignificance(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">University</span>
                <input
                  type="text"
                  required
                  value={editUni}
                  onChange={(e) => setEditUni(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Department</span>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Professor Name</span>
                <input
                  type="text"
                  value={editProf}
                  onChange={(e) => setEditProf(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Professor Title</span>
                <input
                  type="text"
                  value={editProfTitle}
                  onChange={(e) => setEditProfTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-550 uppercase tracking-widest pl-0.5">Public Email</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-455 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Profile URL</span>
                <input
                  type="url"
                  value={editProfileUrl}
                  onChange={(e) => setEditProfileUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-455 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Research Date</span>
                <input
                  type="date"
                  value={editPubDate}
                  onChange={(e) => setEditPubDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-455 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Source Type</span>
                <select
                  value={editSourceType}
                  onChange={(e) => setEditSourceType(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <option value="publication">Publication</option>
                  <option value="lab page">Lab Page</option>
                  <option value="university news">University News</option>
                  <option value="professor page">Professor Page</option>
                  <option value="grant">Grant</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-455 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Activity Status</span>
                <select
                  value={editActivityStatus}
                  onChange={(e) => setEditActivityStatus(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <option value="ACTIVE">Active (Ongoing research / recruitment)</option>
                  <option value="POSSIBLY_ACTIVE">Likely Active (Active lab / project)</option>
                  <option value="ARCHIVED">Archived / Past Research</option>
                  <option value="UNKNOWN">Unknown Status</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-550 uppercase tracking-widest pl-0.5">Activity Evidence Indicator</span>
                <input
                  type="text"
                  value={editActivityEvidence}
                  onChange={(e) => setEditActivityEvidence(e.target.value)}
                  placeholder="e.g. Page says hiring undergraduates; Active grant dates run 2025-2028"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[9px] text-zinc-450 dark:text-zinc-550 uppercase tracking-widest pl-0.5">Topics (Comma separated)</span>
                <input
                  type="text"
                  value={editTopicsString}
                  onChange={(e) => setEditTopicsString(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1"
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2 py-2 font-semibold">
                <input
                  id="modal-verify"
                  type="checkbox"
                  checked={editIsVerified}
                  onChange={(e) => setEditIsVerified(e.target.checked)}
                  className="w-4 h-4 text-indigo-500 rounded border-zinc-200 focus:ring-indigo-500"
                />
                <label htmlFor="modal-verify" className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 cursor-pointer">
                  Mark this information as verified and confirmed by administrator.
                </label>
              </div>

              <div className="sm:col-span-2 mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-250 text-zinc-500 dark:border-zinc-800 font-bold hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  {savingEdit && <Loader className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Verification trigger

// Table cleanups

// Verification trigger

// Table cleanups
