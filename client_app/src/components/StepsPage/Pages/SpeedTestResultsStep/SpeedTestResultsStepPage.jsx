import {MyTitle} from "../../../common/MyTitle";
import TestStatsTableContent from "../SpeedTestStep/TestStatsTable";
import {DEFAULT_EXPLORE_AREA_COLOR} from "../../../../utils/colors";
import ArrowRightBlue from '../../../../assets/icons-arrow-right-blue.png';
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";

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

const SpeedTestResultsStepPage = ({
  testResults,
  userStepData,
  goToAreaMap,
  goToAllResults,
  goToTestAgain
}) => {

  return (
    <div>
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
      <div style={buttonFooterStyle}>
        <MyBackButton text={'Test again'} onClick={goToTestAgain}/>
        <MyForwardButton text={'View all results'} onClick={goToAllResults}/>
      </div>
    </div>
  )
}

export default SpeedTestResultsStepPage;