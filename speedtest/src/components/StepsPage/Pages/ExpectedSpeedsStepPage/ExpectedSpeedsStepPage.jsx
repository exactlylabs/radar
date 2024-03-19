import { useContext } from "react";
import { DEFAULT_TEXT_COLOR } from "../../../../utils/colors";
import { MyTitle } from "../../../common/MyTitle";
import PreferNotToAnswer from "../../../common/PreferNotToAnswer";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import UserDataContext from "../../../../context/UserData";
import styles from './expected_speeds_step_page.module.css';
import ExpectedSpeedInput from "./ExpectedSpeedInput/ExpectedSpeedInput";
import ConfigContext from "../../../../context/ConfigContext";

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ExpectedSpeedsStepPage = ({
  goForward,
  goBack
}) => {

  const { userData, setExpectedSpeeds } = useContext(UserDataContext);
  const config = useContext(ConfigContext);

  const handleInputChange = e => {
    const inputType = e.target.dataset.inputType;
    if(inputType === 'download') {
      setExpectedSpeeds({upload: userData.expectedUploadSpeed, download: e.target.value});
    } else {
      setExpectedSpeeds({ download: userData.expectedDownloadSpeed, upload: e.target.value });
    }
  }

  return (
    <div className={styles.screenContainer}>
      <MyTitle text={`What are your expected Internet speeds?`} />
      <div style={subtitleStyle}>Tell us a bit more about your service.</div>
      <div className={`${styles.inputsContainer} ${config.widgetMode ? styles.widgetInputsContainer : null}`} data-is-widget={config.widgetMode}>
        <ExpectedSpeedInput type={'download'}
          handleChange={handleInputChange}
          initialValue={userData.expectedDownloadSpeed}
        />
        <ExpectedSpeedInput type={'upload'}
          handleChange={handleInputChange}
          initialValue={userData.expectedDownloadSpeed}
        />
      </div>
      <MyStepSwitcher goForward={goForward} goBack={goBack} forwardDisabled={!userData.expectedDownload && !userData.expectedUpload} />
      <PreferNotToAnswer goForward={goForward} />
    </div>
  );
}

export default ExpectedSpeedsStepPage;