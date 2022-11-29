import './api/utils/tracer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from '@sentry/react';
import {Environment} from "./utils/env";
import {initializeAmplitudeEnvironment} from "./utils/amplitude";

if (REACT_APP_ENV === Environment.PRODUCTION) {
  Sentry.init({
    dsn: REACT_APP_SENTRY_DSN,
    environment: Environment.PRODUCTION,
  });
  initializeAmplitudeEnvironment();
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
