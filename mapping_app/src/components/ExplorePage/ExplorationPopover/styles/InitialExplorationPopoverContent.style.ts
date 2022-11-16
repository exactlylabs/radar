import {CSSProperties} from "react";
import {FOOTER_TEXT, WHITE} from "../../../../styles/colors";

const initialExplorationPopoverContentContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  height: 'calc(100% - 65px)',
  margin: '25px auto 40px',
  zIndex: 1051
}

const smallInitialExplorationPopoverContentContainerStyle: CSSProperties = {
  width: 'calc(100% - 40px)',
  height: 'calc(100% - 40px)',
  margin: '20px',
  zIndex: 1051
}

const titleStyle: CSSProperties = {
  fontSize: '24px',
  color: WHITE,
}

const subtitleStyle: CSSProperties = {
  fontSize: '16px',
  color: FOOTER_TEXT,
  marginTop: '9px',
  marginBottom: '25px',
  lineHeight: '23px',
}

const smallSubtitleStyle: CSSProperties = {
  ...subtitleStyle,
  marginBottom: '20px'
}

export const styles = {
  InitialExplorationPopoverContentContainer: (isSmall: boolean) => {
    return isSmall ? smallInitialExplorationPopoverContentContainerStyle : initialExplorationPopoverContentContainerStyle;
  },
  Title: titleStyle,
  Subtitle: (isSmall: boolean) => isSmall ? smallSubtitleStyle : subtitleStyle,
}