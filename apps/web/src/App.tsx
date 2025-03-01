import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import CitationsWindow from './components/CitationsWindow';
import CiteCreator from './components/CiteCreator';
import { CitationProvider } from './contexts/CitationContext';

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
  workspaceWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  leftColumn: {
    width: '40vw',
    height: '100%',
    overflow: 'auto',
    padding: '1rem',
    borderRight: '1px solid #e5e7eb',
  },
  rightColumn: {
    width: '60vw',
    height: '100%',
    overflow: 'auto',
    padding: '1rem',
  },
});

const App: React.FC = () => {
  console.log('App component rendering');

  return (
    <CitationProvider>
      <div {...props(styles.container)} className="app-container">
        <h1 {...props(styles.header)}>Citation Manager</h1>
        <div {...props(styles.workspaceWrapper)}>
          <div {...props(styles.leftColumn)}>
            <CiteCreator />
          </div>
          <div {...props(styles.rightColumn)}>
            <CitationsWindow />
          </div>
        </div>
      </div>
    </CitationProvider>
  );
};

export default App; 