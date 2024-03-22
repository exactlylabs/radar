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

export const MyForwardButton = ({ text, onClick, disabled, icon, iconFirst, customCss = {} }) => {

  const getStyle = () => disabled ? {...disabledForwardButtonStyle, ...customCss} : {...forwardButtonStyle, ...customCss};

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
