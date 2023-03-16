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
  height: 173,
  backgroundColor: DEFAULT_FOOTER_BACKGROUND_COLOR,
  boxShadow: `0 0 10px 0 ${FOOTER_BOX_SHADOW}`
};

const contentWrapperStyle = {
  width: '90%',
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
  minWidth: 300,
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
  height: 30,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  margin: '35px auto 40px 0',
  width: '100%',
  fontSize: 15,
  color: DEFAULT_FOOTER_FONT_COLOR,
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

const footerLinkStyle = (isSmall, isMedium) => {
  if(isSmall || isMedium) return {
    fontSize: 15,
    textDecoration: 'none',
    margin: '0 0 15px 0',
    color: DEFAULT_FOOTER_FONT_COLOR
  };
  return {
    fontSize: 15,
    textDecoration: 'none',
    margin: '0',
    color: DEFAULT_FOOTER_FONT_COLOR
  }
}

const copyrightStyle = {
  fontSize: 14,
  marginBottom: 30,
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
  marginRight: 60
}

const Footer = () => {
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  return isMediumSizeScreen || isSmallSizeScreen ?
    <div style={mobileFooterStyle} id={'footer--wrapper'}>
      <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} style={{ marginBottom: 30, marginTop: 25 }} />
      <a className={'bold regular-link--hoverable'}
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
    </div>
    :
    <div style={footerStyle}>
      <div style={contentWrapperStyle}>
        <div style={leftSideContainerStyle}>
          <div className={'bold'} style={leftSideTopRowStyle}>
            <img src={radarLogoDark} alt={'Radar-logo-dark'} width={100} height={24} style={footerLogoStyle} />
            <a className={'bold regular-link--hoverable'}
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
    </div>
};

export default Footer;
