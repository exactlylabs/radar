import {CSSProperties} from "react";
import {VERTICAL_DIVIDER} from "../../../../styles/colors";

const dropdownFilterVerticalDividerStyle: CSSProperties = {
  width: '1px',
  height: '28px',
  backgroundColor: VERTICAL_DIVIDER,
  opacity: 0.5,
}

export const styles = {
  DropdownFilterVerticalDivider: dropdownFilterVerticalDividerStyle
}