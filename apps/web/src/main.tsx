import React from 'react';
import ReactDOM from 'react-dom/client';
import './stylex.css'; // Import the StyleX CSS file first
import App from './App';
import * as stylex from '@stylexjs/stylex';
import './index.css'; // Import regular CSS file after StyleX
// import HelloWorld from './components/HelloWorld';

// Add global styles using stylex
const globalStyles = stylex.create({
  root: {
    margin: 0,
    padding: 0,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  }
});

// Apply global styles to document
// Using a more reliable approach to apply global styles
const rootStyles = stylex.props(globalStyles.root);
document.documentElement.setAttribute('class', rootStyles.className || '');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* <App /> */}
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
} 