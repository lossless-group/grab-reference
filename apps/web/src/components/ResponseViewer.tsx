import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    width: '88vw',
    maxWidth: '1200px'
  },
  errorContainer: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    width: '88vw',
    maxWidth: '1200px'
  },
  errorText: {
    color: '#b91c1c'
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    textTransform: 'capitalize'
  },
  pre: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: 'white',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    overflow: 'auto'
  }
});

interface ResponseViewerProps {
  type: 'youtube' | 'google-books' | 'unsupported';
  data: any;
  error?: string;
}

export const ResponseViewer = ({ type, data, error }: ResponseViewerProps) => {
  if (error) {
    return (
      <div {...stylex.props(styles.errorContainer)}>
        <p {...stylex.props(styles.errorText)}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div {...stylex.props(styles.container)}>
      <h2 {...stylex.props(styles.title)}>{type} Data:</h2>
      <pre {...stylex.props(styles.pre)}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
