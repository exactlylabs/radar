import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { notifyError } from './utils/errors';
import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";

Sentry.init({
  dsn: "https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151",
  integrations: [new BrowserTracing()],
  environment: 'production',
});

let init = null;
let error = null;


const checkConfig = config => {
  const { elementId, clientId } = config;
  if (!elementId || elementId.length === 0) {
    error = 'elementId is missing';
    return false;
  } else if (!clientId || clientId.length === 0) {
    error = 'clientId is missing';
    return false;
  } else if (typeof elementId !== 'string') {
    error = 'elementId type is wrong';
    return false;
  } else if (typeof clientId !== 'string') {
    error = 'clientId type is wrong';
    return false;
  }
  return true;
};

export default {
  config: config => {
    if (checkConfig(config)) init = config;
    else init = null;
  },
  new: () => {
    Sentry.setUser({id: init.clientId})
    return {
      mount: () => {
        if (!init) {
          notifyError(new Error(`Initial config object missing. Reason(s): ${error}`));
          return;
        }
        const root = ReactDOM.createRoot(document.getElementById(init.elementId));
        root.render(<App config={init} />);
      },
      unmount: () => ReactDOM.unmountComponentAtNode(document.getElementById(init.elementId)),
    };
  },
};
