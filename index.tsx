import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { VocabularyProvider } from './contexts/VocabularyContext';
import { LanguageProvider } from './contexts/LanguageContext';

const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <LanguageProvider>
        <VocabularyProvider>
          <App />
        </VocabularyProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
