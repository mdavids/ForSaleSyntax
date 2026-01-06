import React from 'react';
// Fix: Import TagType to resolve reference error.
import { RecordStatus, TagType } from '../types';
import type { ParsedRecord } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from './Icons';

interface RecordCardProps {
  result: ParsedRecord;
}

const statusStyles = {
  [RecordStatus.VALID]: {
    icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    border: 'border-green-500',
  },
  [RecordStatus.INVALID]: {
    icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    border: 'border-red-500',
  },
  [RecordStatus.WARNING]: {
    icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    border: 'border-yellow-500',
  },
};

export const RecordCard: React.FC<RecordCardProps> = ({ result }) => {
  const { icon, badge, border } = statusStyles[result.status];

  const renderValue = () => {
    if (result.tag === TagType.FURI && result.status !== RecordStatus.INVALID) {
      return (
        <a
          href={String(result.value)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-500 dark:text-indigo-400 hover:underline break-all"
        >
          {String(result.value)}
        </a>
      );
    }
    return (
      <code className="font-medium text-slate-800 dark:text-slate-100 break-all">
        {typeof result.value === 'object' ? JSON.stringify(result.value) : String(result.value)}
      </code>
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-800 shadow-md rounded-lg border-l-4 ${border} overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-3 rounded-md flex-grow">"{result.raw}"</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge}`}>
            {icon}
            <span className="ml-2">{result.status}</span>
          </span>
        </div>
        
        {result.errors.length > 0 && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Validation Issues:</h4>
            <ul className="mt-1 list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
              {result.errors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2">Parsed Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Version:</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{result.version || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tag:</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{result.tag}</span>
            </div>
            {result.tag !== TagType.NONE && result.tag !== TagType.UNKNOWN && (
                 <div className="col-span-1 sm:col-span-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Value:</span>
                    {renderValue()}
                </div>
            )}
            {result.interpretation && (
                <div className="mt-2 col-span-1 sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                    <span className="text-slate-500 dark:text-slate-400">Interpretation:</span>
                    <p className="font-medium text-slate-800 dark:text-slate-100 italic">"{result.interpretation}"</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};