
import React from 'react';
import type { ParsedRecord } from '../types';
import { RecordCard } from './RecordCard';
import { InfoIcon } from './Icons';

interface ResultsDisplayProps {
  results: ParsedRecord[] | null;
  domain: string;
  isLoading: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, domain, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center p-8 text-slate-500 dark:text-slate-400">
        <p>Querying DNS for <code className="font-mono bg-slate-200 dark:bg-slate-700 p-1 rounded">_for-sale.{domain}</code>...</p>
      </div>
    );
  }

  if (results === null) {
    return (
        <div className="text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <InfoIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Ready to Check</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a domain name above to start the syntax check.</p>
        </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800 shadow-sm rounded-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Records Found</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          No `_for-sale` TXT records were found for the domain <code className="font-mono text-sm bg-slate-200 dark:bg-slate-700 p-1 rounded">{domain}</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Found {results.length} record{results.length > 1 ? 's' : ''} for <code className="font-mono text-indigo-500 text-xl">_for-sale.{domain}</code>
       </h2>
      {results.map((result, index) => (
        <RecordCard key={index} result={result} />
      ))}
    </div>
  );
};
