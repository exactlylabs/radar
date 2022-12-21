export const isIphoneAndSafari = () => !window.navigator.userAgent.includes('FxiOS') &&
  !window.navigator.userAgent.includes('CriOS') &&
  window.navigator.platform.toLowerCase() === 'iphone';