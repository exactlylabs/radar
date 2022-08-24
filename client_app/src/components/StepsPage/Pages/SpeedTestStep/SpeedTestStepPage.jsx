import SpeedGauge from "./SpeedGauge";
import {useEffect, useState} from "react";
import ConnectionInformation from "./ConnectionInformation";
import StartTestPrompt from "./StartTestPrompt";
import TestStatsTableContent from "./TestStatsTable";
import {storeRunData} from "../../../../utils/storage";

const footerStyle = {
  fontSize: 14,
}

const SpeedTestStepPage = ({
  userStepData,
  goForward
}) => {

  const [disabled, setDisabled] = useState(true);
  const [testProgress, setTestProgress] = useState(0);
  const [loss, setLoss] = useState(null);
  const [latency, setLatency] = useState(null);
  const [downloadValue, setDownloadValue] = useState(null);
  const [uploadValue, setUploadValue] = useState(null);

  const storeRunResults = startTimestamp => {
    const results = {
      startTimestamp,
      downloadValue,
      uploadValue,
      location: userStepData.address.coordinates,
      loss,
      latency,
    };
    storeRunData(results);
    goForward(results);
  }

  return (
    <div>
      <ConnectionInformation disabled={disabled} progress={testProgress} userStepData={userStepData}/>
      {
        disabled &&
        <StartTestPrompt startTest={() => setDisabled(false)}/>
      }
      {
        !disabled &&
        <>
          <SpeedGauge setProgress={setTestProgress}
                      setLoss={setLoss}
                      setLatency={setLatency}
                      setDownloadValue={setDownloadValue}
                      downloadValue={downloadValue}
                      setUploadValue={setUploadValue}
                      uploadValue={uploadValue}
                      storeRunData={storeRunResults}
                      userStepData={userStepData}
          />
          <div style={footerStyle}>Testing <b>{!uploadValue ? 'download' : 'upload'}</b> speed...</div>
        </>
      }
      <TestStatsTableContent disabled={disabled}
                             downloadValue={downloadValue?.toFixed(2)}
                             uploadValue={uploadValue?.toFixed(2)}
                             latencyValue={latency?.toFixed(0)}
                             lossValue={loss?.toFixed(2)}
      />
    </div>
  )
}

export default SpeedTestStepPage;