import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {DEFAULT_PAGE_COLOR} from "../../../../utils/colors";
import {MyButton} from "../../../common/MyButton";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";

const promptStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 40,
}

const textStyle = {
  width: '75%',
  maxWidth: '490px',
  marginBottom: 30,
  color: DEFAULT_PAGE_COLOR,
  lineHeight: '25px'
}

const StartTestPrompt = ({
  startTest,
  goBack
}) => {

  return (
    <div style={promptStyle}>
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