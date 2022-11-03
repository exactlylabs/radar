import {CSSProperties} from "react";
import {FOOTER_TEXT, WHITE} from "../../../../styles/colors";

const openedTopMenuContainerStyle: CSSProperties = {
  width: '100vw',
  height: '355px',
  backgroundColor: WHITE,
  zIndex: 1050,
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: '48px',
  left: 0
}

const pinIconStyle: CSSProperties = {
  width: '20px',
  height: '20px',
  minWidth: '20px',
  minHeight: '20px',
  marginRight: '4px'
}

const tabsContainerStyle: CSSProperties = {
  width: '100%',
  height: 'max-content',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginTop: '30px',
  marginBottom: '30px',
}

const buttonContainerStyle: CSSProperties = {
  width: 'max-content',
  height: 'max-content',
  margin: '0 auto 30px',
}

const linksContainerStyle: CSSProperties = {
  width: '220px',
  margin: '15px auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const linkStyle: CSSProperties = {
  fontSize: '16px',
  color: FOOTER_TEXT,
  textDecoration: 'none',
}

const associationsContainerStyle: CSSProperties = {
  width: '300px',
  height: 'max-content',
  margin: '25px auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const logosContainerStyle: CSSProperties = {
  width: '100%',
  height: '28px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  margin: '20px auto 36px'
}

const anthcLogoStyle: CSSProperties = {
  width: '100px',
  height: '28px',
}

const exactlyLogoStyle: CSSProperties = {
  width: '100px',
  height: '23px',
  cursor: 'pointer',
}

const xlabLogoStyle: CSSProperties = {
  width: '24px',
  height: '28px',
}

const AssociationTextStyle: CSSProperties = {
  fontSize: '14px',
  color: FOOTER_TEXT,
}

const RightsTextStyle: CSSProperties = {
  fontSize: '14px',
  color: FOOTER_TEXT,
}

export const styles = {
  OpenedTopMenuContainer: openedTopMenuContainerStyle,
  PinIcon: pinIconStyle,
  TabsContainer: tabsContainerStyle,
  ButtonContainer: buttonContainerStyle,
  LinksContainer: linksContainerStyle,
  Link: linkStyle,
  AssociationsContainer: associationsContainerStyle,
  LogosContainer: logosContainerStyle,
  AnthcLogo: anthcLogoStyle,
  ExactlyLogo: exactlyLogoStyle,
  XlabLogo: xlabLogoStyle,
  AssociationText: AssociationTextStyle,
  RightsText: RightsTextStyle,
}