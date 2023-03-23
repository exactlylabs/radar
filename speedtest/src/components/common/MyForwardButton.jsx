import {defaultButtonStyle} from "./MyButton";

const forwardButtonStyle = {
  ...defaultButtonStyle,
  paddingTop: 14,
  paddingBottom: 14,
};

const disabledForwardButtonStyle = {
  ...forwardButtonStyle,
  opacity: 0.5,
}

export const MyForwardButton = ({ text, onClick, disabled, icon, iconFirst }) => {

  const getStyle = () => disabled ? disabledForwardButtonStyle : forwardButtonStyle;

  return iconFirst ?
    <button style={getStyle()}
            className={'speedtest--bold speedtest--blue-button--hoverable'}
            onClick={onClick}
            disabled={disabled}
    >
      {icon}
      {text}
    </button> :
    <button style={getStyle()}
            className={'speedtest--bold speedtest--blue-button--hoverable'}
            onClick={onClick}
            disabled={disabled}
    >
      {text}
      {icon}
    </button>
};
