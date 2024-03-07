import {
  DEFAULT_GRAY_BUTTON_BACKGROUND_COLOR,
  DEFAULT_GRAY_BUTTON_TEXT_COLOR,
  WIDGET_SECONDARY_BUTTON_BG_COLOR,
  WIDGET_SECONDARY_BUTTON_BOX_SHADOW,
  WIDGET_SECONDARY_BUTTON_COLOR,
} from '../../utils/colors';
import {defaultButtonStyle} from "./MyButton";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";

const backButtonStyle = {
  ...defaultButtonStyle,
  backgroundColor: DEFAULT_GRAY_BUTTON_BACKGROUND_COLOR,
  color: DEFAULT_GRAY_BUTTON_TEXT_COLOR,
  paddingTop: 14,
  paddingBottom: 14,
};

const widgetBackButtonStyle = {
  ...backButtonStyle,
  backgroundColor: WIDGET_SECONDARY_BUTTON_BG_COLOR,
  color: WIDGET_SECONDARY_BUTTON_COLOR,
  boxShadow: `0 4px 15px -2px ${WIDGET_SECONDARY_BUTTON_BOX_SHADOW}`

}

export const MyBackButton = ({ text, onClick, disabled, icon, iconFirst, fullWidth }) => {

  const { widgetMode } = useContext(ConfigContext);

  return iconFirst ?
    <button style={widgetMode ? widgetBackButtonStyle : backButtonStyle} className={'speedtest--bold speedtest--secondary-button--hoverable'} onClick={onClick} disabled={disabled}>
      {icon}
      {text}
    </button> :
    <button style={widgetMode ? widgetBackButtonStyle : backButtonStyle} className={'speedtest--bold speedtest--secondary-button--hoverable'} onClick={onClick} disabled={disabled}>
      {text}
      {icon}
    </button>
};
