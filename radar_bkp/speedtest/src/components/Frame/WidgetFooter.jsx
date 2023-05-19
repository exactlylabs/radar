import {DEFAULT_FILTERS_SUBTITLE_COLOR, DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR, WHITE} from "../../utils/colors";
import RadarLogoGray from '../../assets/radar-logo-gray.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";
const widgetFooterStyle = {
  width: '100%',
  height: 55,
  backgroundColor: WHITE,
  borderTop: `solid 1px ${DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR}`
}

const widgetFooterContentStyle = {
  width: '90%',
  maxWidth: '1200px',
  height: '100%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const leftSideContainer = {
  width: '50%',
  marginLeft: 15,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center'
}

const rightSideContainer = {
  marginRight: 15,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center'
}

const poweredByStyle = {
  marginRight: 6,
  width: 'max-content',
  whiteSpace: 'nowrap',
  fontSize: 13,
  color: DEFAULT_FILTERS_SUBTITLE_COLOR
}

const privacyStyle = {
  marginRight: '10%',
  width: 'max-content',
  whiteSpace: 'nowrap',
  fontSize: 13,
  fontWeight: 'bold',
  color: DEFAULT_FILTERS_SUBTITLE_COLOR
}

const WidgetFooter = () => {
  return (
    <div style={widgetFooterStyle}>
      <div style={widgetFooterContentStyle}>
        <div style={leftSideContainer}>
          <div style={poweredByStyle}>Powered by</div>
          <img src={RadarLogoGray} height={17} width={70} alt={'radar-logo'}/>
        </div>
        <div style={rightSideContainer}>
          <a style={privacyStyle} href={'https://radartoolkit.com/privacy-policy'} target={'_blank'}>Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}

export default WidgetFooter;