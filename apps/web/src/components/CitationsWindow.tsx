import React, { useState, useEffect } from 'react';
import { create, props } from '@stylexjs/stylex';
import CitationsList from './CitationsList';
import { Citation } from './CitationLine';

const styles = create({
  citationsContainer: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px'
  },
  errorMessage: {
    color: '#e53e3e',
    padding: '1rem',
    backgroundColor: '#fff5f5',
    borderRadius: '4px',
    marginTop: '1rem'
  }
});

const CitationsWindow: React.FC = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('CitationsWindow: Fetching citations...');
    fetch('/api/citations')
      .then(res => {
        if (!res.ok) {
          if (res.status === 500) {
            return res.text().then(text => {
              try {
                const error = JSON.parse(text);
                // Check if it's a database table doesn't exist error
                if (error.code === 'P2021') {
                  throw new Error('Database tables not initialized. Database migrations need to be run.');
                }
                throw new Error(`Server error: ${error.message || 'Unknown error'}`);
              } catch (e) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
            });
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Citations data received:', data);
        // Log the first citation to check its structure
        if (data && data.length > 0) {
          console.log('First citation sample:', data[0]);
        }
        setCitations(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching citations:', err);
        setCitations([]);
        setError(err instanceof Error ? err.message : 'Failed to load citations');
        setLoading(false);
      });
  }, []);

  return (
    <div {...props(styles.citationsContainer)} className="citations-container">
      <h1>Citations</h1>
      {error ? (
        <div {...props(styles.errorMessage)} className="error-message">
          Error loading citations: {error}
          <p>The database may not be set up yet. Please run migrations.</p>
        </div>
      ) : (
        <CitationsList 
          citations={citations} 
          loading={loading} 
          error={error}
        />
      )}
    </div>
  );
};

export default CitationsWindow;
