import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";
import CheckIcon from '../../../../assets/check-icon.png';
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

const noInternetStepPageStyle = {
  width: '45%',
  margin: '0 auto',
  maxWidth: 580,
}

const mobileNoInternetStepPageStyle = {
  ...noInternetStepPageStyle,
  width: '95%',
}

const firstLineStyle = {
  color: DEFAULT_TEXT_COLOR
}

const secondLineStyle = {
  color: DEFAULT_TEXT_COLOR,
  marginBottom: 40,
  marginTop: 10,
}

const buttonWrapperStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto 90px'
}

const checkIconStyle = {
  marginBottom: 20,
  marginTop: 30,
}

const NoInternetStepPage = ({
  goToMapPage
}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  return (
    <div style={(isMediumSizeScreen || isSmallSizeScreen) ? mobileNoInternetStepPageStyle : noInternetStepPageStyle}>
      <img style={checkIconStyle} src={CheckIcon} width={42} height={42} alt={'check-icon'}/>
      <MyTitle text={'Thanks for letting us know.'}/>
      <div style={firstLineStyle}>While we cannot run a speed test at your location as you don't have Internet, we do appreciate your information that helps us learn more about which areas are currently not served.</div>
      <div style={secondLineStyle}>You can explore the map to see how others compare to you.</div>
      <div style={buttonWrapperStyle}>
        <MyForwardButton text={'Explore the map'}
                         onClick={goToMapPage}
        />
      </div>
    </div>
  )
}

export default NoInternetStepPage;