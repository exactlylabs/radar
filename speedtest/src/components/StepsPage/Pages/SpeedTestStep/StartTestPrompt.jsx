import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {DEFAULT_PAGE_COLOR} from "../../../../utils/colors";

const promptStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 40,
  marginBottom: 70,
}

const textStyle = {
  width: '75%',
  maxWidth: 600,
  marginBottom: 30,
  color: DEFAULT_PAGE_COLOR
}

const StartTestPrompt = ({
  startTest
}) => {

  return (
    <div style={promptStyle}>
      <MyTitle text={`You're ready to start.`}/>
      <div style={textStyle}>For more accurate results, please make sure you are not currently making heavy use of your internet connection.</div>
      <MyForwardButton text={'Start Speed Test'} onClick={startTest}/>
    </div>
  )
}

export default StartTestPrompt;