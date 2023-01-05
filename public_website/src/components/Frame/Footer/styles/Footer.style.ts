import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, HORIZONTAL_DIVIDER} from "../../../../utils/colors";

const footerStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  marginTop: '84px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}

const topRowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const leftColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start'
}

const rightColumnStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end'
}

const bottomRowStyle: CSSProperties = {
  textAlign: 'left',
  marginTop: '55px',
  marginBottom: '40px'
}

const radarLogoStyle: CSSProperties = {
  width: '100px',
  height: '24px',
}

const linkStyle: CSSProperties = {
  width: '120px',
  fontSize: '15px',
  textDecoration: 'none',
  lineHeight: '25px',
  color: DEFAULT_SECONDARY_TEXT,
  marginLeft: '50px'
}

const smallLinkStyle: CSSProperties = {
  ...linkStyle,
  marginLeft: 0
}

const broadbandMappingLogoStyle: CSSProperties = {
  width: '208px',
  height: '28px',
  cursor: 'pointer'
}

const ANTHCLogoStyle: CSSProperties = {
  width: '110px',
  height: '31px',
  marginLeft: '50px',
  cursor: 'pointer'
}

const smallANTHLogoStyle: CSSProperties = {
  width: '110px',
  height: '31px',
  cursor: 'pointer'
}

const MLabLogoStyle: CSSProperties = {
  width: '60px',
  height: '18px',
  marginLeft: '50px',
  cursor: 'pointer'
}

const smallMLabLogoStyle: CSSProperties = {
  width: '60px',
  height: '18px',
  cursor: 'pointer'
}

const copyrightStyle: CSSProperties = {
  fontSize: '14px',
  lineHeight: '25px',
  color: DEFAULT_SECONDARY_TEXT,
}

const smallFooterStyle: CSSProperties = {
  width: '290px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: '30px'
}

const smallTopRowStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center'
}

const linkContainerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  marginTop: '30px',
}

const smallMidRowStyle: CSSProperties = {
  width: '100%',
  height: '130px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px'
}

const smallBottomRowStyle: CSSProperties = {

}

const footerHorizontalDividerStyle: CSSProperties = {
  width: '100vw',
  height: '1px',
  backgroundColor: HORIZONTAL_DIVIDER,
  marginTop: '20px',
  marginBottom: '40px',
}

const marginlessLinkStyle: CSSProperties = {
  margin: 0
}

export const styles = {
  Footer: footerStyle,
  TopRow: topRowStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  BottomRow: bottomRowStyle,
  RadarLogo: radarLogoStyle,
  Link: linkStyle,
  SmallLink: smallLinkStyle,
  BroadbandMappingLogo: broadbandMappingLogoStyle,
  ANTHCLogo: ANTHCLogoStyle,
  MLabLogo: MLabLogoStyle,
  SmallANTHCLogo: smallANTHLogoStyle,
  SmallMLabLogo: smallMLabLogoStyle,
  Copyright: copyrightStyle,
  SmallFooter: smallFooterStyle,
  SmallTopRow: smallTopRowStyle,
  LinkContainer: linkContainerStyle,
  SmallMidRow: smallMidRowStyle,
  SmallBottomRow: smallBottomRowStyle,
  FooterHorizontalDivider: footerHorizontalDividerStyle,
  MarginlessLink: marginlessLinkStyle,
}