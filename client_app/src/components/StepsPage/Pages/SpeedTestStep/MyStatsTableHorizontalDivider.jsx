import {DEFAULT_STATS_TABLE_VERTICAL_DIVIDER_COLOR} from "../../../../utils/colors";

const dividerStyle = {
  width: '100%',
  height: 1,
  backgroundColor: DEFAULT_STATS_TABLE_VERTICAL_DIVIDER_COLOR,
  margin: '0 12px',
}

const MyStatsTableHorizontalDivider = () => <div style={dividerStyle}></div>;

export default MyStatsTableHorizontalDivider;