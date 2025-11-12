import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {DEFAULT_PAGE_COLOR, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {MyButton} from "../../../common/MyButton";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import {useContext} from "react";
import ConfigContext from "../../../../context/ConfigContext";
import SpeedTestContext from "../../../../context/SpeedTestContext";
import { useTranslation } from 'react-i18next';

const promptStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 40,
}

const widgetPromptStyle = {
  ...promptStyle,
  marginTop: 0
}

const textStyle = {
  width: '75%',
  maxWidth: '490px',
  marginBottom: 30,
  color: DEFAULT_TEXT_COLOR,
  lineHeight: '25px'
}

const StartTestPrompt = ({
  startTest,
  goBack
}) => {
  const { t } = useTranslation();
  const config = useContext(ConfigContext);

  return (
    <div style={config.widgetMode ? widgetPromptStyle : promptStyle}>
      <MyTitle text={t('speedTest.ready.title')}/>
      <div style={textStyle}>{t('speedTest.ready.subtitle')}</div>
      <MyStepSwitcher goForward={startTest}
                      goBack={goBack}
                      forwardText={t('speedTest.ready.button')}
                      noForwardIcon

      />
    </div>
  )
}

export default StartTestPrompt;