
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TranslationsProvider } from './context/TranslationsContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TranslationsProvider>
      <App />
    </TranslationsProvider>
  </React.StrictMode>
);