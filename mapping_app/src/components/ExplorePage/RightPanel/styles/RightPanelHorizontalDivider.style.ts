import {CSSProperties} from "react";
import {DEFAULT_CONTEXT_DIVIDER} from "../../../../styles/colors";

const rightPanelHorizontalDividerStyle: CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: DEFAULT_CONTEXT_DIVIDER,
  borderRadius: '1.5px',
  margin: '0 auto'
}

export const styles = {
  RightPanelHorizontalDivider: () => {
    return rightPanelHorizontalDividerStyle;
  }
}