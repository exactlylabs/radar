import {CSSProperties} from "react";
import {CLOSE_PANEL_BUTTON_SHADOW_RGBA, DEFAULT_TEXT, PERCENTAGE_BAR_TOOLTIP} from "../../../../styles/colors";

const percentageBarIndicatorTooltipContainerStyle: CSSProperties = {
  width: 'max-content',
  minWidth: '36px',
  height: '33px',
  borderRadius: '6px',
  backgroundColor: PERCENTAGE_BAR_TOOLTIP,
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
  zIndex: 1020,
  position: 'absolute',
  top: '-45px',
  visibility: 'visible',
  paddingLeft: '10px',
  paddingRight: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const textStyle: CSSProperties = {
  fontSize: '15px',
  color: DEFAULT_TEXT
}

const downArrowStyle: CSSProperties = {
  width: '7px',
  height: '7px',
  transform: 'rotate(45deg)',
  position: 'absolute',
  bottom: '-3px',
  zIndex: 1021,
  backgroundColor: PERCENTAGE_BAR_TOOLTIP,
  boxShadow: `0 2px 10px -4px ${CLOSE_PANEL_BUTTON_SHADOW_RGBA}`,
  backdropFilter: 'blur(10px)',
}

export const styles = {
  PercentageBarIndicatorTooltipContainer: percentageBarIndicatorTooltipContainerStyle,
  Text: textStyle,
  DownArrow: downArrowStyle,
}