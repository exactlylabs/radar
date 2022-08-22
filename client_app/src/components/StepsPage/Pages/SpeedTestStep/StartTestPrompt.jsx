import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";

const promptStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 40,
}

const textStyle = {
  width: '75%',
  maxWidth: 600,
  marginBottom: 30
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