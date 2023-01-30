import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../../utils/colors";

const navbarContentStyle: CSSProperties = {
  width: '90%',
  maxWidth: '1200px',
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '18px',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const logoStyle: CSSProperties = {
  width: '104px',
  height: '25px',
  cursor: 'pointer'
}

const chevronRightStyle: CSSProperties = {
  width: '14px',
  height: '14px',
  marginLeft: '5px',
  marginRight: '-4px'
}

const tabsContainerStyle: CSSProperties = {
  width: '30%',
  height: '100%',
  minWidth: '250px',
  maxWidth: '375px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const linkStyle: CSSProperties = {
  textDecoration: 'none',
  color: DEFAULT_TEXT,
  height: '100%',
  display: 'flex',
  alignItems: 'center'
}

const centerLinkStyle: CSSProperties = {
  ...linkStyle,
  position: 'absolute',
  width: '84px',
  left: '50%',
  margin: '16px 0 16px -42px'
}

const leftLinkStyle: CSSProperties = {
  ...linkStyle,
  width: '73px',
  position: 'absolute',
  left: 'calc(50% - 40px - 60px - 73px)',
  margin: '16px 0',
}

const rightLinkStyle: CSSProperties = {
  ...linkStyle,
  width: '84px',
  position: 'absolute',
  right: 'calc(50% - 42px - 60px - 84px)',
  margin: '16px 0',
}

export const styles = {
  NavbarContent: navbarContentStyle,
  Logo: logoStyle,
  ChevronRight: chevronRightStyle,
  TabsContainer: tabsContainerStyle,
  Link: linkStyle,
  CenterLink: centerLinkStyle,
  LeftLink: leftLinkStyle,
  RightLink: rightLinkStyle
}