import {
  DEFAULT_ERROR_SNACKBAR_BACKGROUND_COLOR,
  DEFAULT_ERROR_SNACKBAR_FONT_COLOR,
  DEFAULT_WARNING_SNACKBAR_BACKGROUND_COLOR,
  DEFAULT_WARNING_SNACKBAR_FONT_COLOR
} from "../../utils/colors";

const commonStyle = {
  width: '80%',
  maxWidth: 375,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 15,
  paddingRight: 15,
  margin: '30px auto',
  borderRadius: 8,
  fontSize: 15,
}

const errorStyle = {
  ...commonStyle,
  backgroundColor: DEFAULT_ERROR_SNACKBAR_BACKGROUND_COLOR,
  color: DEFAULT_ERROR_SNACKBAR_FONT_COLOR
}

const warningStyle = {
  ...commonStyle,
  backgroundColor: DEFAULT_WARNING_SNACKBAR_BACKGROUND_COLOR,
  color: DEFAULT_WARNING_SNACKBAR_FONT_COLOR
}

const MyMessageSnackbar = ({
  message,
  type
}) => {

  const getStyleBasedOnType = () => {
    if(type === 'error') {
      return errorStyle;
    } else if(type === 'warning') {
      return warningStyle;
    }
  }

  return (
    <div style={getStyleBasedOnType()}>
      {message}
    </div>
  )
}

export default MyMessageSnackbar;