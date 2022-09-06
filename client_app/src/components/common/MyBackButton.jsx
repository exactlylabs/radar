import {
  DEFAULT_GRAY_BUTTON_BACKGROUND_COLOR,
  DEFAULT_GRAY_BUTTON_TEXT_COLOR,
} from '../../utils/colors';
import {defaultButtonStyle} from "./MyButton";

const backButtonStyle = {
  ...defaultButtonStyle,
  backgroundColor: DEFAULT_GRAY_BUTTON_BACKGROUND_COLOR,
  color: DEFAULT_GRAY_BUTTON_TEXT_COLOR,
  paddingTop: 14,
  paddingBottom: 14,
};

export const MyBackButton = ({ text, onClick, disabled, icon, iconFirst, fullWidth }) => {
  return iconFirst ?
    <button style={backButtonStyle} className={'bold secondary-button--hoverable'} onClick={onClick} disabled={disabled}>
      {icon}
      {text}
    </button> :
    <button style={backButtonStyle} className={'bold secondary-button--hoverable'} onClick={onClick} disabled={disabled}>
      {text}
      {icon}
    </button>
};
