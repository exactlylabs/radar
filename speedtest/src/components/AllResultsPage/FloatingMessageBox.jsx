import {DEFAULT_GRAY_BUTTON_TEXT_COLOR, FLOATING_MESSAGE_BOX, FLOATING_MESSAGE_BOX_SHADOW} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const floatingMessageBoxStyle = {
  width: '45%',
  maxWidth: '560px',
  backgroundColor: FLOATING_MESSAGE_BOX,
  borderRadius: '6px',
  position: 'absolute',
  left: '27px',
  bottom: '20px',
  backdropFilter: 'blur(3px)',
  boxShadow: `0 1px 6px -3px ${FLOATING_MESSAGE_BOX_SHADOW}`,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  zIndex: 1000,
  padding: '12px 15px'
}

const floatingSpinnerBoxStyle = {
  ...floatingMessageBoxStyle,
  width: 'max-content',
}

const smallFloatingMessageBoxStyle = {
  ...floatingMessageBoxStyle,
  width: undefined,
  maxWidth: '225px',
  bottom: '165px',
  left: '15px',
  height: undefined,
  alignItems: 'flex-start',
  padding: '10px'
}

const smallFloatingSpinnerBoxStyle = {
  ...smallFloatingMessageBoxStyle,
  width: 'max-content',
}

const smallFloatingMessageBoxAtBottomStyle = {
  ...smallFloatingMessageBoxStyle,
  bottom: '25px',
}

const smallFloatingSpinnerBoxAtBottomStyle = {
  ...smallFloatingMessageBoxAtBottomStyle,
  width: 'max-content'
}

const textStyle = {
  fontSize: '15px',
  color: DEFAULT_GRAY_BUTTON_TEXT_COLOR,
  marginLeft: '10px',
}

const smallTextStyle = {
  fontSize: '15px',
  color: DEFAULT_GRAY_BUTTON_TEXT_COLOR,
  marginLeft: '10px',
  width: 'calc(100% - 35px)',
  textAlign: 'left',
}

const FloatingMessageBox = ({ icon, text, isBoxOpen }) => {

  const {isSmallSizeScreen, isMediumSizeScreen, isLargeSizeScreen} = useViewportSizes();
  const isSmall = isSmallSizeScreen || isMediumSizeScreen;

  const getContainerStyle = () => {
    if(isSmall && !!text) {
      if (isBoxOpen) return smallFloatingMessageBoxStyle;
      else return smallFloatingMessageBoxAtBottomStyle;
    } else if(isSmall && !text) {
      if(isBoxOpen) return smallFloatingSpinnerBoxStyle;
      else return smallFloatingSpinnerBoxAtBottomStyle;
    } else {
      if(!text) return floatingSpinnerBoxStyle;
      return floatingMessageBoxStyle;
    }
  }

  return (
    <div style={ getContainerStyle() }>
      { icon }
      { !!text && <p style={isSmall ? smallTextStyle : textStyle}>{text}</p> }
    </div>
  )
}

export default FloatingMessageBox;