import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

interface OutreachComposerButtonProps {
  professorId: string;
  researchItemId?: string;
  label?: string;
  className?: string;
}

export const OutreachComposerButton: React.FC<OutreachComposerButtonProps> = ({
  professorId,
  researchItemId,
  label = 'Reach Out',
  className = ''
}) => {
  const href = `/professor/${professorId}${researchItemId ? `?draftFor=${researchItemId}` : ''}`;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs font-bold transition-all ${className}`}
    >
      <Mail className="w-3.5 h-3.5" />
      {label}
    </Link>
  );
};
