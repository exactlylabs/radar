import { DEFAULT_FOOTER_BACKGROUND_COLOR, DEFAULT_FOOTER_FONT_COLOR } from '../../utils/colors';
import anthcLogo from '../../assets/anthc-logo.png';
import radarLogoDark from '../../assets/radar-logo-dark.png';
import mlabLogo from '../../assets/mlab-logo.png';

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
  width: '45%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  minWidth: 245,
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

const anthcLogoStyle = {
  marginRight: 48,
};

const Footer = () => {
  return (
    <div style={footerStyle}>
      <div style={contentWrapperStyle}>
        <div style={leftSideContainerStyle}>
          <div style={leftSideTopRowStyle}>
            <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} />
            <div>Cookie Policy</div>
            <div>Privacy Policy</div>
            <div>Terms of Use</div>
          </div>
          <div style={leftSideBottomRowStyle}>
            <div>Copyright © 2022. Radar. All Rights Reserved</div>
          </div>
        </div>
        <div style={rightSideContainerStyle}>
          <img src={anthcLogo} alt={'ANTHC-logo'} width={110} height={30} style={anthcLogoStyle} />
          <img src={mlabLogo} alt={'MLAB-logo'} width={60} height={18} />
        </div>
      </div>
    </div>
  );
};

export default Footer;
