import {CSSProperties} from "react";
import {DEFAULT_CONTEXT_DIVIDER, FOOTER_TEXT} from "../../../styles/colors";

const secondLevelFooterStyle: CSSProperties = {
  width: '100%',
  height: '176px',
  borderTop: `1px solid ${DEFAULT_CONTEXT_DIVIDER}`,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'start',
  padding: '32px 0px 32px 0px',
}

const leftSideContainerStyle: CSSProperties = {
  width: 'max-content',
  marginLeft: '60px',
  paddingTop: '6px',
  }

const copyrightTextStyle: CSSProperties = {
  fontSize: '15px',
  color: FOOTER_TEXT,
}

const devInfoTextStyle: CSSProperties = {
  fontSize: '15px',
  maxWidth: '629px',
  paddingTop: 24,
  color: FOOTER_TEXT,
}

const rightSideContainerStyle: CSSProperties = {
  width: 'max-content',
  marginRight: '60px',
  marginLeft: 'auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const footerIconStyle: CSSProperties = {
  marginLeft: '45px',
  height: '36px',
}

const exactlyIconStyle: CSSProperties = {
  ...footerIconStyle,
  height: '25px',
  width: '111px',
  cursor: 'pointer'
}

const associationTextStyle: CSSProperties = {
  fontSize: '16px',
  color: FOOTER_TEXT,
}

export const styles = {
  SecondLevelFooter: secondLevelFooterStyle,
  LeftSideContainer: leftSideContainerStyle,
  CopyrightText: copyrightTextStyle,
  DevInfoText: devInfoTextStyle,
  RightSideContainer: rightSideContainerStyle,
  FooterIcon: footerIconStyle,
  ExactlyIcon: exactlyIconStyle,
  AssociationText: associationTextStyle
}