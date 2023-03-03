import {CSSProperties} from "react";
import {BLACK, EXPLORATION_POPOVER_BLACK, WHITE} from "../../../../styles/colors";

const applyDateRangeButtonStyle: CSSProperties = {
  width: '100%',
  height: '45px',
  backgroundColor: BLACK,
  color: WHITE,
  fontSize: '16px',
  borderRadius: '6px',
  boxShadow: `0 2px 10px -4px ${EXPLORATION_POPOVER_BLACK}`,
  border: 'none',
  cursor: 'pointer',
}

export const styles = {
  ApplyDateRangeButton: applyDateRangeButtonStyle,
}