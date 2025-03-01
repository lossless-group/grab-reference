import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import { observeUrl } from '@citation-manager/shared/utils/url-observer';
import { ResponseViewer } from './ResponseViewer';
import { YouTubeResponseViewer } from './YouTubeResponseViewer';

const styles = create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '800px'
  },
  title: {
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
  }
});

const CiteCreator: React.FC = () => {
  const [citeQueue, setCiteQueue] = React.useState<string[]>([]);
  const [inputUrl, setInputUrl] = React.useState('');
  const [source, setSource] = React.useState<{ type: string; data?: any; url?: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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

  return (
    <div {...props(styles.container)}>
      <h4 {...props(styles.title)}>Grab a citation</h4>
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
    </div>
  );
};

export default CiteCreator;
