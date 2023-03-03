const widgetStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#e7e7ec'
}

/**
 * Clear out possible units like px, %, vw
 * @param givenValue: Actual value of frameStyle for widget
 */
const parseValue = givenValue => givenValue.replace('px', '').replace('%', '').replace('vw', '').replace('vh', '');

export const widgetModalFraming = (config) => {
  const mainFrameElement = document.getElementById('main-frame');
  if (mainFrameElement) {
    const {x, y, width, height} = mainFrameElement?.getBoundingClientRect();
    const givenWidth = parseValue(config.frameStyle.width);
    const givenHeight = parseValue(config.frameStyle.width);
    const modalWidth = `calc(${config.frameStyle.width} - ${givenWidth * 0.05}px)`;
    const modalHeight = `calc(${config.frameStyle.height} - ${givenHeight * 0.05}px)`;
    return {
      ...widgetStyle,
      height: modalHeight,
      width: modalWidth,
      top: (y + height * 0.025),
      left: (x + width * 0.025),
    };
  }
}