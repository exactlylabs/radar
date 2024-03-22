import {useContext, useRef} from "react";
import { DEFAULT_TEXT_COLOR } from "../../../../utils/colors";
import { MyTitle } from "../../../common/MyTitle";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import UserDataContext from "../../../../context/UserData";
import styles from './expected_speeds_step_page.module.css';
import ExpectedSpeedInput from "./ExpectedSpeedInput/ExpectedSpeedInput";
import ConfigContext from "../../../../context/ConfigContext";
import forwardArrowBlue from '../../../../assets/right-arrow-blue.png';

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ExpectedSpeedsStepPage = ({
  goForward,
  goBack,
  type
}) => {

  const { userData, setExpectedSpeeds } = useContext(UserDataContext);
  const config = useContext(ConfigContext);
  const inputRef = useRef(null);

  const handleGoForward = () => {
    if(!inputRef) {
      goForward();
      return;
    }
    let value = inputRef.current.value;
    if(value !== '') {
      value = Number(inputRef.current.value);
    } else {
      value = undefined;
    }
    if(type === 'download') {
      setExpectedSpeeds({ upload: userData.expectedUploadSpeed, download: value });
    } else {
      setExpectedSpeeds({ download: userData.expectedDownloadSpeed, upload: value });
    }
    goForward();
  }

  return (
    <div className={styles.screenContainer}>
      <MyTitle text={`Do you know your expected ${type} speed?`} />
      <div style={subtitleStyle}>Tell us your expected {type} speed if you're aware of it.</div>
      <div className={`${styles.inputsContainer} ${config.widgetMode ? styles.widgetInputsContainer : null}`} data-is-widget={config.widgetMode}>
        <ExpectedSpeedInput type={type}
                            initialValue={type === 'download' ? userData.expectedDownloadSpeed : userData.expectedUploadSpeed}
                            ref={inputRef}
        />
      </div>
      <button onClick={handleGoForward} className={styles.skipSpeedButton}>
        I don't know my expected speed
        <img src={forwardArrowBlue} width={10} height={10} alt={'forward arrow'}/>
      </button>
      <MyStepSwitcher goForward={handleGoForward} goBack={goBack} />
    </div>
  );
}

export default ExpectedSpeedsStepPage;