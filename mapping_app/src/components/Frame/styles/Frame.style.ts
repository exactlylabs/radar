import {CSSProperties} from "react";

const frameWrapperStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  overflowX: 'hidden',
  overflowY: 'auto',
}

const contentWrapperStyle: CSSProperties = {
  width: '100vw',
}

export const styles = {
  FrameWrapper: () => {
    return frameWrapperStyle;
  },
  ContentWrapper: () => {
    return contentWrapperStyle;
  }
}