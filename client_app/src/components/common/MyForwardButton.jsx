import {
  DEFAULT_GRAY_BUTTON_BACKGROUND_COLOR,
  DEFAULT_BUTTON_BOX_SHADOW_RGBA,
  DEFAULT_GRAY_BUTTON_TEXT_COLOR, WHITE, DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR
} from '../../utils/colors';
import {defaultButtonStyle} from "./MyButton";

const forwardButtonStyle = {
  ...defaultButtonStyle,
  backgroundColor: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  color: WHITE,
  paddingTop: 14,
  paddingBottom: 14,
};

const disabledForwardButtonStyle = {
  ...forwardButtonStyle,
  opacity: 0.5,
}

export const MyForwardButton = ({ text, onClick, disabled, icon, iconFirst, fullWidth }) => {

  const getStyle = () => {
    let baseStyle = disabled ? disabledForwardButtonStyle : forwardButtonStyle;
    return { ...baseStyle, width: fullWidth ? '100%' : baseStyle.width };
  }

  return iconFirst ?
    <button style={getStyle()}
            onClick={onClick}
            disabled={disabled}
    >
      {icon}
      {text}
    </button> :
    <button style={getStyle()}
            onClick={onClick}
            disabled={disabled}
    >
      {text}
      {icon}
    </button>
};
