import React, { useEffect, useState } from 'react';
import CitationLine, { Citation } from './CitationLine';
import { create, props } from '@stylexjs/stylex';

const styles = create({
  container: {
    padding: '1rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  loading: {
    color: '#6b7280',
    fontStyle: 'italic',
  }
});

function CitationsList() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/citations')
      .then(response => response.json())
      .then(data => {
        setCitations(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching citations:', error);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div {...props(styles.loading)}>Loading citations...</div>;
  
  return (
    <div {...props(styles.container)}>
      <h2 {...props(styles.heading)}>Saved Citations</h2>
      {citations.length === 0 ? (
        <p {...props(styles.message)}>No citations found</p>
      ) : (
        <ul {...props(styles.list)}>
          {citations.map((citation) => (
            <li key={citation.id || Math.random()}>
              <CitationLine 
                citation={citation} 
                showReference={true}
                useIdAsReference={true}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CitationsList;