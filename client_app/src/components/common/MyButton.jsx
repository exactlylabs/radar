import { DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR, DEFAULT_BUTTON_BOX_SHADOW_RGBA } from '../../utils/colors';

const defaultButtonStyle = {
  backgroundColor: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  color: 'white',
  borderRadius: 19,
  paddingRight: 20,
  paddingLeft: 20,
  paddingTop: 10,
  paddingBottom: 10,
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

export const MyButton = ({ text, onClick, disabled }) => {
  return (
    <button style={{ ...defaultButtonStyle }} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};
