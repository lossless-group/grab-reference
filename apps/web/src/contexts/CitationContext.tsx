import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Citation } from '../components/CitationLine';

interface CitationContextType {
  citations: Citation[];
  loading: boolean;
  error: string | null;
  addCitation: (citation: Citation) => void;
  refreshCitations: () => Promise<void>;
}

const CitationContext = createContext<CitationContextType | undefined>(undefined);

export const CitationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/citations');
      if (!response.ok) {
        if (response.status === 500) {
          const text = await response.text();
          try {
            const error = JSON.parse(text);
            if (error.code === 'P2021') {
              throw new Error('Database tables not initialized. Database migrations need to be run.');
            }
            throw new Error(`Server error: ${error.message || 'Unknown error'}`);
          } catch (e) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Citations loaded:', data);
      setCitations(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching citations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load citations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitations();
  }, []);

  const addCitation = (newCitation: Citation) => {
    // Add the new citation to the list without making a request
    setCitations(prevCitations => [newCitation, ...prevCitations]);
  };

  const refreshCitations = async () => {
    await fetchCitations();
  };

  return (
    <CitationContext.Provider 
      value={{ 
        citations, 
        loading, 
        error, 
        addCitation,
        refreshCitations
      }}
    >
      {children}
    </CitationContext.Provider>
  );
};

export const useCitations = () => {
  const context = useContext(CitationContext);
  if (context === undefined) {
    throw new Error('useCitations must be used within a CitationProvider');
  }
  return context;
}; 