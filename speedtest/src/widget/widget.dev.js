const radarUtilities = (function() {

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

  return {
     checkConfig(config) {
      const {elementId, clientId} = config;
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
    },

    mergeAndSetConfig(config) {
      init = {
        ...baseConfig,
        ...config,
        frameStyle: {
          ...baseConfig.frameStyle,
          ...config.frameStyle
        }
      };
    },

    capitalize(word) { return `${word[0].toUpperCase()}${word.slice(1)}` },

    getSrcWithParams() {
      let params = '';
      Object.keys(init).forEach(key => {
        if (!!init[key]) {
          if (key === 'frameStyle') {
            let frameStyleParams = '';
            Object.keys(init[key]).forEach(cssProp => {
              const key = `frame${this.capitalize(cssProp)}`;
              frameStyleParams += `${key}=${init.frameStyle[cssProp]}&`;
            });
            params += frameStyleParams;
          } else {
            params += `${key}=${init[key]}&`;
          }
        }
      });
      return encodeURI(`${baseUrl}?widgetMode=true&${params}`);
    },
    hasInit() { return init !== null; },
    getError() { return error; },
    getElementId() { return init.elementId; },
    getFrameStyle() { return init.frameStyle; }
  }
})();

const RadarSpeedWidget = {
  config: config => {
    if(radarUtilities.checkConfig(config)) {
      radarUtilities.mergeAndSetConfig(config);
    }
    if(!radarUtilities.hasInit()) throw new Error(radarUtilities.getError());
  },
  new: () => {
    const error = radarUtilities.getError();
    const hasInit = radarUtilities.hasInit();
    if(!hasInit) throw new Error(`Initial config object missing. Reason(s): ${error}`);
    return {
      mount: () => {
        if(!hasInit) throw new Error(`Initial config object missing. Reason(s): ${error}`);
        const frameStyle = radarUtilities.getFrameStyle();
        const root = document.getElementById(radarUtilities.getElementId());
        const iframe = document.createElement('iframe');
        iframe.id = 'speedtest-widget--iframe';
        iframe.style.width = frameStyle.width;
        iframe.style.height = frameStyle.height;
        iframe.style.border = 'none';
        iframe.src = radarUtilities.getSrcWithParams();
        iframe.setAttribute('allow', 'geolocation');
        root.appendChild(iframe);
      },
      unmount: () => {
        const root = document.getElementById(radarUtilities.getElementId());
        const iframe = document.getElementById('speedtest-widget--iframe');
        if(root && iframe) root.removeChild(iframe);
      }
    }
  }
}