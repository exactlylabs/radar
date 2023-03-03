import {DEFAULT_TITLE_COLOR} from "../../utils/colors";

const secondaryTitleStyle = {
  fontFamily: 'MulishExtraBold',
  fontSize: 24,
  color: DEFAULT_TITLE_COLOR,
  marginBottom: 10,
  paddingTop: 20,
}

const MySecondaryModalTitle = ({ text }) => {
  return (
    <div style={secondaryTitleStyle}>
      {text}
    </div>
  )
}

export default MySecondaryModalTitle;