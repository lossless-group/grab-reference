import * as React from 'react';
import { create, props } from '@stylexjs/stylex';
import CitationsWindow from './components/CitationsWindow';
import CiteCreator from './components/CiteCreator';

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