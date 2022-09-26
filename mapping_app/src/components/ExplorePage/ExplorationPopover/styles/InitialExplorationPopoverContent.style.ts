import {CSSProperties} from "react";
import {FOOTER_TEXT, WHITE} from "../../../../styles/colors";

const initialExplorationPopoverContentContainerStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  height: 'calc(100% - 65px)',
  margin: '25px auto 40px',
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
}

export const styles = {
  InitialExplorationPopoverContentContainer: () => {
    return initialExplorationPopoverContentContainerStyle;
  },
  Title: () => {
    return titleStyle;
  },
  Subtitle: () => {
    return subtitleStyle;
  },
}