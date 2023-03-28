import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from '@sentry/react';
import {getConfigFromParams} from "./utils/params";

if (REACT_APP_ENV === 'production') {
  Sentry.init({
    dsn: REACT_APP_SENTRY_DSN,
    environment: 'production',
    tunnel: `https://pods.radartoolkit.com/client_api/v1/sentry?client_id=${init.clientId}`
  });
  Sentry.setUser({ id: init.clientId });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App config={getConfigFromParams()} />);