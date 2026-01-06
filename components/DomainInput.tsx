
import React, { useState } from 'react';

interface DomainInputProps {
  onCheck: (domain: string) => void;
  isLoading: boolean;
}

export const DomainInput: React.FC<DomainInputProps> = ({ onCheck, isLoading }) => {
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheck(domain.trim());
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-mono">_for-sale.</span>
           <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full pl-28 pr-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:border-indigo-500 focus:ring-indigo-500 rounded-md transition duration-200"
            disabled={isLoading}
            />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </>
          ) : (
            'Check Syntax'
          )}
        </button>
      </form>
    </div>
  );
};
