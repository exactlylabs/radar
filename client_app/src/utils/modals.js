const widgetStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#e7e7ec'
}

export const widgetModalFraming = (config) => {
  const mainFrameElement = document.getElementById('main-frame');
  if (mainFrameElement) {
    const {x, y, width, height} = mainFrameElement?.getBoundingClientRect();
    const modalWidth = `calc(${config.frameStyle.width} - 5%)`;
    const modalHeight = `calc(${config.frameStyle.height} - 5%)`;
    return {
      ...widgetStyle,
      height: modalHeight,
      width: modalWidth,
      top: (y + height * 0.05),
      left: (x + width * 0.05),
    };
  }
}