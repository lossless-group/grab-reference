import * as stylex from '@stylexjs/stylex';
import * as React from 'react';

const styles = stylex.create({
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

  return (
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.citationLine)}>
          {formatDate(mappedData.publishedTime)}.{' '}
        <a 
          {...stylex.props(styles.citationLink)} 
          href={mappedData.source.url}
          target="_blank" 
          rel="noopener noreferrer"
        >
          {mappedData.title}
        </a>
        . {mappedData.source.referredToAs}.
      </div>
      <div {...stylex.props(styles.container)}>
        <h3 {...stylex.props(styles.title)}>Youtube HTML</h3>
            <pre>
            <code>
              {`\`\`\`html
<iframe 
  style="aspect-ratio:16/9;width:100%;height:auto" 
  src="https://www.youtube.com/embed/${data.uniqueEmbedId}" 
  title="YouTube video player" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
  referrerpolicy="strict-origin-when-cross-origin" 
  allowfullscreen
></iframe>
\`\`\``}
            </code>
            </pre>
      </div>
      <div {...stylex.props(styles.container)}>
      <h3 {...stylex.props(styles.title)}>Mapped Citation Data:</h3>
            <p>{mappedData.source.url}</p>
          <div {...stylex.props(styles.field)}>
            <span {...stylex.props(styles.label)}>Citation.title: </span>
            {mappedData.title}
          </div>
          <div {...stylex.props(styles.field)}>
            <span {...stylex.props(styles.label)}>Citation.publishedTime: </span>
            {mappedData.publishedTime.toISOString()}
          </div>
          <div {...stylex.props(styles.field)}>
            <span {...stylex.props(styles.label)}>Citation.responseDescription: </span>
            {mappedData.responseDescription}
          </div>
          <div {...stylex.props(styles.field)}>
            <span {...stylex.props(styles.label)}>Source.referredToAs: </span>
            {mappedData.source.referredToAs}
          </div>
          <div {...stylex.props(styles.buttonContainer)}>
            <button 
              {...stylex.props(styles.saveButton)} 
              onClick={handleSave}
            >
              Save Citation
            </button>
          </div>
      </div>
      {saveStatus && (
        <p {...stylex.props(
          styles.saveStatus, 
          saveStatus.success ? styles.success : styles.error
        )}>
          {saveStatus.message}
        </p>
      )}
    </div>
  );
}; 