import {MyTitle} from "../../../common/MyTitle";
import TestStatsTableContent from "../SpeedTestStep/TestStatsTable";
import {DEFAULT_EXPLORE_AREA_COLOR} from "../../../../utils/colors";
import ArrowRightBlue from '../../../../assets/icons-arrow-right-blue.png';
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {useMobile} from "../../../../hooks/useMobile";

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
  fontWeight: 'bold',
  fontSize: 16,
}

const buttonFooterStyle = {
  display: 'flex',
  flexDirection: 'row',
  margin: 'auto',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '20%',
  minWidth: 300,
}

const mobileButtonFooterStyle = {
  ...buttonFooterStyle,
  margin: '35px auto 70px',
}

const SpeedTestResultsStepPage = ({
  testResults,
  userStepData,
  goToAreaMap,
  goToHistory,
  goToTestAgain
}) => {

  const goToHistoryWithRecentTestTaken = () => goToHistory(true);
  const isMobile = useMobile();

  return (
    <div style={speedTestResultsContainerStyle}>
      <MyTitle text={'Your test results'}/>
      <div style={exploreAreaStyle} onClick={goToAreaMap}>
        <div style={textStyle}>Explore you area</div>
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