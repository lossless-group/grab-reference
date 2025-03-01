import React from 'react';
import { create, props } from '@stylexjs/stylex';
import CitationsList from './CitationsList';
import { useCitations } from '../contexts/CitationContext';

const styles = create({
  citationsContainer: {
    width: '100%',
    maxWidth: '100%', // Changed from 800px to ensure it fits in parent
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  errorMessage: {
    color: '#e53e3e',
    padding: '1rem',
    backgroundColor: '#fff5f5',
    borderRadius: '4px',
    marginTop: '1rem',
    wordBreak: 'break-word',
  }
});

const CitationsWindow: React.FC = () => {
  const { citations, loading, error } = useCitations();
  
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
