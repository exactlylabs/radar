import {DEFAULT_FILTERS_SUBTITLE_COLOR} from "../../utils/colors";

const filtersSubtitleStyle = {
  fontSize: 14,
  color: DEFAULT_FILTERS_SUBTITLE_COLOR,
  textAlign: 'left',
  marginTop: 6
}

const MyFiltersSubtitle = ({ text }) => <div style={filtersSubtitleStyle}>{text}</div>

export default MyFiltersSubtitle;