import {useContext, useRef} from "react";
import { DEFAULT_TEXT_COLOR } from "../../../../utils/colors";
import { MyTitle } from "../../../common/MyTitle";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import UserDataContext from "../../../../context/UserData";
import styles from './expected_speeds_step_page.module.css';
import ExpectedSpeedInput from "./ExpectedSpeedInput/ExpectedSpeedInput";
import ConfigContext from "../../../../context/ConfigContext";
import forwardArrowBlue from '../../../../assets/right-arrow-blue.png';
import { useTranslation } from 'react-i18next';

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const ExpectedSpeedsStepPage = ({
  goForward,
  goBack,
  type
}) => {
  const { t } = useTranslation();
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

  const handleSkip = (e) => {
    if(e) e.preventDefault();
    if(type === 'download') {
      setExpectedSpeeds({ upload: userData.expectedUploadSpeed, download: undefined });
    } else {
      setExpectedSpeeds({ download: userData.expectedDownloadSpeed, upload: undefined });
    }
    goForward();
  }

  return (
    <div className={styles.screenContainer}>
      <MyTitle text={t('expectedSpeeds.title', { type: t(`expectedSpeeds.input.${type}`) })} />
      <div style={subtitleStyle}>{t('expectedSpeeds.subtitle', { type: t(`expectedSpeeds.input.${type}`) })}</div>
      <div className={`${styles.inputsContainer} ${config.widgetMode ? styles.widgetInputsContainer : null}`} data-is-widget={config.widgetMode}>
        <ExpectedSpeedInput type={type}
                            initialValue={type === 'download' ? userData.expectedDownloadSpeed : userData.expectedUploadSpeed}
                            ref={inputRef}
        />
      </div>
      <button onClick={handleSkip} className={styles.skipSpeedButton}>
        {t('expectedSpeeds.button')}
        <img src={forwardArrowBlue} width={10} height={10} alt={t('alt.icons.forwardArrow')}/>
      </button>
      <MyStepSwitcher goForward={handleGoForward} goBack={goBack} />
    </div>
  );
}

export default ExpectedSpeedsStepPage;