import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

type StyleXStyles = typeof styles;

const styles = stylex.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--background-color, #f0f2f5)'
  },
  text: {
    fontSize: '2rem',
    color: '#1a1a1a',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
});

const App: React.FC = () => {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.text)}>Grab a citations</h1>
    </div>
  );
};

export default App; 