import {DEFAULT_GRAY_BUTTON_TEXT_COLOR, FLOATING_MESSAGE_BOX, FLOATING_MESSAGE_BOX_SHADOW} from "../../utils/colors";

const floatingMessageBoxStyle = {
  width: 'max-content',
  height: '15px',
  backgroundColor: FLOATING_MESSAGE_BOX,
  borderRadius: '6px',
  position: 'absolute',
  left: '27px',
  bottom: '20px',
  backdropFilter: 'blur(3px)',
  boxShadow: `0 1px 6px -3px ${FLOATING_MESSAGE_BOX_SHADOW}`,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  zIndex: 1000,
  padding: '12px 15px'
}

const textStyle = {
  fontSize: '15px',
  color: DEFAULT_GRAY_BUTTON_TEXT_COLOR,
  marginLeft: '10px',
}

const FloatingMessageBox = ({ icon, text }) => {
  return (
    <div style={floatingMessageBoxStyle}>
      { icon }
      { !!text && <p style={textStyle}>{text}</p> }
    </div>
  )
}

export default FloatingMessageBox;