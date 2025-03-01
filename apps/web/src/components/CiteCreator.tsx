import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import { observeUrl } from '@citation-manager/shared/utils/url-observer';
import { ResponseViewer } from './ResponseViewer';
import { YouTubeResponseViewer } from './YouTubeResponseViewer';

const styles = create({
  container: {
    width: '95%',
    margin: '0 auto',
    marginLeft: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#111827',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: 'bold',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#1d4ed8',
    },
    alignSelf: 'flex-start',
  },
  queueContainer: {
    width: '100%',
    marginBottom: '1.5rem',
    overflow: 'hidden',
  },
  queueList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
  },
  queueItem: {
    padding: '0.5rem',
    margin: '0.25rem 0',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    wordBreak: 'break-word',
    width: '100%',
    boxSizing: 'border-box',
  },
  responseContainer: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    wordWrap: 'break-word',
    boxSizing: 'border-box',
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
        <div {...props(styles.responseContainer)}>
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
        </div>
      )}
    </div>
  );
};

export default CiteCreator;
