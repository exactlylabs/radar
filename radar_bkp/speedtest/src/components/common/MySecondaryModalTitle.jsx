import {DEFAULT_TITLE_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const secondaryTitleStyle = {
  fontFamily: 'MulishExtraBold',
  fontSize: 24,
  color: DEFAULT_TITLE_COLOR,
  marginBottom: 10,
  paddingTop: 20,
}

const xsSecondaryTitleStyle = {
  ...secondaryTitleStyle,
  fontSize: 16,
  paddingTop: 15,
  marginBottom: 5
}

const MySecondaryModalTitle = ({ text }) => {

  const {isExtraSmallSizeScreen} = useViewportSizes();

  return (
    <div style={isExtraSmallSizeScreen ? xsSecondaryTitleStyle : secondaryTitleStyle}>
      {text}
    </div>
  )
}

export default MySecondaryModalTitle;