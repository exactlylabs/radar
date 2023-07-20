import {CSSProperties} from "react";
import {DEFAULT_SECONDARY_TEXT, HORIZONTAL_DIVIDER, SPECIAL_FOOTER} from "../../../../utils/colors";

const footerStyle: CSSProperties = {
  width: '100vw',
  height: '375px',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  position: 'relative',
  zIndex: 5
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
  marginRight: '50px',
  cursor: 'pointer'
}

const smallANTHLogoStyle: CSSProperties = {
  width: '110px',
  height: '31px',
  cursor: 'pointer'
}

const XLabLogoStyle: CSSProperties = {
  cursor: 'pointer',
  width: '32px',
  height: 'auto'
}

const smallXLabLogoStyle: CSSProperties = {
  cursor: 'pointer',
  width: '32px',
  height: 'auto'
}

const exactlyLogoStyle: CSSProperties = {
  width: '110px',
  height: 'auto',
  marginRight: '50px',
  cursor: 'pointer'
}

const smallExactlyLogoStyle: CSSProperties = {
  cursor: 'pointer',
  width: '110px',
  height: 'auto',
}

const copyrightStyle: CSSProperties = {
  fontSize: '14px',
  lineHeight: '25px',
  margin: '0 0 24px 0',
  color: DEFAULT_SECONDARY_TEXT,
}

const defInfoStyle: CSSProperties = {
  fontSize: '14px',
  lineHeight: '25px',
  margin: '0 0 40px 0',
  color: DEFAULT_SECONDARY_TEXT,
}

const smallFooterStyle: CSSProperties = {
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingTop: '30px',
  marginTop: '185px',
  position: 'relative',
  zIndex: 5
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
  height: '143px',
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

const footerContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  margin: '215px auto auto'
}

export const styles = {
  Footer: (isDifferentColor?: boolean, height?: string) => {
    let style = footerStyle;
    if(isDifferentColor) style = {...style, backgroundColor: SPECIAL_FOOTER};
    if(height) style = {...style, height};
    return style;
  },
  FooterContent: (margin?: string) => {
    let style = footerContentStyle;
    if(margin) style = {...style, margin};
    return style;
  },
  TopRow: topRowStyle,
  LeftColumn: leftColumnStyle,
  RightColumn: rightColumnStyle,
  BottomRow: bottomRowStyle,
  RadarLogo: radarLogoStyle,
  Link: linkStyle,
  SmallLink: smallLinkStyle,
  BroadbandMappingLogo: broadbandMappingLogoStyle,
  ANTHCLogo: ANTHCLogoStyle,
  XLabLogo: XLabLogoStyle,
  ExactlyLogo: exactlyLogoStyle,
  SmallANTHCLogo: smallANTHLogoStyle,
  SmallXLabLogo: smallXLabLogoStyle,
  SmallExactlyLogo: smallExactlyLogoStyle,
  Copyright: copyrightStyle,
  DeveloperInfo: defInfoStyle,
  SmallFooter: (isDifferentColor?: boolean, marginTop?: string) => {
    let style = smallFooterStyle;
    if(isDifferentColor) style = {...style, backgroundColor: SPECIAL_FOOTER, marginTop: marginTop ?? '160px'};
    return style;
  },
  SmallTopRow: smallTopRowStyle,
  LinkContainer: linkContainerStyle,
  SmallMidRow: smallMidRowStyle,
  SmallBottomRow: smallBottomRowStyle,
  FooterHorizontalDivider: footerHorizontalDividerStyle,
  MarginlessLink: marginlessLinkStyle,
}