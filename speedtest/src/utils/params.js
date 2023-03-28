const baseConfig = {
  clientId: 1,
  elementId: 'widget-root',
  widgetMode: false,
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

export const getConfigFromParams = () => {
  let config = baseConfig;
  const search = window.location.search;
  if(search) {
    const params = search.split('?')[1].split('&');
    params.forEach(param => {
      if (param.includes('widgetMode')) {
        config.widgetMode = param.split('=')[1] === 'true';
      } else if (param.includes('frameWidth')) {
        if (!config.frameStyle) config.frameStyle = {};
        config.frameStyle.width = param.split('=')[1];
      } else if (param.includes('frameHeight')) {
        if (!config.frameStyle) config.frameStyle = {};
        config.frameStyle.height = param.split('=')[1];
      } else if (param.includes('tab')) {
        config.tab = parseInt(param.split('=')[1]);
      } else if (param.includes('noZoomControl')) {
        config.noZoomControl = param.split('=')[1] === 'true';
      } else if (param.includes('webviewMode')) {
        config.webviewMode = param.split('=')[1] === 'true';
      } else if (param.includes('userLat')) {
        config.userLat = parseFloat(param.split('=')[1]);
      } else if (param.includes('userLng')) {
        config.userLng = parseFloat(param.split('=')[1]);
      } else if (param.includes('zoom')) {
        config.zoom = parseInt(param.split('=')[1]);
      } else if (param.includes('clientId')) {
        config.clientId = parseInt(param.split('=')[1]);
      }
    });
  } else {
    config.frameStyle = {
      width: '100vw',
      height: '100vh'
    };
  }
  return config;
}