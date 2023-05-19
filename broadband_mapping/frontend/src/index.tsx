import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from '@sentry/react';

if (REACT_APP_ENV === 'production') {
  Sentry.init({
    dsn: REACT_APP_SENTRY_DSN,
    environment: 'production',
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
