import {MyBackButton} from "../../common/MyBackButton";
import {MyForwardButton} from "../../common/MyForwardButton";
import iconLeftArrow from "../../../assets/icons-left-arrow.png";
import iconRightArrow from "../../../assets/right-arrow-white.png";
import {useContext} from "react";
import ConfigContext from "../../../context/ConfigContext";

const stepSwitcherStyle = {
  width: '20%',
  minWidth: 300,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 70px',
}

const widgetStepSwitcherStyle = {
  ...stepSwitcherStyle,
  margin: '0 auto 16px'
}

const doubleButtonStepSwitcherStyle = {
  ...stepSwitcherStyle,
  justifyContent: 'space-between',
  gap: '1rem'
}

const widgetDoubleButtonStepSwitcherStyle = {
  ...widgetStepSwitcherStyle,
  justifyContent: 'space-between',
  gap: '1rem'
}

const arrowIconStyle = {
  width: '14px',
  height: '14px'
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

  const config = useContext(ConfigContext);

  const getStyle = () => {
    if(goBack && goForward) return config.widgetMode ? widgetDoubleButtonStepSwitcherStyle : doubleButtonStepSwitcherStyle;
    else return config.widgetMode ? widgetStepSwitcherStyle : stepSwitcherStyle;
  }

  return (
    <div style={getStyle()}>
      {
        goBack &&
        <MyBackButton text={backText ?? 'Go back'} icon={<img src={iconLeftArrow} alt={'go back arrow icon'} style={arrowIconStyle}/>} iconFirst onClick={goBack} disabled={backDisabled}/>
      }
      {
        goForward &&
        <MyForwardButton text={forwardText ?? 'Continue'}
                         icon={noForwardIcon ? null : <img src={iconRightArrow} alt={'go forward arrow icon'} style={arrowIconStyle}/>}
                         onClick={shouldExecuteAlt ? altForward : goForward}
                         disabled={forwardDisabled}
        />
      }
    </div>
  )
}

export default MyStepSwitcher;