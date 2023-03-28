const baseUrl = 'http://localhost:9999/';

const baseConfig = {
  clientId: 1,
  elementId: 'widget-root',
  frameStyle: {
    width: '100%',
    height: '100%',
  },
  tab: 0,
  noZoomControl: false,
  webviewMode: false,
  userLat: undefined,
  userLng: undefined,
  zoom: undefined,
  global: false,
};

let error = null;
let init = null;

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
  } else if (typeof clientId !== 'number') {
    error = 'clientId type is wrong';
    return false;
  }
  return true;
};

const mergeConfig = (config) => {
  return {
    ...baseConfig,
    ...config,
    frameStyle: {
      ...baseConfig.frameStyle,
      ...config.frameStyle
    }
  };
}

const capitalize = word => `${word[0].toUpperCase()}${word.slice(1)}`;

const getSrcWithParams = (config) => {
  let params = '';
  Object.keys(config).forEach(key => {
    if(!!config[key]) {
      if(key === 'frameStyle') {
        let frameStyleParams = '';
        Object.keys(config[key]).forEach(cssProp => {
          const key = `frame${capitalize(cssProp)}`;
          frameStyleParams += `${key}=${config.frameStyle[cssProp]}&`;
        });
        params += frameStyleParams;
      } else {
        params += `${key}=${config[key]}&`;
      }
    }
  });
  return encodeURI(`${baseUrl}?widgetMode=true&${params}`);
}

const Widget = {
  config: config => {
    if(checkConfig(config)) {
      init = mergeConfig(config);
    }
    if(!init) throw new Error(error);
  },
  new: () => {
    if(!init) throw new Error(`Initial config object missing. Reason(s): ${error}`);
    return {
      mount: () => {
        if(!init) throw new Error(`Initial config object missing. Reason(s): ${error}`);
        const root = document.getElementById(init.elementId);
        const iframe = document.createElement('iframe');
        iframe.id = 'speedtest-widget--iframe';
        iframe.style.width = init.frameStyle.width;
        iframe.style.height = init.frameStyle.height;
        iframe.style.border = 'none';
        iframe.src = getSrcWithParams(init);
        iframe.setAttribute('allow', 'geolocation');
        root.appendChild(iframe);
      },
      unmount: () => {
        const root = document.getElementById(init.elementId);
        const iframe = document.getElementById('speedtest-widget--iframe');
        if(root && iframe) root.removeChild(iframe);
      }
    }
  }
}