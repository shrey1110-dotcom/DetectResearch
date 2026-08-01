'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, User, Mail, ExternalLink, GraduationCap, 
  Clipboard, Send, Save, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { ensureAbsoluteUrl } from '@/lib/url';

function ProfessorProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const draftForPaperId = searchParams.get('draftFor') || '';

  // Data states
  const [professor, setProfessor] = useState<any>(null);
  const [researchItems, setResearchItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form input states
  const [studentName, setStudentName] = useState('');
  const [studentMajor, setStudentMajor] = useState('');
  const [studentYear, setStudentYear] = useState('Freshman');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [interestReason, setInterestReason] = useState('');
  const [skills, setSkills] = useState('');

  // Save/Copy action feedback
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

  const fetchProfessor = async () => {
    try {
      const res = await fetch(`/api/professors/${id}`);
      if (!res.ok) {
        throw new Error('Professor details not found');
      }
      const json = await res.json();
      setProfessor(json.professor);
      setResearchItems(json.researchItems);

      if (draftForPaperId) {
        setSelectedPaperId(draftForPaperId);
      } else if (json.researchItems.length > 0) {
        setSelectedPaperId(json.researchItems[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load professor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfessor();
  }, [id]);

  useEffect(() => {
    const fetchUserDefault = async () => {
      try {
        const res = await fetch('/api/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setStudentName(data.user.name);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserDefault();
  }, []);

  // Get active paper info
  const selectedPaper = researchItems.find(item => item.id === selectedPaperId);
  const paperTitle = selectedPaper ? selectedPaper.title : 'your research';
  const paperTopic = selectedPaper ? selectedPaper.topic : (professor?.interests[0] || 'your academic domain');
  
  // Extract professor last name
  const nameParts = professor ? professor.name.split(' ') : [];
  const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : 'Researcher';

  // Live subject & body generation
  const generatedSubject = `Interest in Your Research on ${paperTopic}`;
  const generatedBody = `Dear Professor ${lastName},

My name is ${studentName || '[Student Name]'}, and I’m a ${(studentYear || '[Year]').toLowerCase()} ${studentMajor || '[Major]'} student interested in ${paperTopic.toLowerCase()}. I came across your research on "${paperTitle}", and I found it especially interesting because ${interestReason || '[brief reason why you like this paper]'}.

I’m interested in learning more about your work and wanted to ask whether there may be any current or future opportunities for undergraduate students to get involved.

I have experience with ${skills || '[skills/classes/projects]'}, and I would be grateful for the chance to contribute or learn more.

Thank you for your time.

Best,
${studentName || '[Student Name]'}`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${generatedSubject}\n\n${generatedBody}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!studentName || !studentMajor || !selectedPaperId) {
      setSaveError('Name, major, and research paper are required to save.');
      return;
    }
    setSaveSuccess(false);
    setSaveError('');
    setSavingDraft(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: id,
          researchItemId: selectedPaperId,
          studentName,
          studentMajor,
          studentYear,
          studentInterests: interestReason,
          studentSkills: skills,
          emailSubject: generatedSubject,
          emailBody: generatedBody
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to save draft');
      }

      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err?.message || 'Unauthorized: Please log in to save drafts.');
    } finally {
      setSavingDraft(false);
    }
  };

  const getMailtoLink = () => {
    if (!professor?.email) return '#';
    return `mailto:${professor.email}?subject=${encodeURIComponent(generatedSubject)}&body=${encodeURIComponent(generatedBody)}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm text-zinc-500">Loading professor profile...</p>
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center flex flex-col items-center gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Error Loading Profile</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{error || 'Professor not found'}</p>
        <Link href="/feed" className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 min-h-screen flex flex-col gap-6 animate-fade-in">
      
      {/* Header back */}
      <div>
        <Link 
          href="/feed" 
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to feed
        </Link>
      </div>

      {/* Professor CV Header */}
      <div className="card-surface p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/10">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
              Prof. {professor.name}
            </h1>
            {professor.title && (
              <p className="text-xs text-zinc-400 dark:text-zinc-555 font-semibold mt-0.5">{professor.title}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-450">
              <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {professor.university.name}
              </span>
              {professor.department && (
                <>
                  <span>•</span>
                  <span>{professor.department.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 font-bold text-[11px] shrink-0 pt-4 border-t border-zinc-100 dark:border-zinc-800 md:pt-0 md:border-0">
          {professor.email ? (
            <a 
              href={`mailto:${professor.email}`}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 hover:border-indigo-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              {professor.email}
            </a>
          ) : (
            <span className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-300" />
              No Public Email
            </span>
          )}

          {professor.publicProfileUrl && (
            <a 
              href={ensureAbsoluteUrl(professor.publicProfileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 hover:border-indigo-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-zinc-400" />
              Profile Webpage
            </a>
          )}
        </div>
      </div>

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Research papers & interests (2/5) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card-surface p-5 flex flex-col gap-4">
            <h3 className="font-bold text-zinc-805 dark:text-zinc-200 text-[10px] uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              Research Interests
            </h3>
            {professor.interests && professor.interests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {professor.interests.map((interest: string) => (
                  <span 
                    key={interest} 
                    className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-505 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-zinc-400 font-semibold">No research topics associated.</span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-zinc-855 dark:text-zinc-200 text-xs uppercase tracking-wider pl-1">
              Active Labs & Projects ({researchItems.length})
            </h3>
            <div className="flex flex-col gap-3">
              {researchItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedPaperId(item.id)}
                  className={`card-surface p-5 cursor-pointer hover:border-indigo-400/40 hover-lift flex flex-col gap-2 relative overflow-hidden ${
                    selectedPaperId === item.id 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/5 dark:bg-indigo-950/5'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-indigo-500 uppercase">{item.topic}</span>
                      {item.activityStatus === 'ACTIVE' && (
                        <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded uppercase dark:bg-emerald-950/20 dark:text-emerald-400">Active</span>
                      )}
                    </div>
                    <span className="text-[8.5px] text-zinc-400 font-bold">
                      {item.activityStatus === 'ACTIVE' ? 'Active opportunity' : 'Recent project'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex justify-between items-center mt-2 text-[9px] text-zinc-400 font-bold border-t border-zinc-100 dark:border-zinc-800 pt-2">
                    <Link href={`/research/${item.id}`} className="hover:text-indigo-505 flex items-center gap-0.5">
                      Explore Brief
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    {selectedPaperId === item.id && (
                      <span className="text-indigo-505 font-semibold">Active selection</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sleek Email Client Mockup (3/5) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="card-surface p-6 md:p-8 flex flex-col gap-6">
            
            <div className="flex flex-col">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-lg flex items-center gap-1.5">
                <GraduationCap className="text-indigo-500 w-5.5 h-5.5" />
                Email Outreach Composer
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium leading-normal">
                Fill in your candidate details. The email mockup client on the right shows how the draft is generated in real-time.
              </p>
            </div>

            {/* Split Composer & Client mockup */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-5">
              
              {/* Inputs Column */}
              <div className="flex flex-col gap-4 font-bold text-xs">
                
                {/* Student Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Your Full Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Robin Banks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Major */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Your Major</label>
                  <input
                    type="text"
                    value={studentMajor}
                    onChange={(e) => setStudentMajor(e.target.value)}
                    placeholder="e.g. Bioengineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Academic Year */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Academic Year</label>
                  <select
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                {/* Paper Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase tracking-widest pl-0.5">Referencing Paper</label>
                  <select
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500"
                  >
                    {researchItems.map(item => (
                      <option key={item.id} value={item.id}>{item.title.substring(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                {/* Interest statement */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-0.5">Interest Statement</label>
                  <textarea
                    value={interestReason}
                    onChange={(e) => setInterestReason(e.target.value)}
                    rows={3}
                    placeholder="Briefly state why this research area excites you..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Experience & Skills */}
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400 dark:text-zinc-555 uppercase tracking-widest pl-0.5">Skills / Coursework</label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={3}
                    placeholder="Highlight your coding, math, lab, or class projects..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Mockup Client Column */}
              <div className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner text-xs font-semibold">
                
                {/* Mock Browser/Mail Header bar */}
                <div className="bg-zinc-900 p-3 flex items-center justify-between border-b border-zinc-950">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono tracking-wider font-bold">OUTBOX CLIENT</span>
                  <div className="w-10"></div>
                </div>

                {/* Sender/Receiver lines */}
                <div className="p-3.5 border-b border-zinc-900 flex flex-col gap-2 bg-zinc-900/50 text-[10px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-right text-zinc-555">To:</span>
                    <span className="text-zinc-350">{professor.email || 'professor@university.edu'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-right text-zinc-555">Subject:</span>
                    <span className="text-indigo-400 font-bold">{generatedSubject}</span>
                  </div>
                </div>

                {/* Email Content body preview */}
                <div className="p-4 flex-grow font-mono text-[10.5px] leading-relaxed text-zinc-300 overflow-y-auto max-h-[360px] whitespace-pre-wrap bg-zinc-950/30">
                  {/* Styled body text with highlighted variables */}
                  Dear Professor {lastName},

My name is <span className={studentName ? "text-indigo-400 font-bold" : "text-zinc-600 font-bold"}>{studentName || '[Student Name]'}</span>, and I’m a <span className={studentYear ? "text-indigo-400 font-bold" : "text-zinc-600 font-bold"}>{(studentYear || '[Year]').toLowerCase()}</span> <span className={studentMajor ? "text-indigo-400 font-bold" : "text-zinc-600 font-bold"}>{studentMajor || '[Major]'}</span> student interested in <span className="text-indigo-400 font-bold">{paperTopic.toLowerCase()}</span>. I came across your research on "{selectedPaper ? <span className="text-indigo-400 font-bold">"{selectedPaper.title}"</span> : '[Reference Paper]'}, and I found it especially interesting because <span className={interestReason ? "text-violet-400 font-bold" : "text-zinc-600 font-bold"}>{interestReason || '[brief reason why you like this paper]'}</span>.

I’m interested in learning more about your work and wanted to ask whether there may be any current or future opportunities for undergraduate students to get involved.

I have experience with <span className={skills ? "text-violet-400 font-bold" : "text-zinc-600 font-bold"}>{skills || '[skills/classes/projects]'}</span>, and I would be grateful for the chance to contribute or learn more.

Thank you for your time.

Best,
<span className={studentName ? "text-indigo-400 font-bold" : "text-zinc-600 font-bold"}>{studentName || '[Student Name]'}</span>
                </div>

                {/* Mailbox action toolbar */}
                <div className="bg-zinc-900 p-3.5 border-t border-zinc-950 flex flex-wrap gap-2 justify-end">
                  {/* Copy */}
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copySuccess ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-zinc-500" />}
                    {copySuccess ? 'Copied' : 'Copy'}
                  </button>

                  {/* Save */}
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-zinc-500" />
                    {savingDraft ? 'Saving...' : 'Save Draft'}
                  </button>

                  {/* Open Mail */}
                  {professor.email && (
                    <a
                      href={getMailtoLink()}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white flex items-center gap-1 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Mail
                    </a>
                  )}
                </div>

              </div>

            </div>

            {/* Error / Success alert status */}
            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Draft saved successfully! You can access it on your student panel.
              </div>
            )}
            {saveError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProfessorProfilePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <span className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm text-zinc-500">Loading professor profile...</p>
      </div>
    }>
      <ProfessorProfileContent />
    </Suspense>
  );
}

// Outbox composer UI

// Name parser correction

// Outbox composer UI

// Name parser correction
