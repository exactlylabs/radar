import {CSSProperties, MutableRefObject} from "react";

const frameWrapperStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  overflowX: 'hidden',
  overflowY: 'auto',
}

const smallFrameWrapperStyle: CSSProperties = {
  ...frameWrapperStyle,
  overflowY: 'hidden',
}

const contentWrapperStyle: CSSProperties = {
  width: '100vw',
}

export const styles = {
  FrameWrapper: (isSmall: boolean, isIphone: boolean) => {
    let style = isSmall ? smallFrameWrapperStyle : frameWrapperStyle;
    if(isIphone) style = {...style, height: 'calc(100vh - 80px)', position: 'absolute', top: 0, left: 0};
    return style;
  },
  ContentWrapper: contentWrapperStyle
}