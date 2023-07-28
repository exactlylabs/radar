import {
  DEFAULT_FOOTER_BACKGROUND_COLOR,
  DEFAULT_FOOTER_FONT_COLOR, DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR, FOOTER_BOX_SHADOW
} from '../../utils/colors';
import anthcLogo from '../../assets/anthc-logo.png';
import exactlyLogo from '../../assets/exactly-logo.png';
import xlabLogo from '../../assets/xlab-logo.png';
import radarLogoDark from '../../assets/radar-logo-dark.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";

const footerStyle = {
  height: '239px`',
  backgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
  boxShadow: `0 0 10px 0 ${FOOTER_BOX_SHADOW}`
};

const contentWrapperStyle = {
  width: '90%',
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'stretch',
  margin: '0 auto',
};

const topContainerWrapperStyle = {
  width: '100%',
  maxWidth: '1200px',
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
  minWidth: '300px',
};

const rightSideContainerStyle = {
  width: '65%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  margin: '31px 0 auto auto',
  alignItems: 'center',
};

const leftSideTopRowStyle = {
  height: '30px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  margin: '35px auto 40px 0',
  width: '100%',
  fontSize: '15px',
  color: DEFAULT_FOOTER_FONT_COLOR,
};

const leftSideBottomRowStyle = {
  width: '100%',
  fontSize: '14px',
  color: DEFAULT_FOOTER_FONT_COLOR,
};

const bottomParagraphStyle = {
  width: '100%',
  fontSize: '14px',
  lineHeight: '21px',
  color: DEFAULT_FOOTER_FONT_COLOR,
  paddingBottom: '36px',
};

const mobileBottomParagraphStyle = {
  width: '100%',
  fontSize: '14px',
  color: DEFAULT_FOOTER_FONT_COLOR,
  lineHeight: '21px',
  textAlign: 'center',
  paddingBottom: '40px',
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
  height: '1px',
  backgroundColor: DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR,
  marginBottom: '15px',
}

const footerLinkStyle = (isSmall, isMedium) => {
  if(isSmall || isMedium) return {
    fontSize: '15px',
    textDecoration: 'none',
    margin: '0 0 15px 0',
    color: DEFAULT_FOOTER_FONT_COLOR
  };
  return {
    fontSize: '15px',
    textDecoration: 'none',
    margin: '0',
    color: DEFAULT_FOOTER_FONT_COLOR
  }
}

const copyrightStyle = {
  fontSize: '14px',
  marginBottom: '30px',
  lineHeight: '25px',
  color: DEFAULT_FOOTER_FONT_COLOR
}

const stylessLink = {
  textDecoration: 'none',
}

const linkWithRightMargin = {
  ...stylessLink,
  marginRight: '50px',
}

const linkWithBottomMargin = {
  ...stylessLink,
  marginBottom: '25px',
}

const FooterHorizontalDivider = () => <div style={horizontalDividerStyle}></div>

// Commented until we add the MLab logo back again
/*const anthcLogoStyle = {
  marginRight: 48,
};*/

const footerLogoStyle = {
  marginRight: '60px'
}

const Footer = () => {
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  return isMediumSizeScreen || isSmallSizeScreen ?
    <div style={mobileFooterStyle} id={'speedtest--footer--wrapper'}>
      <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} style={{ marginBottom: 30, marginTop: 25 }} />
      <a className={'speedtest--bold speedtest--regular-link--hoverable'}
         style={footerLinkStyle(isSmallSizeScreen, isMediumSizeScreen)}
         href={'https://radartoolkit.com/privacy-policy'}
         target={'_blank'}
      >Privacy Policy</a>
      <FooterHorizontalDivider />
      <a style={linkWithBottomMargin} href={'https://anthc.org'} target={'_blank'}>
        <img src={anthcLogo} alt={'ANTHC-logo'} width={110} height={30} style={{marginTop: 15, marginBottom: 20}}/>
      </a>
      <a style={linkWithBottomMargin} href={'https://exactlylabs.com'} target={'_blank'}>
        <img src={exactlyLogo} alt={'exactly labs logo'} width={110} height={24}/>
      </a>
      <a style={linkWithBottomMargin} href={'https://anthc.org'} target={'_blank'}>
        <img src={xlabLogo} alt={'XLab logo'} width={32} height={38}/>
      </a>
      <FooterHorizontalDivider />
      <div style={copyrightStyle}>{`Copyright © ${new Date().getFullYear()} Radar. All Rights Reserved`}</div>
      <div style={mobileBottomParagraphStyle}>This project was developed as part of the Telehealth Broadband Pilot Program.<br/>The Telehealth Broadband Pilot Program is made possible by grant #GA540183 from the Office for the Advancement of Telehealth, Health Resources and Services Administration, DHHS.</div>
    </div>
    :
    <div style={footerStyle}>
      <div style={contentWrapperStyle}>
        <div style={topContainerWrapperStyle}>
          <div style={leftSideContainerStyle}>
            <div className={'speedtest--bold'} style={leftSideTopRowStyle}>
              <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} style={footerLogoStyle} />
              <a className={'speedtest--bold speedtest--regular-link--hoverable'}
                style={footerLinkStyle(isSmallSizeScreen, isMediumSizeScreen)}
                href={'https://radartoolkit.com/privacy-policy'}
                target={'_blank'}
              >Privacy Policy</a>
            </div>
            <div style={leftSideBottomRowStyle}>
              <div>{`Copyright © ${new Date().getFullYear()} Radar. All Rights Reserved`}</div>
            </div>
          </div>
          <div style={rightSideContainerStyle}>
            <a style={linkWithRightMargin} href={'https://anthc.org'} target={'_blank'}>
              <img src={anthcLogo} alt={'ANTHC-logo'} width={110} height={30} />
            </a>
            <a style={linkWithRightMargin} href={'https://exactlylabs.com'} target={'_blank'}>
              <img src={exactlyLogo} alt={'exactly labs logo'} width={110} height={24}/>
            </a>
            <a style={stylessLink} href={'https://anthc.org'} target={'_blank'}>
              <img src={xlabLogo} alt={'XLab logo'} width={32} height={38}/>
            </a>
          </div>
        </div>
        <p style={bottomParagraphStyle}>This project was developed as part of the Telehealth Broadband Pilot Program.<br/>The Telehealth Broadband Pilot Program is made possible by grant #GA540183 from the Office for the Advancement of Telehealth, Health Resources and Services Administration, DHHS.</p>
      </div>
    </div>
};

export default Footer;
