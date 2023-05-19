import {
  DEFAULT_COMPLETE_STEP_ICON_FONT_COLOR,
  DEFAULT_STEP_ICON_BACKGROUND_COLOR,
  DEFAULT_STEP_ICON_FONT_COLOR, WHITE
} from "../../../utils/colors";
import {Check} from "@mui/icons-material";

const commonIconStyle = {
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: DEFAULT_STEP_ICON_BACKGROUND_COLOR,
  color: DEFAULT_STEP_ICON_FONT_COLOR,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 13,
  fontFamily: 'MulishExtraBold'
}

const completeIconStyle = {
  ...commonIconStyle,
  color: DEFAULT_COMPLETE_STEP_ICON_FONT_COLOR,
  fontSize: 12,
}

const activeIconStyle = {
  ...commonIconStyle,
  color: WHITE,
  backgroundColor: DEFAULT_COMPLETE_STEP_ICON_FONT_COLOR,
}

const disabledIconStyle = {
 ...commonIconStyle,
}

const MyStepIcon = ({
  step,
  complete,
  active
}) => {

  const getStyle = () => {
    if(complete) return completeIconStyle;
    if(active) return activeIconStyle;
    return disabledIconStyle;
  }

  return (
    <div style={getStyle()}>
      { complete ? <Check fontSize={'inherit'}/> : step }
    </div>
  );
}

export default MyStepIcon;