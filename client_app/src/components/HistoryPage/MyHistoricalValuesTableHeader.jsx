import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/ping-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import {DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR} from "../../utils/colors";

const historicalValuesTableHeaderStyle = {
  width: '100%',
  height: 45,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const commonHeaderStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  fontSize: 14,
  fontWeight: 'bold',
  color: DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
}

// 7 20 12 12 12 12 15
const networkTypeColumStyle = {
  ...commonHeaderStyle,
  width: '7%',
  height: '100%'
}

const dateTimeColumnStyle = {
  ...commonHeaderStyle,
  width: '20%',
}

const locationColumnStyle = {
  ...commonHeaderStyle,
  width: '17%'
}

const columnWithIconStyle = {
  ...commonHeaderStyle,
  width: '14%'
}

const iconStyle = {
  marginRight: 5
}

const textStyle = {
  color: '#6d6a94'
}

const MyHistoricalValuesTableHeader = ({

}) => {

  return (
    <div style={historicalValuesTableHeaderStyle}>
      <div style={networkTypeColumStyle}></div>
      <div style={dateTimeColumnStyle}>Date/Time</div>
      <div style={columnWithIconStyle}>
        <img src={DownloadIcon} height={16} width={16} alt={'download-icon'} style={iconStyle}/>
        <div style={textStyle}>Download</div>
      </div>
      <div style={columnWithIconStyle}>
        <img src={UploadIcon} height={16} width={16} alt={'upload-icon'} style={iconStyle}/>
        <div style={textStyle}>Upload</div>
      </div>
      <div style={columnWithIconStyle}>
        <img src={LossIcon} height={16} width={16} alt={'loss-icon'} style={iconStyle}/>
        <div style={textStyle}>Loss</div>
      </div>
      <div style={columnWithIconStyle}>
        <img src={LatencyIcon} height={16} width={16} alt={'latency-icon'} style={iconStyle}/>
        <div style={textStyle}>Latency</div>
      </div>
      <div style={locationColumnStyle}>Location</div>
    </div>
  )
}

export default MyHistoricalValuesTableHeader;