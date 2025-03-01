import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import { observeUrl } from '@citation-manager/shared/utils/url-observer';
import { ResponseViewer } from './components/ResponseViewer';
import { YouTubeResponseViewer } from './components/YouTubeResponseViewer';
import { useState, useEffect } from 'react';
import CitationsList from './components/CitationsList';

const styles = create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'white'
  },
  text: {
    fontSize: '2rem',
    color: '#1a1a1a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '500px',
    padding: '0 1rem'
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%'
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#0060df'
    }
  },
  queueContainer: {
    width: '100%',
    maxWidth: '500px',
    marginTop: '2rem',
    padding: '0 1rem'
  },
  queueList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  queueItem: {
    padding: '0.75rem',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.875rem',
    wordBreak: 'break-all'
  },
  toast: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '1rem',
    backgroundColor: '#ff4444',
    color: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 1000
  },
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
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px dashed #ccc'
  }
});

const App: React.FC = () => {
  console.log('App component rendering');

  const [citeQueue, setCiteQueue] = React.useState<string[]>([]);
  const [inputUrl, setInputUrl] = React.useState('');
  const [source, setSource] = React.useState<{ type: string; data?: any; url?: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [citations, setCitations] = useState([]);
  const [citationsLoading, setCitationsLoading] = useState(true);
  const [citationsError, setCitationsError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSource(null);

    if (inputUrl.trim()) {
      try {
        const result = await observeUrl(inputUrl.trim());
        console.log('Citation data:', result);
        setCiteQueue(prev => [...prev, inputUrl.trim()]);
        setInputUrl('');
        setSource({ type: result.type, data: result.data, url: inputUrl.trim() });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  useEffect(() => {
    console.log('Fetching citations...');
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
        setCitationsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching citations:', err);
        setCitations([]);
        setCitationsError(err instanceof Error ? err.message : 'Failed to load citations');
        setCitationsLoading(false);
      });
  }, []);

  return (
    <div {...props(styles.container)} className="app-container">
      <div style={{ padding: '20px', backgroundColor: 'red' }}>Test Content</div>
      <h1>Citation Manager</h1>
      <h1 {...props(styles.text)}>Grab a citation</h1>
      <form {...props(styles.form)} className="citation-form" onSubmit={handleSubmit}>
        <input
          {...props(styles.input)}
          className="url-input"
          type="url"
          placeholder="Enter URL"
          required
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button {...props(styles.button)} className="submit-button" type="submit">
          Get Citation
        </button>
      </form>
      
      {citeQueue.length > 0 && (
        <div {...props(styles.queueContainer)} className="queue-container">
          <ul {...props(styles.queueList)} className="queue-list">
            {[...citeQueue].reverse().map((url, index) => (
              <li key={index} {...props(styles.queueItem)} className="queue-item">
                {url}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(source || error) && (
        <>
          <ResponseViewer 
            type={source?.type as 'youtube' | 'google-books' | 'unsupported'}
            data={source?.data}
            error={error || undefined}
          />
          {source?.type === 'youtube' && source.data && (
            <YouTubeResponseViewer 
              data={source.data} 
              url={source.url || ''}
            />
          )}
        </>
      )}
      
      <div {...props(styles.citationsContainer)} className="citations-container">
        <h1>Citations</h1>
        {citationsError ? (
          <div {...props(styles.errorMessage)} className="error-message">
            Error loading citations: {citationsError}
            <p>The database may not be set up yet. Please run migrations.</p>
          </div>
        ) : (
          <CitationsList 
            citations={citations} 
            loading={citationsLoading} 
            error={citationsError}
          />
        )}
      </div>
    </div>
  );
};

export default App; 