
import React, { useState, useCallback } from 'react';
import { DomainInput } from './components/DomainInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { fetchForSaleRecords } from './services/dnsService';
import { parseRecord } from './services/parserService';
import type { ParsedRecord } from './types';
import { GithubIcon, InfoIcon } from './components/Icons';

const App: React.FC = () => {
  const [results, setResults] = useState<ParsedRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [domainChecked, setDomainChecked] = useState<string>('');

  const handleCheckDomain = useCallback(async (domain: string) => {
    if (!domain) {
      setError('Please enter a domain name.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    setDomainChecked(domain);

    try {
      const records = await fetchForSaleRecords(domain);
      if (records) {
        const parsedResults = records.map(rec => parseRecord(rec));
        setResults(parsedResults);
      } else {
        setResults([]); // No records found
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <main className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-white">
            <span className="text-indigo-500">_for-sale</span> DNS Record Checker
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Validate TXT records based on the IETF draft <code className="font-mono text-sm bg-slate-200 dark:bg-slate-700 p-1 rounded">draft-davids-forsalereg-15</code>.
          </p>
        </header>

        <DomainInput onCheck={handleCheckDomain} isLoading={isLoading} />
        
        <div className="mt-8">
            {error && (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-4 rounded-md" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            <ResultsDisplay results={results} domain={domainChecked} isLoading={isLoading} />
        </div>
        
        <footer className="text-center mt-12 text-slate-500 dark:text-slate-400 text-sm">
          <div className="flex items-center justify-center space-x-4">
            <p>Built with React, TypeScript, and Tailwind CSS.</p>
            <a href="https://github.com/google/genaui" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
              <GithubIcon className="w-5 h-5" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
