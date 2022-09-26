import {CSSProperties} from "react";
import {VERTICAL_DIVIDER} from "../../../../styles/colors";

const dropdownFilterVerticalDividerStyle: CSSProperties = {
  width: '1px',
  height: '28px',
  backgroundColor: VERTICAL_DIVIDER
}

export const styles = {
  DropdownFilterVerticalDivider: () => {
    return dropdownFilterVerticalDividerStyle;
  }
}