import {DEFAULT_TITLE_COLOR} from "../../utils/colors";

const titleStyle = {
  fontFamily: 'MulishExtraBold',
  fontSize: 26,
  color: DEFAULT_TITLE_COLOR,
  marginBottom: 10,
}

export const MyTitle = ({ text }) => <p style={titleStyle}>{text}</p>;
