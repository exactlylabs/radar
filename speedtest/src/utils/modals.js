const widgetStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#e7e7ec',
}

export const widgetModalFraming = (config) => {
  const mainFrameElement = document.getElementById('speedtest--main-frame');
  if (mainFrameElement) {
    const {x, y} = mainFrameElement.getBoundingClientRect();
    const modalWidth = `calc(${config.frameStyle.width} - 20px)`;
    const modalHeight = `calc(${config.frameStyle.height} - 20px - 65px)`;
    return {
      ...widgetStyle,
      height: modalHeight,
      width: modalWidth,
      top: `calc(${y}px + 55px)`,
      left: `calc(${x}px + 10px)`,
    };
  }
}