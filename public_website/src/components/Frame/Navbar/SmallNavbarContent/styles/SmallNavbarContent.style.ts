import {CSSProperties} from "react";
import {OPEN_NAVBAR_BOX_SHADOW} from "../../../../../utils/colors";

const navbarContentWrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: 'max-content',
}

const navbarContentWrapperWithShadowStyle: CSSProperties = {
  ...navbarContentWrapperStyle,
  boxShadow: `0 3px 30px -4px ${OPEN_NAVBAR_BOX_SHADOW}`,
  backdropFilter: 'blur(15px)'
}

const navbarContentStyle: CSSProperties = {
  width: 'calc(100% - 40px)',
  height: '25px',
  margin: '20px auto',
  position: 'relative'
}

const logoStyle: CSSProperties = {
  width: '104px',
  height: '25px',
  cursor: 'pointer'
}

const iconStyle: CSSProperties = {
  width: '24px',
  height: '24px',
  position: 'absolute',
  right: 0,
  top: '50%',
  marginTop: '-12px',
}

const marginlessLinkStyle: CSSProperties = {
  margin: 0
}

export const styles = {
  NavbarContentWrapper: (isOpen: boolean) => {
    return isOpen ? navbarContentWrapperWithShadowStyle : navbarContentWrapperStyle;
  },
  NavbarContent: navbarContentStyle,
  Logo: logoStyle,
  Icon: iconStyle,
  MarginlessLink: marginlessLinkStyle,
}