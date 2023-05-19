import {ArrowBack, ArrowForward} from "@mui/icons-material";
import {MyBackButton} from "../../common/MyBackButton";
import {MyForwardButton} from "../../common/MyForwardButton";
import iconLeftArrow from "../../../assets/icons-left-arrow.png";

const stepSwitcherStyle = {
  width: '20%',
  minWidth: 300,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 70px',
}

const doubleButtonStepSwitcherStyle = {
  ...stepSwitcherStyle,
  justifyContent: 'space-between',
}

const arrowIconStyle = {
  width: '14px',
  height: '14px',
  marginRight: '15px',
  marginLeft: '-4px'
}

const MyStepSwitcher = ({
  goForward,
  goBack,
  forwardDisabled,
  backDisabled,
  shouldExecuteAlt,
  altForward,
  forwardText,
  backText,
  noForwardIcon
}) => {

  const getStyle = () => goBack && goForward ? doubleButtonStepSwitcherStyle : stepSwitcherStyle;

  return (
    <div style={getStyle()}>
      {
        goBack &&
        <MyBackButton text={backText ?? 'Go back'} icon={<img src={iconLeftArrow} alt={'go back arrow icon'} style={arrowIconStyle}/>} iconFirst onClick={goBack} disabled={backDisabled}/>
      }
      {
        goForward &&
        <MyForwardButton text={forwardText ?? 'Continue'}
                         icon={noForwardIcon ? null : <ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                         onClick={shouldExecuteAlt ? altForward : goForward}
                         disabled={forwardDisabled}
        />
      }
    </div>
  )
}

export default MyStepSwitcher;