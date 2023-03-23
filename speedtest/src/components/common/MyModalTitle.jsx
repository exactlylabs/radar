import {DEFAULT_TITLE_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const titleStyle = {
  fontFamily: 'MulishExtraBold',
  fontSize: 24,
  color: DEFAULT_TITLE_COLOR,
  marginBottom: 10,
  paddingTop: 30,
}

const xsTitleStyle = {
  ...titleStyle,
  fontSize: 16,
  paddingTop: 15,
  marginBottom: 5
}

export const MyModalTitle = ({ text }) => {

  const {isExtraSmallSizeScreen} = useViewportSizes();

  return (
    <div style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>
      {text}
    </div>
  );
};