import MyCheckbox from "../../../common/MyCheckbox";
import {DEFAULT_LINK_COLOR, DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {MyForwardButton} from "../../../common/MyForwardButton";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import Bullet from "./Bullet";

import rightArrowWhite from "../../../../assets/right-arrow-white.png";
import initialHeroIcon from '../../../../assets/initial-page-hero-icon.png';
import initialPageShadow from '../../../../assets/initial-page-shadow.png';
import performanceIcon from '../../../../assets/performance-icon.png';
import mapIcon from '../../../../assets/map-icon.png';
import speedTestsIcon from '../../../../assets/speedtests-icon.png';
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

const initialStepPageStyle = {
  width: '100%',
  height: '100%'
}

const contentWrapperStyle = {
  width: '90%',
  margin: '0 auto',
}

const smallContentWrapperStyle = {
  width: 'calc(100% - 40px)',
  margin: '0 auto',
  paddingTop: '25px'
}

const textContainer = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  paddingBottom: '80px'
}

const smallTextContainer = {
  ...textContainer,
  paddingBottom: '55px',
  overflowX: 'hidden'
}

const termsStyle = {
  display: 'flex',
  width: 'max-content',
  maxWidth: '90%',
  margin: '0 auto',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  zIndex: 5,
}

const termsTextStyle = {
  fontSize: 14,
  color: DEFAULT_TEXT_COLOR,
  margin: 0
}

const linkStyle = {
  color: DEFAULT_LINK_COLOR,
}

const rightArrowStyle = {
  width: 14,
  height: 14,
  marginLeft: '15px',
  marginRight: '-4px'
}

const heroIcon = {
  width: '236px',
  height: 'auto',
  margin: '0 auto'
}

const titleStyle = {
  fontSize: '26px',
  lineHeight: '40px',
  color: DEFAULT_TEXT_COLOR,
  margin: '0 0 15px 0',
  width: '100%'
}

const smallTitleStyle = {
  ...titleStyle,
  fontSize: '22px',
  margin: '0 0 10px 0'
}

const subtitleStyle = {
  fontSize: '16px',
  lineHeight: '25px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 0 30px 0',
  maxWidth: '600px',
  width: '100%'
}

const smallSubtitleStyle = {
  ...subtitleStyle,
  margin: '0 0 35px 0',
}

const shadowImage = {
  width: '988px',
  height: 'auto',
  position: 'absolute',
  bottom: 0,
  left: '50%',
  marginLeft: '-494px',
  zIndex: 0
}

const smallShadowImage = {
  ...shadowImage,
  width: '120%',
  marginLeft: '-60%'
}

const bulletsContainer = {
  width: '100%',
  maxWidth: '1100px',
  paddingTop: '60px',
  paddingBottom: '60px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto'
}

const smallBulletsContainer = {
  width: '100%',
  paddingTop: '50px',
  paddingBottom: '50px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto'
}

const iconStyle = {
  width: '30px',
  maxWidth: '30px',
  minWidth: '30px',
  height: '30px',
  maxHeight: '30px',
  minHeight: '30px',
}

const InitialStepPage = ({terms, setTerms, goToNextPage, error}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const isSmall = isSmallSizeScreen || isMediumSizeScreen;

  const handleSetTerms = checked => setTerms(checked);

  return (
    <div style={initialStepPageStyle}>
      <div style={isSmall ? smallContentWrapperStyle : contentWrapperStyle}>
        <div style={isSmall ? smallTextContainer : textContainer}>
          <img src={initialHeroIcon} alt={'initial screen hero icon'} style={heroIcon}/>
          <p className={'extra-bold'} style={isSmall ? smallTitleStyle : titleStyle}>Test your Internet speed</p>
          <p style={isSmall ? smallSubtitleStyle : subtitleStyle}>We’ll ask you a few questions to better understand where and how you’re connected so we can learn more about your current service.</p>
          <div style={{...termsStyle, marginBottom: error ? '-10px' : '35px'}}>
            <MyCheckbox onChange={handleSetTerms} isChecked={terms}/>
            <p style={termsTextStyle}>I agree to the Radar’s <a className={'opaque-hoverable'} style={linkStyle} href={'https://radartoolkit.com/privacy-policy'} target={'_blank'}>Privacy Policy</a>.</p>
          </div>
          { error && <MyMessageSnackbar type={'error'} message={error}/> }
          <MyForwardButton text={'Take the test'} icon={<img src={rightArrowWhite} style={rightArrowStyle} alt={'location-button-icon'} width={14} height={14}/>} onClick={goToNextPage}/>
          <img src={initialPageShadow} alt={'shadow'} style={isSmall ? smallShadowImage : shadowImage}/>
        </div>
        <div style={isSmall ? smallBulletsContainer : bulletsContainer}>
          <Bullet icon={<img src={speedTestsIcon} style={iconStyle} alt={'test icon'}/>} title={'Test your connectivity'} subtitle={'Get detailed information about your internet connection.'}/>
          <Bullet icon={<img src={performanceIcon} style={iconStyle} alt={'performance icon'}/>} title={'Keep track of your results'} subtitle={'Check your history to see how your connectivity does over time.'}/>
          <Bullet icon={<img src={mapIcon} style={iconStyle} alt={'map icon'}/>} title={'Compare your results'} subtitle={'Explore the map to see how broadband varies in your region.'}/>
        </div>
      </div>
    </div>
  )
}

export default InitialStepPage;