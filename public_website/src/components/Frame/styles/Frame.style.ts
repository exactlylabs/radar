import {CSSProperties} from "react";

const frameStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  overflowX: 'hidden',
  overflowY: 'auto',
}

const childrenStyle: CSSProperties = {
  marginBottom: '-160px'
}

export const styles = {
  Frame: frameStyle,
  Children: (hasMargin?: string) => hasMargin ? undefined : childrenStyle,
}