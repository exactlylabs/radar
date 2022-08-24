import DownloadIcon from "../../assets/small-download-icon.png";
import UploadIcon from "../../assets/small-upload-icon.png";
import LossIcon from "../../assets/ping-icon.png";
import LatencyIcon from "../../assets/latency-icon.png";
import {
  DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR,
  WHITE
} from "../../utils/colors";

const historicalValuesTableRowStyle = {
  width: '100%',
  height: 45,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  borderRadius: 8,
}

const commonRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  fontSize: 14,
  color: DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
}

// 7 20 12 12 12 12 15
const networkTypeColumStyle = {
  ...commonRowStyle,
  width: '7%',
  height: '100%'
}

const dateTimeColumnStyle = {
  ...commonRowStyle,
  width: '20%',
}

const locationColumnStyle = {
  ...commonRowStyle,
  width: '17%'
}

const columnWithIconStyle = {
  ...commonRowStyle,
  width: '14%'
}

const iconStyle = {
  marginRight: 5
}

const textStyle = {
  color: '#6d6a94'
}

const MyHistoricalValuesTableRow = ({
  measurement,
  isEven
}) => {

  return (
    <div style={{...historicalValuesTableRowStyle, backgroundColor: isEven ? HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR : WHITE}}>
      <div style={networkTypeColumStyle}>{measurement.network_type}</div>
      <div style={dateTimeColumnStyle}>{measurement.timestamp}</div>
      <div style={columnWithIconStyle}>
        {measurement.download_avg}
      </div>
      <div style={columnWithIconStyle}>
        {measurement.upload_avg}
      </div>
      <div style={columnWithIconStyle}>
        {measurement.loss}
      </div>
      <div style={columnWithIconStyle}>
        {measurement.latency}
      </div>
      <div style={locationColumnStyle}>{measurement.address}</div>
    </div>
  )
}

export default MyHistoricalValuesTableRow;