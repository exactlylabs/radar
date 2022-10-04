import {CSSProperties} from "react";
import {
  DEFAULT_GREEN,
  POPOVER_OPTION_BOX_SHADOW_RGBA,
  POPOVER_OPTION_LIGHT_BOX_SHADOW_RGBA,
  POPOVER_SECONDARY_TEXT,
  WHITE
} from "../../../../styles/colors";

const popoverOptionContainerStyle: CSSProperties = {
  width: '100%',
  height: '54px',
  boxShadow: `0 4px 8px -4px ${POPOVER_OPTION_BOX_SHADOW_RGBA}`,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '25px',
  cursor: 'pointer',
}

const darkPopoverOptionContainerStyle: CSSProperties = {
  ...popoverOptionContainerStyle,
  borderBottom: `solid 1px ${POPOVER_OPTION_LIGHT_BOX_SHADOW_RGBA}`,
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

export const styles = {
  PopoverOptionContainer: (light?: boolean) => {
    return light ? popoverOptionContainerStyle : darkPopoverOptionContainerStyle;
  },
  Text: () => {
    return textStyle;
  },
  SecondaryText: () => {
    return secondaryTextStyle;
  },
  Arrow: () => {
    return arrowStyle;
  }
}