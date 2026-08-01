import React from 'react';

interface SchoolBadgeProps {
  name: string;
  className?: string;
}

export const SchoolBadge: React.FC<SchoolBadgeProps> = ({ name, className = '' }) => {
  const isHighlighted = name === 'CSULB' || name.includes('Pacific');
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
        isHighlighted
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/40'
          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200/30'
      } ${className}`}
    >
      {name}
    </span>
  );
};
