import {CSSProperties} from "react";
import {DEFAULT_CONTEXT_DIVIDER, FOOTER_TEXT} from "../../../styles/colors";

const secondLevelFooterStyle: CSSProperties = {
  width: '100%',
  height: '105px',
  borderTop: `1px solid ${DEFAULT_CONTEXT_DIVIDER}`,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

const leftSideContainerStyle: CSSProperties = {
  width: 'max-content',
  marginLeft: '60px',
}

const copyrightTextStyle: CSSProperties = {
  fontSize: '15px',
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
}

const associationTextStyle: CSSProperties = {
  fontSize: '16px',
  color: FOOTER_TEXT,
}

export const styles = {
  SecondLevelFooter: secondLevelFooterStyle,
  LeftSideContainer: leftSideContainerStyle,
  CopyrightText: copyrightTextStyle,
  RightSideContainer: rightSideContainerStyle,
  FooterIcon: footerIconStyle,
  ExactlyIcon: exactlyIconStyle,
  AssociationText: associationTextStyle
}