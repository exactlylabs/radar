const widgetStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#e7e7ec',
}

export const getWidgetModalAvailableSpace = () => {
  const mainFrameElement = document.getElementById('speedtest--frame--main-frame-wrapper');
  if (mainFrameElement) {
    const {width, height} = mainFrameElement.getBoundingClientRect();
    return {
      height: `calc(${height}px - 6px)`,
      maxHeight: `calc(${height}px - 6px)`,
      width: 'max-content',
      maxWidth: `calc(${width}px - 6px)`,
      top: '97px',
      left: '50%',
      transform: 'translateX(-50%)',
      outline: 'none',
      ...customCss
    };
  }
}

export const widgetModalFraming = (customCss = {}) => {
  const mainFrameElement = document.getElementById('speedtest--frame--main-frame-wrapper');
  if (mainFrameElement) {
    const {width, height} = mainFrameElement.getBoundingClientRect();
    return {
      ...widgetStyle,
      backgroundColor: 'transparent',
      height: `calc(${height}px - 6px)`,
      maxHeight: `calc(${height}px - 6px)`,
      width: 'max-content',
      maxWidth: `calc(${width}px - 6px)`,
      top: '97px',
      left: '50%',
      transform: 'translateX(-50%)',
      outline: 'none',
      ...customCss
    };
  }
}