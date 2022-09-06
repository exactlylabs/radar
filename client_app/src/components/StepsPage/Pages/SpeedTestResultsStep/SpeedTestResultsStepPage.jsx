import {MyTitle} from "../../../common/MyTitle";
import TestStatsTableContent from "../SpeedTestStep/TestStatsTable";
import {DEFAULT_EXPLORE_AREA_COLOR, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import ArrowRightBlue from '../../../../assets/icons-arrow-right-blue.png';
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {useScreenSize} from "../../../../hooks/useScreenSize";

const speedTestResultsContainerStyle = {
  marginTop: 25,
}

const exploreAreaStyle = {
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '20px auto 35px'
}

const textStyle = {
  color: DEFAULT_EXPLORE_AREA_COLOR,
  fontSize: 16,
  cursor: 'pointer',
}

const buttonFooterStyle = {
  display: 'flex',
  flexDirection: 'row',
  margin: 'auto',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '20%',
  minWidth: 300,
  marginBottom: 120,
  marginTop: 42,
}

const mobileButtonFooterStyle = {
  ...buttonFooterStyle,
  margin: '35px auto 70px',
}

const regularTextStyle = {
  color: DEFAULT_TEXT_COLOR,
  fontSize: 16,
  marginRight: 3,
}

const SpeedTestResultsStepPage = ({
  testResults,
  userStepData,
  goToAreaMap,
  goToHistory,
  goToTestAgain
}) => {

  const goToHistoryWithRecentTestTaken = () => goToHistory(true);
  const isMobile = useScreenSize();

  return (
    <div style={speedTestResultsContainerStyle}>
      <MyTitle text={'Your test results'}/>
      <div style={exploreAreaStyle} onClick={goToAreaMap}>
        <p style={regularTextStyle}>See how you compare to others.</p>
        <div className={'bold opaque-hoverable'} style={textStyle}>Explore your area</div>
        <img src={ArrowRightBlue} style={{marginLeft: 7}} width={14} height={14} alt={'blue-arrow-right'}/>
      </div>
      <TestStatsTableContent extended
                             latencyValue={testResults.latency.toFixed(0)}
                             downloadValue={testResults.downloadValue.toFixed(2)}
                             uploadValue={testResults.uploadValue.toFixed(2)}
                             lossValue={testResults.loss.toFixed(2)}
                             userStepData={userStepData}
      />
      <div style={isMobile ? mobileButtonFooterStyle : buttonFooterStyle}>
        <MyBackButton text={'Test again'} onClick={goToTestAgain}/>
        <MyForwardButton text={'View all results'} onClick={goToHistoryWithRecentTestTaken}/>
      </div>
    </div>
  )
}

export default SpeedTestResultsStepPage;