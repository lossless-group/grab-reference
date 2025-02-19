import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  heading: {
    fontSize: '2.5rem',
    color: '#333',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
});

export const App: React.FC = () => {
  return (
    <div {...stylex.props(styles.container)}>
      <h1 {...stylex.props(styles.heading)}>Welcome to GrabCite</h1>
    </div>
  );
}; 