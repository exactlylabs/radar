import SpeedGauge from "./SpeedGauge";
import {useState} from "react";
import ConnectionInformation from "./ConnectionInformation";
import StartTestPrompt from "./StartTestPrompt";
import TestStatsTable from "./TestStatsTable";
import {storeRunData} from "../../../../utils/storage";

const footerStyle = {
  fontSize: 14,
}

const SpeedTestStepPage = ({
  userStepData
}) => {

  const [disabled, setDisabled] = useState(true);
  const [testProgress, setTestProgress] = useState(0);
  const [loss, setLoss] = useState(0);
  const [latency, setLatency] = useState(0);
  const [downloadValue, setDownloadValue] = useState(null);
  const [uploadValue, setUploadValue] = useState(null);

  const storeRunResults = startTimestamp => {
    const results = {
      startTimestamp,
      downloadValue,
      uploadValue,
      location,
      loss,
      latency,
    };
    storeRunData(results);
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
          />
          <div style={footerStyle}>Testing <b>{!uploadValue ? 'download' : 'upload'}</b> speed...</div>
        </>
      }
      <TestStatsTable disabled={disabled}
                      downloadValue={downloadValue?.toFixed(2)}
                      uploadValue={uploadValue?.toFixed(2)}
                      latencyValue={latency?.toFixed(0)}
                      pingValue={null}
      />
    </div>
  )
}

export default SpeedTestStepPage;