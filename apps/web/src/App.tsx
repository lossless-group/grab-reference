import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import { observeUrl } from '@citation-manager/shared/utils/url-observer';
import { ResponseViewer } from './components/ResponseViewer';
import { YouTubeResponseViewer } from './components/YouTubeResponseViewer';
import { useState, useEffect } from 'react';

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
  }
});

const App: React.FC = () => {
  console.log('App component rendering');

  const [citeQueue, setCiteQueue] = React.useState<string[]>([]);
  const [inputUrl, setInputUrl] = React.useState('');
  const [source, setSource] = React.useState<{ type: string; data?: any; url?: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetch('http://localhost:8080/citations')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Citations data:', data);
        setCitations(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching citations:', err);
        setCitations([]);
        setError('Failed to load citations');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div {...props(styles.container)}>
      <div style={{ padding: '20px', backgroundColor: 'red' }}>Test Content</div>
      <h1>Citation Manager</h1>
      <h1 {...props(styles.text)}>Grab a citation</h1>
      <form {...props(styles.form)} onSubmit={handleSubmit}>
        <input
          {...props(styles.input)}
          type="url"
          placeholder="Enter URL"
          required
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
        <button {...props(styles.button)} type="submit">
          Get Citation
        </button>
      </form>
      
      {citeQueue.length > 0 && (
        <div {...props(styles.queueContainer)}>
          <ul {...props(styles.queueList)}>
            {[...citeQueue].reverse().map((url, index) => (
              <li key={index} {...props(styles.queueItem)}>
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
      <h1>Citations</h1>
      <pre>{JSON.stringify(citations, null, 2)}</pre>
    </div>
  );
};

export default App; 