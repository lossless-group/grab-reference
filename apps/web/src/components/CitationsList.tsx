import React, { useEffect, useState } from 'react';

// Define interfaces based on your Prisma schema
interface Source {
  id: number;
  referredToAs?: string;
  url?: string;
  type?: string;
}

interface Citation {
  id: number;
  title?: string;
  url?: string;
  publishedTime?: string | Date;
  source?: Source;
}

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
  
  if (loading) return <div>Loading citations...</div>;
  
  return (
    <div>
      <h2>Saved Citations</h2>
      {citations.length === 0 ? (
        <p>No citations found</p>
      ) : (
        <ul>
          {citations.map(citation => (
            <li key={citation.id}>
              <h3>{citation.title}</h3>
              <p>Published: {citation.publishedTime ? new Date(citation.publishedTime).toLocaleDateString() : 'Unknown date'}</p>
              <p>Source: {citation.source?.referredToAs || 'Unknown source'}</p>
              <p><a href={citation.url} target="_blank" rel="noopener noreferrer">View source</a></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CitationsList;