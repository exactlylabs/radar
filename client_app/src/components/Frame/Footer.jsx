import {
  DEFAULT_FOOTER_BACKGROUND_COLOR,
  DEFAULT_FOOTER_FONT_COLOR, DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR,
  DEFAULT_HORIZONTAL_DIVIDER_BG_COLOR
} from '../../utils/colors';
import anthcLogo from '../../assets/anthc-logo.png';
import radarLogoDark from '../../assets/radar-logo-dark.png';
import {useMobile} from "../../hooks/useMobile";
import {useSmall} from "../../hooks/useSmall";

const footerStyle = {
  height: 173,
  backgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
};

const contentWrapperStyle = {
  width: '90%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
};

const leftSideContainerStyle = {
  width: '35%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  minWidth: 300,
};

const rightSideContainerStyle = {
  width: '65%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  margin: '35px 0 auto auto',
  alignItems: 'center',
};

const leftSideTopRowStyle = {
  height: 30,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '35px auto 40px 0',
  width: '100%',
  fontSize: 15,
  color: DEFAULT_FOOTER_FONT_COLOR,
  fontWeight: 'bold',
};

const leftSideBottomRowStyle = {
  width: '100%',
  fontSize: 14,
  color: DEFAULT_FOOTER_FONT_COLOR,
};

const mobileFooterStyle = {
  display: 'flex',
  height: 'max-content',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
}

const horizontalDividerStyle = {
  width: '90%',
  height: 1,
  backgroundColor: DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR,
  marginBottom: 15,
}

const footerLinkStyle = {
  fontSize: 15,
  fontWeight: 'bold',
  marginBottom: 15,
  color: DEFAULT_FOOTER_FONT_COLOR
}

const copyrightStyle = {
  fontSize: 14,
  marginBottom: 30,
}

const FooterHorizontalDivider = () => <div style={horizontalDividerStyle}></div>

// Commented until we add the MLab logo back again
/*const anthcLogoStyle = {
  marginRight: 48,
};*/

const Footer = () => {
  const isMobile = useMobile();
  const isSmall = useSmall();

  return isMobile || isSmall ?
    <div style={mobileFooterStyle}>
      <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} style={{ marginBottom: 30, marginTop: 25 }} />
      <div style={footerLinkStyle}>Privacy Policy</div>
      <div style={footerLinkStyle}>Terms of Use</div>
      <img src={anthcLogo} alt={'ANTHC-logo'} width={110} height={30} style={{marginTop: 15, marginBottom: 20}}/>
      <FooterHorizontalDivider />
      <div style={copyrightStyle}>Copyright © 2022. Radar. All Rights Reserved</div>
    </div>
    :
    <div style={footerStyle}>
      <div style={contentWrapperStyle}>
        <div style={leftSideContainerStyle}>
          <div style={leftSideTopRowStyle}>
            <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} style={{ marginRight: 20 }} />
            <div>Privacy Policy</div>
            <div>Terms of Use</div>
          </div>
          <div style={leftSideBottomRowStyle}>
            <div>Copyright © 2022. Radar. All Rights Reserved</div>
          </div>
        </div>
        <div style={rightSideContainerStyle}>
          <img src={anthcLogo} alt={'ANTHC-logo'} width={110} height={30} />
        </div>
      </div>
    </div>
};

export default Footer;
