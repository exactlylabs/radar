import {CSSProperties} from "react";
import {HORIZONTAL_DIVIDER, HORIZONTAL_DIVIDER_BOX_SHADOW} from "../../../../styles/colors";

const optionHorizontalDividerStyle: CSSProperties = {
  width: 'calc(100% - 30px)',
  height: '1px',
  backgroundColor: HORIZONTAL_DIVIDER,
  marginLeft: '15px',
  marginRight: '15px',
  boxShadow: `0 -1px 0 0 ${HORIZONTAL_DIVIDER_BOX_SHADOW}`
}

export const styles = {
  OptionHorizontalDivider: () => {
    return optionHorizontalDividerStyle;
  }
}