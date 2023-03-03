import {CSSProperties} from "react";
import {DEFAULT_CONTEXT_DIVIDER} from "../../../../styles/colors";

const smallScreenTopMenuHorizontalDividerStyle: CSSProperties = {
  width: 'calc(100vw - 40px)',
  height: '1px',
  borderRadius: '1.5px',
  backgroundColor: DEFAULT_CONTEXT_DIVIDER,
  margin: '0 auto'
}

export const styles = {
  SmallScreenTopMenuHorizontalDivider: smallScreenTopMenuHorizontalDividerStyle,
}