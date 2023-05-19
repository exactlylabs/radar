import {CSSProperties} from "react";

const getStartedPageStyle: CSSProperties = {
  width: '100vw'
}

const withNegativeMarginStyle: CSSProperties = {
  ...getStartedPageStyle,
  marginBottom: '-200px',
}

export const styles = {
  GetStartedPage: (withNegativeMargin: boolean) => withNegativeMargin ? withNegativeMarginStyle : getStartedPageStyle,
}