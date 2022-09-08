import {DEFAULT_FILTERS_SUBTITLE_COLOR, DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR, WHITE} from "../../utils/colors";
import RadarLogoGray from '../../assets/radar-logo-gray.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";
const widgetFooterStyle = {
  width: '100%',
  height: 55,
  backgroundColor: WHITE,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: `solid 1px ${DEFAULT_FOOTER_HORIZONTAL_DIVIDER_BG_COLOR}`
}

const narrowWidgetFooterStyle = {
  ...widgetFooterStyle,
  height: 'max-content',
  flexDirection: 'column',
}

const leftSideContainer = {
  width: '50%',
  marginLeft: 15,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center'
}

const narrowLeftSideContainer = {
  ...leftSideContainer,
  marginBottom: 10,
  marginTop: 10,
  marginLeft: 0,
  width: 'max-content'
}

const rightSideContainer = {
  marginRight: 15,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center'
}

const narrowRightSideContainer = {
  ...rightSideContainer,
  marginBottom: 10,
  marginRight: 0,
  justifyContent: 'center'
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

const termsStyle = {
  width: 'max-content',
  whiteSpace: 'nowrap',
  fontSize: 13,
  fontWeight: 'bold',
  color: DEFAULT_FILTERS_SUBTITLE_COLOR
}

const WidgetFooter = () => {

  const {isMediumSizeScreen} = useViewportSizes();

  return (
    <div style={isMediumSizeScreen ? narrowWidgetFooterStyle : widgetFooterStyle}>
      <div style={isMediumSizeScreen ? narrowLeftSideContainer : leftSideContainer}>
        <div style={poweredByStyle}>Powered by</div>
        <img src={RadarLogoGray} height={17} width={70} alt={'radar-logo'}/>
      </div>
      <div style={isMediumSizeScreen ? narrowRightSideContainer : rightSideContainer}>
        <div style={privacyStyle}>Privacy Policy</div>
        <div style={termsStyle}>Terms of Use</div>
      </div>
    </div>
  )
}

export default WidgetFooter;