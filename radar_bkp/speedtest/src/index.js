import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as Sentry from '@sentry/react';
import {getConfigFromParams} from "./utils/params";

const config = getConfigFromParams();

if (REACT_APP_ENV === 'production') {
  Sentry.init({
    dsn: REACT_APP_SENTRY_DSN,
    environment: 'production',
    tunnel: `https://pods.radartoolkit.com/client_api/v1/sentry?client_id=${config.clientId}`
  });
  Sentry.setUser({ id: config.clientId });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App config={config} />);