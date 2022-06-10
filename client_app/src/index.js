import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App";

let init = null;

export default {
  config: config => init = config,
  widgets: {
    myWidget: {
      new: () => {
        return {
          mount: () => {
            const root = ReactDOM.createRoot(document.getElementById(init.elementId));
            root.render(<App config={init}/>);
          },
          unmount: () => ReactDOM.unmountComponentAtNode(document.getElementById(init.elementId))
        }
      }
    }
  }
}