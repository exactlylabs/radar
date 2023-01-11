import {CSSProperties} from "react";
import {DEFAULT_TEXT, WHITE} from "../../../../../../utils/colors";

const smallNavbarContentOpenStyle: CSSProperties = {
  width: '100vw',
  height: '365px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: '63px',
  boxShadow: `0px 30px 30px -4px rgba(0, 0, 0, 0.15)`,
  zIndex: 10,
  backgroundColor: WHITE,
  backdropFilter: 'blur(15px)'
}

const tabsContainerStyle: CSSProperties = {
  width: 'calc(100% - 40px)',
  height: 'calc(100% - 20px)',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start'
}

const linkStyle: CSSProperties = {
  textDecoration: 'none',
  color: DEFAULT_TEXT,
}

const linkTextStyle: CSSProperties = {
  color: DEFAULT_TEXT,
  margin: 0
}

export const styles = {
  SmallNavbarContentOpen: smallNavbarContentOpenStyle,
  TabsContainer: tabsContainerStyle,
  Link: linkStyle,
  LinkText: linkTextStyle,
}