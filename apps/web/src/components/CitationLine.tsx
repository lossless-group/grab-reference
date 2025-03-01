import React, { useState } from 'react';
import { create, props } from '@stylexjs/stylex';
// Import the SVG icons
import reloadIcon from '/public/icons/icon__Reload--Footnote-ID.svg';
import copyIcon from '/public/icons/icon__Copy--CitationLine.svg';
import deleteIcon from '/public/icons/icon__Delete--CitationLine.svg';
import ClassifyCitation from './ClassifyCitation';

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
  onDelete?: (id: number) => void;
}

// Format options for each citation part
export interface FormatOptions {
  separator: string[];
  date: string[];
  sourcePrefix: string[];
  linkFormat: string[];
}

// Default format options
const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  separator: [':', ' ', '•'],
  date: ['full', 'year-only', 'YYYY-mm-dd', 'YYYYmmdd'],
  sourcePrefix: ['. ', ' from ', ' via ', ' by ', ' [[]]'],
  linkFormat: ['quotes', 'italics', 'none'],
};

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
  linkItalic: {
    fontStyle: 'italic'
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
  },
  switchFormat: {
    cursor: 'pointer',
    borderRadius: '2px',
    padding: '0 2px',
    ':hover': {
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    transition: 'background-color 0.2s',
  },
  copyIconContainer: {
    flexShrink: 0,
    marginTop: '2px',
    marginLeft: 'auto',
    cursor: 'pointer',
    opacity: 0.6,
    ':hover': {
      opacity: 1
    },
    transition: 'opacity 0.2s',
    display: 'flex',
    gap: '8px'
  },
  copyTooltip: {
    position: 'absolute',
    backgroundColor: '#333',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    transform: 'translateX(-100%) translateY(-100%)',
    marginLeft: '-10px',
    marginTop: '-10px',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
  copyTooltipVisible: {
    opacity: 1
  },
  deleteTooltip: {
    position: 'absolute',
    backgroundColor: '#333',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    transform: 'translateX(-100%) translateY(-100%)',
    marginLeft: '-10px',
    marginTop: '-10px',
    opacity: 0,
    transition: 'opacity 0.2s'
  },
  deleteTooltipVisible: {
    opacity: 1
  },
  deleteButton: {
    cursor: 'pointer',
    opacity: 0.6,
    ':hover': {
      opacity: 1
    },
    transition: 'opacity 0.2s'
  }
});

export const CitationLine: React.FC<CitationLineProps> = ({ 
  citation, 
  showReference = false,
  customReference,
  useIdAsReference = true,
  onDelete
}) => {
  // State to track if we're using randHex and store the randHex value
  const [useRandHex, setUseRandHex] = useState(false);
  const [randHex, setRandHex] = useState<string | undefined>(citation.randHex);
  const [isLoading, setIsLoading] = useState(false);
  
  // Format state for different parts
  const [separatorFormat, setSeparatorFormat] = useState(0);
  const [dateFormat, setDateFormat] = useState(0);
  const [sourcePrefixFormat, setSourcePrefixFormat] = useState(0);
  const [linkFormat, setLinkFormat] = useState(0);
  
  // Format options (could be passed as props for customization)
  const formatOptions: FormatOptions = DEFAULT_FORMAT_OPTIONS;
  
  // Copy state
  const [copyTooltip, setCopyTooltip] = useState<string>('Copy to clipboard');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  // Delete state
  const [deleteTooltip, setDeleteTooltip] = useState<string>('Delete citation');
  const [showDeleteTooltip, setShowDeleteTooltip] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'No date';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Helper function to ensure two digits
    const twoDigits = (num: number): string => {
      return num.toString().padStart(2, '0');
    };
    
    // Different date formats based on state
    switch (dateFormat) {
      case 1: // Year only
        return `${dateObj.getFullYear()}`;
      case 2: // YYYYMMDD
        return `${dateObj.getFullYear()}${twoDigits(dateObj.getMonth() + 1)}${twoDigits(dateObj.getDate())}`;
      case 3: // YYYY-MM-DD
        return `${dateObj.getFullYear()}-${twoDigits(dateObj.getMonth() + 1)}-${twoDigits(dateObj.getDate())}`;
      case 0: // Full date (default)
      default:
        const year = dateObj.getFullYear();
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = dateObj.getDate();
        return `${year}, ${month} ${day}`;
    }
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
  
  // Functions to cycle through format options
  const cycleSeparatorFormat = () => {
    setSeparatorFormat((prev) => (prev + 1) % formatOptions.separator.length);
  };
  
  const cycleDateFormat = () => {
    setDateFormat((prev) => (prev + 1) % formatOptions.date.length);
  };
  
  const cycleSourcePrefixFormat = () => {
    setSourcePrefixFormat((prev) => (prev + 1) % formatOptions.sourcePrefix.length);
  };
  
  const cycleLinkFormat = () => {
    setLinkFormat((prev) => (prev + 1) % formatOptions.linkFormat.length);
  };

  // Function to render the title with the appropriate format
  const formatTitle = (title: string | undefined) => {
    if (!title) return '';
    return linkFormat === 0 ? `"${title}"` : title;
  };

  // Function to format the source text based on the selected format
  const formatSource = (source: string | undefined) => {
    if (!source) return '';
    
    // Special case for double brackets format
    if (sourcePrefixFormat === 4) { // The [[]] format option
      return `[[${source}]]`;
    }
    
    // For regular prefixes, return the prefix followed by the source
    return `${formatOptions.sourcePrefix[sourcePrefixFormat]}${source}`;
  };

  // Generate markdown text for copying
  const generateMarkdownText = (): string => {
    let markdownText = '';
    
    // Include reference if shown
    if (showReference) {
      markdownText += getReference() + formatOptions.separator[separatorFormat] + ' ';
    }
    
    // Include date if available
    if (citation.publishedTime) {
      markdownText += formatDate(citation.publishedTime);
      if (dateFormat !== 2) {
        markdownText += '. ';
      } else {
        markdownText += ' ';
      }
    }
    
    // Include title with appropriate formatting
    const title = citation.title || '';
    if (linkFormat === 0) { // quotes
      markdownText += `"${title}"`;
    } else if (linkFormat === 1) { // italics
      markdownText += `*${title}*`;
    } else { // none
      markdownText += title;
    }
    
    // Include URL as link if available
    const url = citation.source?.url || citation.url;
    if (url) {
      markdownText += ` [${linkFormat === 0 ? '' : (linkFormat === 1 ? '*' : '')}↗${linkFormat === 0 ? '' : (linkFormat === 1 ? '*' : '')}](${url})`;
    }
    
    // Include source if available
    if (citation.source?.referredToAs) {
      if (sourcePrefixFormat === 4) { // double brackets
        markdownText += ` [[${citation.source.referredToAs}]]`;
      } else {
        markdownText += formatOptions.sourcePrefix[sourcePrefixFormat] + citation.source.referredToAs;
      }
    }
    
    return markdownText;
  };
  
  // Handle copy to clipboard
  const handleCopyClick = () => {
    const markdownText = generateMarkdownText();
    
    navigator.clipboard.writeText(markdownText).then(
      () => {
        setCopyTooltip('Copied!');
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          setTimeout(() => {
            setCopyTooltip('Copy to clipboard');
          }, 300);
        }, 1500);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        setCopyTooltip('Failed to copy');
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          setTimeout(() => {
            setCopyTooltip('Copy to clipboard');
          }, 300);
        }, 1500);
      }
    );
  };

  // Handle delete citation
  const handleDeleteClick = async () => {
    if (!citation.id) {
      console.error('Cannot delete citation: Citation ID is undefined');
      setDeleteTooltip('Error: No citation ID');
      setShowDeleteTooltip(true);
      setTimeout(() => {
        setShowDeleteTooltip(false);
        setTimeout(() => {
          setDeleteTooltip('Delete citation');
        }, 300);
      }, 1500);
      return;
    }

    // Ensure citation.id is a number
    const citationId = Number(citation.id);
    if (isNaN(citationId)) {
      console.error(`Invalid citation ID: ${citation.id} is not a number`);
      setDeleteTooltip('Error: Invalid citation ID');
      setShowDeleteTooltip(true);
      setTimeout(() => {
        setShowDeleteTooltip(false);
        setTimeout(() => {
          setDeleteTooltip('Delete citation');
        }, 300);
      }, 1500);
      return;
    }

    setIsDeleting(true);
    setDeleteTooltip('Deleting...');
    setShowDeleteTooltip(true);

    try {
      console.log(`Attempting to delete citation with ID: ${citationId}`);
      // Call to backend API to delete the citation
      const response = await fetch(`/api/citations/${citationId}`, {
        method: 'DELETE',
      });
      
      // Log the response for debugging
      console.log(`Delete response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMsg = '';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || `${response.statusText || response.status}`;
          console.error('Error response body:', errorData);
        } catch {
          errorMsg = `${response.statusText || response.status}`;
        }
        
        if (response.status === 404) {
          throw new Error('Citation not found. It may have been deleted already.');
        } else {
          throw new Error(`Failed to delete citation: ${errorMsg}`);
        }
      }
      
      setDeleteTooltip('Deleted!');
      
      // Call the onDelete callback if provided
      if (onDelete && citation.id) {
        onDelete(citation.id);
      }
    } catch (error) {
      console.error('Error deleting citation:', error);
      setDeleteTooltip(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
      setTimeout(() => {
        setShowDeleteTooltip(false);
        setTimeout(() => {
          setDeleteTooltip('Delete citation');
        }, 300);
      }, 1500);
    }
  };

  return (
    <div>
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
            {showReference && (
              <>
                {getReference()}
                <span 
                  {...props(styles.switchFormat)} 
                  onClick={cycleSeparatorFormat}
                  title="Click to change separator"
                >
                  {formatOptions.separator[separatorFormat]}
                </span>{' '}
              </>
            )}
            
            {citation.publishedTime && (
              <span 
                {...props(styles.switchFormat)} 
                onClick={cycleDateFormat}
                title="Click to change date format"
              >
                {formatDate(citation.publishedTime)}
                {dateFormat !== 2 && '.'}
              </span>
            )}{' '}
            
            <span
              {...props(styles.switchFormat)}
              title="Single click to change format, double click to open link"
            >   
              <a 
                {...props(styles.citationLink, linkFormat === 1 ? styles.linkItalic : null)} 
                href={citation.source?.url || citation.url}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => {
                  // Prevent default behavior (opening the link) on single click
                  e.preventDefault();
                  cycleLinkFormat();
                }}
                onDoubleClick={() => {
                  // Allow default behavior on double click (open the link)
                }}
              >
                {formatTitle(citation.title)}
              </a>
            </span>
            
            {citation.source?.referredToAs && (
              <span
                {...props(styles.switchFormat)}
                onClick={cycleSourcePrefixFormat}
                title="Click to change source format"
              >
                {formatSource(citation.source.referredToAs)}
              </span>
            )}
          </p>
        </div>
        
        <div {...props(styles.copyIconContainer)}>
          <div
            onClick={handleCopyClick}
            title="Copy citation as Markdown"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <img 
              src={copyIcon} 
              alt="Copy citation" 
              width="18" 
              height="18" 
            />
            <span {...props(
              styles.copyTooltip, 
              showTooltip && styles.copyTooltipVisible
            )}>
              {copyTooltip}
            </span>
          </div>
          
          <div
            {...props(styles.deleteButton)}
            onClick={handleDeleteClick}
            title="Delete citation"
            onMouseEnter={() => setShowDeleteTooltip(true)}
            onMouseLeave={() => setShowDeleteTooltip(false)}
          >
            <img 
              src={deleteIcon} 
              alt="Delete citation" 
              width="18" 
              height="18" 
            />
            <span {...props(
              styles.deleteTooltip,
              showDeleteTooltip && styles.deleteTooltipVisible
            )}>
              {deleteTooltip}
            </span>
          </div>
        </div>
      </div>
      <ClassifyCitation citation={citation} />
    </div>
  );
};

export default CitationLine; 