import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {DEFAULT_PAGE_COLOR, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {MyButton} from "../../../common/MyButton";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import {useContext} from "react";
import ConfigContext from "../../../../context/ConfigContext";
import SpeedTestContext from "../../../../context/SpeedTestContext";

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

  const config = useContext(ConfigContext);

  return (
    <div style={config.widgetMode ? widgetPromptStyle : promptStyle}>
      <MyTitle text={`You're ready to start.`}/>
      <div style={textStyle}>For more accurate results, please make sure you are not currently making heavy use of your internet connection.</div>
      <MyStepSwitcher goForward={startTest}
                      goBack={goBack}
                      forwardText={'Start Speed Test'}
                      noForwardIcon

      />
    </div>
  )
}

export default StartTestPrompt;