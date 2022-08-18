import {MyButton} from "../../common/MyButton";
import {ArrowBack, ArrowForward} from "@mui/icons-material";
import {MyBackButton} from "../../common/MyBackButton";
import {MyForwardButton} from "../../common/MyForwardButton";

const stepSwitcherStyle = {
  width: '20%',
  minWidth: 300,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
}

const doubleButtonStepSwitcherStyle = {
  ...stepSwitcherStyle,
  justifyContent: 'space-between',
}

const MyStepSwitcher = ({
  goForward,
  goBack,
  forwardDisabled,
  backDisabled
}) => {

  return (
    <div style={goBack && goForward ? doubleButtonStepSwitcherStyle : stepSwitcherStyle}>
      {
        goBack &&
        <MyBackButton text={'Go back'} icon={<ArrowBack style={{marginRight: 15}}/>} iconFirst onClick={goBack} disabled={backDisabled}/>
      }
      {
        goForward &&
        <MyForwardButton text={'Continue'} icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>} onClick={goForward} disabled={forwardDisabled}/>
      }
    </div>
  )
}

export default MyStepSwitcher;