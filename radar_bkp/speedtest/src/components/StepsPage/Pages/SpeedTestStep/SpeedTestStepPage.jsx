import {useContext, useState} from "react";
import SpeedGauge from "./SpeedGauge";
import ConnectionInformation from "./ConnectionInformation";
import StartTestPrompt from "./StartTestPrompt";
import TestStatsTableContent from "./TestStatsTable";
import {storeRunData} from "../../../../utils/storage";
import {DEFAULT_FOOTER_FONT_COLOR} from "../../../../utils/colors";
import UserDataContext from "../../../../context/UserData";

const footerStyle = {
  fontSize: 14,
  color: DEFAULT_FOOTER_FONT_COLOR
}

const SpeedTestStepPage = ({
  goForward,
  goBack
}) => {

  const [disabled, setDisabled] = useState(true);
  const [testProgress, setTestProgress] = useState(0);
  const [loss, setLoss] = useState(null);
  const [latency, setLatency] = useState(null);
  const [downloadValue, setDownloadValue] = useState(null);
  const [uploadValue, setUploadValue] = useState(null);
  const {userData} = useContext(UserDataContext);

  const storeRunResults = startTimestamp => {
    const results = {
      startTimestamp,
      downloadValue: downloadValue ?? 0.0,
      uploadValue: uploadValue ?? 0.0,
      loss: loss ?? 0.0,
      latency: latency ?? 0.0,
      networkType: userData.networkType?.text ?? null,
      networkLocation: userData.networkLocation?.text ?? null,
      location: userData.address.coordinates,
      ...userData.address,
    };
    storeRunData(results);
    goForward(results);
  }

  const enableContent = () => setDisabled(false);

  return (
    <div style={{width: '100%'}}>
      <ConnectionInformation disabled={disabled} progress={testProgress}/>
      {
        disabled &&
        <StartTestPrompt startTest={enableContent}
                         goBack={goBack}
        />
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