import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/ping-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import {DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR} from "../../utils/colors";
import {useScreenSize} from "../../hooks/useScreenSize";

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

const mobileNetworkTypeColumnStyle = {
  ...commonHeaderStyle,
  width: '12%',
  height: '100%'
}

const dateTimeColumnStyle = {
  ...commonHeaderStyle,
  width: '18%',
  justifyContent: 'flex-start',
}

const mobileDateTimeColumnStyle = {
  ...commonHeaderStyle,
  width: '28%',
  justifyContent: 'flex-start',
}

const locationColumnStyle = {
  ...commonHeaderStyle,
  width: '20%',
  justifyContent: 'flex-start',
}

const columnWithIconStyle = {
  ...commonHeaderStyle,
  width: '13.5%',
  justifyContent: 'flex-end',
}

const mobileColumnWithIconStyle = {
  ...commonHeaderStyle,
  width: '25%',
  justifyContent: 'flex-end',
}

const columnWithIconNarrowStyle = {
  ...columnWithIconStyle,
  width: '12%',
}

const iconStyle = {
  marginRight: 5
}

const textStyle = {
  color: '#6d6a94'
}

const MyHistoricalValuesTableHeader = ({

}) => {

  const isMobile = useScreenSize();

  return (
    <div style={historicalValuesTableHeaderStyle}>
      <div style={isMobile ? mobileNetworkTypeColumnStyle : networkTypeColumStyle}></div>
      <div style={isMobile ? mobileDateTimeColumnStyle : dateTimeColumnStyle}>Date/Time</div>
      <div style={isMobile ? mobileColumnWithIconStyle : columnWithIconStyle}>
        <img src={DownloadIcon} height={16} width={16} alt={'download-icon'} style={iconStyle}/>
        <div style={textStyle}>{isMobile ? 'Mbps' : 'Download'}</div>
      </div>
      <div style={isMobile ? mobileColumnWithIconStyle : columnWithIconStyle}>
        <img src={UploadIcon} height={16} width={16} alt={'upload-icon'} style={iconStyle}/>
        <div style={textStyle}>{isMobile ? 'Mbps' : 'Upload'}</div>
      </div>
      {
        !isMobile &&
        <div style={columnWithIconNarrowStyle}>
          <img src={LossIcon} height={16} width={16} alt={'loss-icon'} style={iconStyle}/>
          <div style={textStyle}>Loss</div>
        </div>
      }
      {
        !isMobile &&
        <div style={columnWithIconNarrowStyle}>
          <img src={LatencyIcon} height={16} width={16} alt={'latency-icon'} style={iconStyle}/>
          <div style={textStyle}>Latency</div>
        </div>
      }
      { !isMobile && <div style={{width: '4%'}}></div> }
      { !isMobile && <div style={locationColumnStyle}>Location</div> }
      { isMobile && <div style={{width: '10%'}}></div> }
    </div>
  )
}

export default MyHistoricalValuesTableHeader;