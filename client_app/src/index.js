import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { notifyError } from './utils/errors';
import * as Sentry from '@sentry/react';

if (REACT_APP_ENV === 'production') {
  Sentry.init({
    dsn: REACT_APP_SENTRY_DSN,
    environment: 'production',
  });
}

let init = null;
let error = null;
export const baseInitConfig = {
  clientId: 'local',
  widgetMode: false,
  elementId: 'root-embedded',
  frameStyle: {
    width: '100vw',
    height: '100vh',
  },
  tab: 0,
  noZoomControl: false,
  webviewMode: false,
  userLat: undefined,
  userLng: undefined,
}

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

const hasParams = () => {
  return window.location.search.includes('widgetMode') ||
    window.location.search.includes('frameWidth') ||
    window.location.search.includes('frameHeight') ||
    window.location.search.includes('tab') ||
    window.location.search.includes('noZoomControl') ||
    window.location.search.includes('webviewMode');
}

const getConfigFromParams = () => {
  const params = window.location.search.split('?')[1].split('&');
  let config = { widgetMode: false };
  params.forEach(param => {
    if(param.includes('widgetMode')) {
      config.widgetMode = param.split('=')[1] === 'true';
    } else if(param.includes('frameWidth')) {
      if(!config.frameStyle) config.frameStyle = {};
      config.frameStyle.width = param.split('=')[1];
    } else if(param.includes('frameHeight')) {
      if(!config.frameStyle) config.frameStyle = {};
      config.frameStyle.height = param.split('=')[1];
    } else if(param.includes('tab')) {
      config.tab = parseInt(param.split('=')[1]);
    } else if(param.includes('noZoomControl')) {
      config.noZoomControl = param.split('=')[1] === 'true';
    } else if(param.includes('webviewMode')) {
      config.webviewMode = param.split('=')[1] === 'true';
    } else if(param.includes('userLat')) {
      config.userLat = parseFloat(param.split('=')[1]);
    } else if(param.includes('userLng')) {
      config.userLng = parseFloat(param.split('=')[1]);
    }
  });
  return config;
}

export default {
  config: config => {
    init = null;
    if (checkConfig(config)) init = config;
    if (hasParams()) {
      if(!!init) init = { ...baseInitConfig, ...init, ...getConfigFromParams() };
      else init = {...baseInitConfig, ...getConfigFromParams()};
    }
  },
  new: () => {
    Sentry.setUser({ id: init.clientId });
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
