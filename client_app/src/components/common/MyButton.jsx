import {DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR, DEFAULT_BUTTON_BOX_SHADOW_RGBA, WHITE} from '../../utils/colors';

export const defaultButtonStyle = {
  width: 'max-content',
  backgroundColor: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  color: WHITE,
  borderRadius: 24,
  paddingRight: 20,
  paddingLeft: 20,
  paddingTop: 8,
  paddingBottom: 8,
  border: 'none',
  /* offset-x | offset-y | blur-radius | spread-radius | color */
  boxShadow: `0px 4px 15px -2px ${DEFAULT_BUTTON_BOX_SHADOW_RGBA}`,
  fontSize: 16,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
};

export const MyButton = ({ text, onClick, disabled, icon, iconFirst }) => {
  return iconFirst ?
    <button style={defaultButtonStyle} onClick={onClick} disabled={disabled}>
      {icon}
      {text}
    </button> :
    <button style={defaultButtonStyle} onClick={onClick} disabled={disabled}>
      {text}
      {icon}
    </button>
};
