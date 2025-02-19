import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

type StyleXStyles = typeof styles;

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--background-color, #f0f2f5)'
  },
  text: {
    fontSize: '2rem',
    color: '#1a1a1a',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '500px',
    padding: '0 1rem'
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%'
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#0060df'
    }
  }
});

const App: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll implement submission logic later
  };

  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.text)}>Grab a citation</h1>
      <form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
        <input
          {...stylex.props(styles.input)}
          type="url"
          placeholder="Enter URL"
          required
        />
        <button {...stylex.props(styles.button)} type="submit">
          Get Citation
        </button>
      </form>
    </div>
  );
};

export default App; 