import {WHITE} from "../../utils/colors";

const filtersTitleStyle = {
  fontSize: 18,
  fontFamily: 'MulishExtraBold',
  color: WHITE,
  textAlign: 'left'
}

const MyFiltersTitle = ({ text }) => <div style={filtersTitleStyle}>{text}</div>

export default MyFiltersTitle;