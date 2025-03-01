import React from 'react';
import { create, props } from '@stylexjs/stylex';

// Define interfaces for the component props
export interface Source {
  id?: number;
  referredToAs?: string;
  url?: string;
  type?: string;
}

export interface Citation {
  id?: number;
  title?: string;
  url?: string;
  publishedTime?: string | Date;
  source?: Source;
}

interface CitationLineProps {
  citation: Citation;
  showReference?: boolean;
  customReference?: string;
  useIdAsReference?: boolean;
}

const styles = create({
  citationLine: {
    marginTop: '0.5rem',
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  citationLink: {
    color: '#2563eb',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  }
});

export const CitationLine: React.FC<CitationLineProps> = ({ 
  citation, 
  showReference = false,
  customReference,
  useIdAsReference = true
}) => {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No date';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    return `${year}, ${month} ${day}`;
  };

  // Determine what reference to show
  const getReference = () => {
    // For debugging
    console.log('Citation ID:', citation.id, 'useIdAsReference:', useIdAsReference, 'customReference:', customReference);
    
    // Only use customReference if explicitly provided AND useIdAsReference is false
    if (customReference && !useIdAsReference) {
      return customReference;
    }
    
    // Use ID if available and useIdAsReference is true
    if (useIdAsReference && citation.id !== undefined) {
      return `[${citation.id}]`;
    }
    
    // Fallback
    return customReference || '[?]';
  };

  return (
    <div {...props(styles.citationLine)}>
      <p>
        {showReference && getReference() + ': '}
        {citation.publishedTime && formatDate(citation.publishedTime)}.{' '}
        <a 
          {...props(styles.citationLink)} 
          href={citation.source?.url || citation.url}
          target="_blank" 
          rel="noopener noreferrer"
        >
          {citation.title}
        </a>
        {citation.source?.referredToAs && `. ${citation.source.referredToAs}.`}
      </p>
    </div>
  );
};

export default CitationLine; 