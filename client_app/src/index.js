import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App";

let init = null;
let error = null;

const checkConfig = config => {
  const {elementId, clientId} = config;
  if(!elementId || elementId.length === 0) {
    error = 'elementId is missing';
    return false;
  } else if(!clientId || clientId.length === 0) {
    error = 'clientId is missing';
    return false;
  } else if(typeof elementId !== 'string') {
    error = 'elementId type is wrong';
    return false;
  } else if(typeof clientId !== 'string') {
    error = 'clientId type is wrong';
    return false;
  }
  return true;
}

export default {
  config: config => {
    if(checkConfig(config))
      init = config;
    else
      init = null;
  },
  new: () => {
    return {
      mount: () => {
        if(!init) {
          console.error(`Initial config object missing. Reason(s): ${error}`);
          return;
        }
        const root = ReactDOM.createRoot(document.getElementById(init.elementId));
        root.render(<App config={init}/>);
      },
      unmount: () => ReactDOM.unmountComponentAtNode(document.getElementById(init.elementId))
    }
  }
}