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
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '15px',
  cursor: 'pointer',
}

const darkPopoverOptionContainerStyle: CSSProperties = {
  ...popoverOptionContainerStyle,
  width: '97%',
  marginBottom: 0,
}

const smallStyle: CSSProperties = {
  height: '50px',
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
  width: '93%',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: 'auto',
}

export const styles = {
  PopoverOptionContainer: (isSmall: boolean, light?: boolean) => {
    let style = light ? popoverOptionContainerStyle : darkPopoverOptionContainerStyle;
    return isSmall && !light ? {...style, ...smallStyle} : style;
  },
  Text: textStyle,
  SecondaryText: secondaryTextStyle,
  Arrow: arrowStyle,
  PopoverOptionContentWrapper: popoverOptionContentWrapperStyle,
}