import {CSSProperties} from "react";

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
  FrameWrapper: (isSmall: boolean) => {
    return isSmall ? smallFrameWrapperStyle : frameWrapperStyle;
  },
  ContentWrapper: contentWrapperStyle
}