import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import CitationsWindow from './components/CitationsWindow';
import CiteCreator from './components/CiteCreator';
import { observeUrl } from '@citation-manager/shared/utils/url-observer';

const styles = create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'white',
    padding: '1rem'
  },
  header: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem'
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

  return (
    <div {...props(styles.container)} className="app-container">
      <h1 {...props(styles.header)}>Citation Manager</h1>
      <div {...props(styles.contentWrapper)}>
        <CiteCreator />
        <CitationsWindow />
      </div>
    </div>
  );
};

export default App; 