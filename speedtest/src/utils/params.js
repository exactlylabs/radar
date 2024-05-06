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
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  if(searchParams) {
    searchParams.forEach((value, name) => {
      if(['tab', 'zoom', 'clientId'].includes(name)) {
        config[name] = parseInt(value);
      } else if(['userLat', 'userLng'].includes(name)) {
        config[name] = parseFloat(value);
      } else if(['widgetMode', 'noZoomControl', 'webviewMode', 'global'].includes(name)) {
        config[name] = value === 'true';
      } else if(name === 'frameHeight') {
        config.frameStyle.height = value;
      } else if(name === 'frameWidth') {
        config.frameStyle.width = value;
      } else {
        config[name] = value;
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