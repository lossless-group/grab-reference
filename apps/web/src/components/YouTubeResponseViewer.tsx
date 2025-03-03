import { create, props } from '@stylexjs/stylex';
import * as React from 'react';
import CitationLine from './CitationLine';
import { useCitations } from '../contexts/CitationContext';

const styles = create({
  container: {
    marginTop: '1rem',
    marginBottom: '1rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    width: '88%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  section: {
    marginTop: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  field: {
    marginBottom: '0.75rem',
    width: '100%',
    fontSize: '0.675rem',
    wordBreak: 'break-word',
    boxSizing: 'border-box',
  },
  label: {
    fontWeight: 'bold',
    marginRight: '0.5rem',
  },
  buttonContainer: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  saveStatus: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    width: '100%',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
  },
  success: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  citationLine: {
    marginTop: '1rem',
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
  },
  codeWrapper: {
    position: 'relative',
    marginTop: '0.5rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  codeContainer: {
    overflow: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  pre: {
    margin: 0,
    padding: '1rem',
    backgroundColor: 'hsla(135, 95%, 92%, 1.00)',
    borderRadius: '4px',
    overflow: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  code: {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: '100%',
  },
  copyButton: {
    position: 'absolute',
    top: '0.2rem',
    right: '0.2rem',
    padding: '0.15rem 0.15rem',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    zIndex: 1,
  },
});

interface YouTubeData {
  etag: string;
  title: string;
  publishedAt: string;
  channelTitle: string;
  description: string;
  uniqueEmbedId: string;
}

interface MappedCitation {
  title: string;
  publishedTime: Date;
  responseDescription: string;
  source: {
    referredToAs: string;
    type: string;
    url: string;
    etag: string;
  };
}

interface SaveStatus {
  success?: boolean;
  message: string;
}

export const YouTubeResponseViewer = ({ data, url }: { data: YouTubeData; url: string }) => {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus | null>(null);
  const { addCitation } = useCitations();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${year}, ${month} ${day}`;
  };

  const mappedData: MappedCitation = {
    title: data.title,
    publishedTime: new Date(data.publishedAt),
    responseDescription: data.description,
    source: {
      referredToAs: data.channelTitle,
      type: 'youtube',
      url: url,
      etag: data.etag,
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData)
      });

      if (!response.ok) {
        throw new Error('Failed to save citation');
      }

      // Get the saved citation with its ID from the response
      const savedCitation = await response.json();
      console.log('Citation saved successfully:', savedCitation);
      
      // Add the new citation to the context
      addCitation(savedCitation);
      
      setSaveStatus({ success: true, message: 'Citation saved successfully!' });
    } catch (error) {
      setSaveStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save citation' 
      });
    }
  };

  const citeMarkdown = `[^1]`

  const iframeCode = `<iframe 
  style="aspect-ratio:16/9;width:100%;height:auto" 
  src="https://www.youtube.com/embed/${data.uniqueEmbedId}" 
  title="YouTube video player" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
  referrerpolicy="strict-origin-when-cross-origin" 
  allowfullscreen
></iframe>`;

  return (
    <div {...props(styles.container)}>
      <CitationLine 
        citation={mappedData} 
        showReference={true} 
        customReference={citeMarkdown}
        useIdAsReference={false}
      />
      <div {...props(styles.section)}>
        <h3 {...props(styles.title)}>Youtube HTML</h3>
        <div {...props(styles.codeWrapper)}>
          <button 
            {...props(styles.copyButton)}
            onClick={() => {
              navigator.clipboard.writeText(iframeCode);
            }}
          >
            Copy
          </button>
          <div {...props(styles.codeContainer)}>
            <pre {...props(styles.pre)}>
              <code {...props(styles.code)}>
                {`\`\`\`html\n${iframeCode}\n\`\`\``}
              </code>
            </pre>
          </div>
        </div>
      </div>
      <div {...props(styles.section)}>
        <h3 {...props(styles.title)}>Mapped Citation Data:</h3>
        <p style={{ wordBreak: 'break-word', width: '100%' }}>{mappedData.source.url}</p>
        <div {...props(styles.field)}>
          <span {...props(styles.label)}>Citation.title: </span>
          {mappedData.title}
        </div>
        <div {...props(styles.field)}>
          <span {...props(styles.label)}>Citation.publishedTime: </span>
          {mappedData.publishedTime.toISOString()}
        </div>
        <div {...props(styles.field)}>
          <span {...props(styles.label)}>Citation.responseDescription: </span>
          {mappedData.responseDescription}
        </div>
        <div {...props(styles.field)}>
          <span {...props(styles.label)}>Source.referredToAs: </span>
          {mappedData.source.referredToAs}
        </div>
        <div {...props(styles.buttonContainer)}>
          <button 
            {...props(styles.saveButton)} 
            onClick={handleSave}
          >
            Save Citation
          </button>
        </div>
      </div>
      {saveStatus && (
        <p {...props(
          styles.saveStatus, 
          saveStatus.success ? styles.success : styles.error
        )}>
          {saveStatus.message}
        </p>
      )}
    </div>
  );
}; 