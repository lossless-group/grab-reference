import { create, props } from '@stylexjs/stylex';
import * as React from 'react';
import CitationLine from './CitationLine';

const styles = create({
  container: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    width: '88vw',
    maxWidth: '1200px'
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  field: {
    marginBottom: '0.5rem'
  },
  label: {
    fontWeight: '500',
    color: '#0369a1'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    ':hover': {
      backgroundColor: '#059669'
    }
  },
  saveStatus: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    textAlign: 'right'
  },
  success: {
    color: '#059669'
  },
  error: {
    color: '#dc2626'
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
  codeContainer: {
    overflow: 'auto',
    maxWidth: '100%'
  },
  codeWrapper: {
    position: 'relative',
    width: '100%'
  },
  pre: {
    margin: 0,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word'
  },
  code: {
    display: 'block',
    fontFamily: 'monospace',
    fontSize: '0.9rem'
  },
  copyButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    ':hover': {
      backgroundColor: '#d1d5db'
    }
  }
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
      <div {...props(styles.container)}>
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
      <div {...props(styles.container)}>
        <h3 {...props(styles.title)}>Mapped Citation Data:</h3>
        <p>{mappedData.source.url}</p>
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