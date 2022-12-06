import {CSSProperties} from "react";
import {DEFAULT_TEXT} from "../../../../../../utils/colors";

const smallNavbarContentOpenStyle: CSSProperties = {
  width: '100vw',
  height: '365px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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

export const styles = {
  SmallNavbarContentOpen: smallNavbarContentOpenStyle,
  TabsContainer: tabsContainerStyle,
  Link: linkStyle,
}