import {MyBackButton} from "../../common/MyBackButton";
import {MyForwardButton} from "../../common/MyForwardButton";
import iconLeftArrow from "../../../assets/icons-left-arrow.png";
import iconRightArrow from "../../../assets/right-arrow-white.png";
import {useContext} from "react";
import ConfigContext from "../../../context/ConfigContext";
import { useTranslation } from 'react-i18next';

const stepSwitcherStyle = {
  width: 300,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.25rem',
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
  const { t } = useTranslation();
  const config = useContext(ConfigContext);

  const getStyle = () => {
    if(goBack && goForward) return config.widgetMode ? widgetDoubleButtonStepSwitcherStyle : doubleButtonStepSwitcherStyle;
    else return config.widgetMode ? widgetStepSwitcherStyle : stepSwitcherStyle;
  }

  return (
    <div style={getStyle()}>
      {
        goBack &&
        <MyBackButton text={backText ?? t('common.buttons.goBack')} icon={<img src={iconLeftArrow} alt={t('alt.icons.goBackArrow')} style={arrowIconStyle}/>} iconFirst onClick={goBack} disabled={backDisabled}/>
      }
      {
        goForward &&
        <MyForwardButton text={forwardText ?? t('common.buttons.continue')}
                         icon={noForwardIcon ? null : <img src={iconRightArrow} alt={t('alt.icons.forwardArrow')} style={arrowIconStyle}/>}
                         onClick={shouldExecuteAlt ? altForward : goForward}
                         disabled={forwardDisabled}
        />
      }
    </div>
  )
}

export default MyStepSwitcher;