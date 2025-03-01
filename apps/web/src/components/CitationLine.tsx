import React, { useState } from 'react';
import { create, props } from '@stylexjs/stylex';
// Import the SVG icon
import reloadIcon from '/public/icons/icon__Reload--Footnote-ID.svg';

// Define interfaces for the component props
export interface Source {
  id?: number;
  referredToAs?: string;
  url?: string;
  type?: string;
}

export interface Citation {
  id?: number;
  uuid?: string;
  randHex?: string;
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
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },
  citationLink: {
    color: '#2563eb',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  },
  iconContainer: {
    flexShrink: 0,
    marginTop: '2px', // Slight adjustment to align with text
    cursor: 'pointer'
  },
  contentContainer: {
    flex: 1
  },
  loadingIcon: {
    animation: 'spin 1s linear infinite'
  }
});

export const CitationLine: React.FC<CitationLineProps> = ({ 
  citation, 
  showReference = false,
  customReference,
  useIdAsReference = true
}) => {
  // State to track if we're using randHex and store the randHex value
  const [useRandHex, setUseRandHex] = useState(false);
  const [randHex, setRandHex] = useState<string | undefined>(citation.randHex);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No date';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = dateObj.getDate();
    return `${year}, ${month} ${day}`;
  };

  // Function to handle icon click and toggle reference format
  const handleIconClick = async () => {
    // If we already have a randHex value, just toggle the display
    if (randHex) {
      setUseRandHex(!useRandHex);
      return;
    }
    
    // If we don't have a randHex yet, fetch it
    if (!citation.id) {
      console.error('Cannot fetch randHex: Citation ID is undefined');
      return;
    }

    setIsLoading(true);

    try {
      // Call to backend API to get or create randHex
      const response = await fetch(`/api/citations/${citation.id}/randHex`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch randHex: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRandHex(data.randHex);
      setUseRandHex(true);
    } catch (error) {
      console.error('Error fetching randHex:', error);
      // If we have an existing randHex, still use it even if the API call fails
      if (citation.randHex) {
        setRandHex(citation.randHex);
        setUseRandHex(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine what reference to show
  const getReference = () => {
    // For debugging
    console.log('Citation ID:', citation.id, 'useIdAsReference:', useIdAsReference, 'useRandHex:', useRandHex);
    
    // Use randHex if toggled on and available
    if (useRandHex && randHex) {
      return `[^${randHex.substring(0, 6)}]`; // Show first 6 characters of hex
    }
    
    // Only use customReference if explicitly provided AND useIdAsReference is false
    if (customReference && !useIdAsReference) {
      return customReference;
    }
    
    // Use ID if available and useIdAsReference is true
    if (useIdAsReference && citation.id !== undefined) {
      return `[^${citation.id}]`;
    }
    
    // Fallback
    return customReference || '[?]';
  };

  return (
    <div {...props(styles.citationLine)}>
      <div 
        {...props(styles.iconContainer)} 
        onClick={handleIconClick}
        title={useRandHex ? "Switch to ID reference" : "Switch to hex reference"}
      >
        <img 
          src={reloadIcon} 
          alt="Toggle reference format" 
          width="18" 
          height="18" 
          {...(isLoading && props(styles.loadingIcon))}
        />
      </div>
      <div {...props(styles.contentContainer)}>
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
    </div>
  );
};

export default CitationLine; 