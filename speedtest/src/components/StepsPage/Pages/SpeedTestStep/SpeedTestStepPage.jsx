import {useContext, useEffect} from "react";
import SpeedGauge from "./SpeedGauge";
import ConnectionInformation from "./ConnectionInformation";
import StartTestPrompt from "./StartTestPrompt";
import TestStatsTableContent from "./TestStatsTable";
import {DEFAULT_FOOTER_FONT_COLOR} from "../../../../utils/colors";
import ConfigContext from "../../../../context/ConfigContext";
import SpeedTestContext from "../../../../context/SpeedTestContext";
import { useTranslation } from 'react-i18next';

const footerStyle = {
  fontSize: 14,
  color: DEFAULT_FOOTER_FONT_COLOR
}

const SpeedTestStepPage = ({
  goForward,
  goBack
}) => {
  const { t } = useTranslation();
  const {speedTestData, runNdt7Test} = useContext(SpeedTestContext);
  const {isRunning, runningTestType, startTimestamp, disabled} = speedTestData;
  const config = useContext(ConfigContext);

  useEffect(() => {
    if(!isRunning && startTimestamp) {
      goForward();
    }
  }, [isRunning, startTimestamp]);

  return (
    <div style={{width: '100%'}}>
      <ConnectionInformation />
      { disabled ?
        <StartTestPrompt startTest={runNdt7Test} goBack={goBack}/> :
        <>
          <SpeedGauge/>
          <div style={footerStyle} dangerouslySetInnerHTML={{ __html: t('speedTest.running.status', { runningTestType: t(`expectedSpeeds.input.${runningTestType}`) }) }} />
        </>
      }
      { !config.widgetMode && <TestStatsTableContent/> }
    </div>
  )
}

export default SpeedTestStepPage;