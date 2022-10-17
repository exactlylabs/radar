import {CSSProperties} from "react";
import {
  DEFAULT_GREEN,
  POPOVER_OPTION_BOX_SHADOW_RGBA,
  POPOVER_OPTION_LIGHT_BOX_SHADOW_RGBA,
  POPOVER_SECONDARY_TEXT,
  WHITE
} from "../../../../styles/colors";

const popoverOptionContainerStyle: CSSProperties = {
  width: '98%',
  height: '54px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '15px',
  cursor: 'pointer',
}

const darkPopoverOptionContainerStyle: CSSProperties = {
  ...popoverOptionContainerStyle,
  marginBottom: 0,
}

const textStyle: CSSProperties = {
  fontSize: '17px',
  color: WHITE,
  marginLeft: '20px',
}

const secondaryTextStyle: CSSProperties = {
  fontSize: '17px',
  color: POPOVER_SECONDARY_TEXT,
  marginLeft: '6px',
  marginRight: 'auto',
}

const arrowStyle: CSSProperties = {
  marginRight: '20px',
  marginLeft: 'auto',
  color: DEFAULT_GREEN,
}

const popoverOptionContentWrapperStyle: CSSProperties = {
  width: '94%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: 'auto',
}

export const styles = {
  PopoverOptionContainer: (light?: boolean) => {
    return light ? popoverOptionContainerStyle : darkPopoverOptionContainerStyle;
  },
  Text: textStyle,
  SecondaryText: secondaryTextStyle,
  Arrow: arrowStyle,
  PopoverOptionContentWrapper: popoverOptionContentWrapperStyle,
}