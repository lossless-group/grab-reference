import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import HelloWorld from './components/HelloWorld';

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