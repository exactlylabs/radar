import {WHITE} from "../../utils/colors";

const navElementStyle = {
  cursor: 'pointer',
  color: WHITE,
  fontSize: 16,
  marginRight: 45,
};

const mobileNavElementStyle = {
  fontSize: 16,
  color: WHITE,
  marginBottom: 15,
}

const MyNavLink = ({text, onClick, isCollapsed}) =>
  <p className={'speedtest--p speedtest--bold speedtest--navlink--hoverable'}
     onClick={onClick}
     style={isCollapsed ? mobileNavElementStyle : navElementStyle}>
    {text}
  </p>
;

export default MyNavLink;