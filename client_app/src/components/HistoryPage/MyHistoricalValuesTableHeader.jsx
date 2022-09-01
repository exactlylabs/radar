import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/ping-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import {DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR} from "../../utils/colors";
import {useMobile} from "../../hooks/useMobile";
import {useSmall} from "../../hooks/useSmall";

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

const midDateTimeColumnStyle = {
  ...commonHeaderStyle,
  width: '22%',
  justifyContent: 'flex-start',
}

const smallDateTimeColumnStyle = {
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

const midColumnWithIconStyle = {
  ...commonHeaderStyle,
  width: '15%',
  justifyContent: 'flex-end',
}

const smallColumnWithIconStyle = {
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

  const isMobile = useMobile();
  const isSmall = useSmall();

  const getNetworkTypeColumnStyle = () => ({...commonHeaderStyle, height: '100%', width: '7%'});

  const getDateTimeColumnStyle = () => {
    let style = dateTimeColumnStyle;
    if(isSmall) style = smallDateTimeColumnStyle;
    if(isMobile) style = midDateTimeColumnStyle;
    return style;
  }

  const getDownUpColumnStyle = () => {
    let style = columnWithIconStyle;
    if(isSmall) style = smallColumnWithIconStyle;
    if(isMobile) style = midColumnWithIconStyle;
    return style;
  }

  const getLatencyLossColumnStyle = () => isMobile ? midColumnWithIconStyle : columnWithIconNarrowStyle;

  return (
    <div style={historicalValuesTableHeaderStyle}>
      <div style={getNetworkTypeColumnStyle()}></div>
      <div style={getDateTimeColumnStyle()}>Date/Time</div>
      <div style={getDownUpColumnStyle()}>
        <img src={DownloadIcon} height={16} width={16} alt={'download-icon'} style={iconStyle}/>
        <div style={textStyle}>{isSmall || isMobile ? 'Mbps' : 'Download'}</div>
      </div>
      <div style={getDownUpColumnStyle()}>
        <img src={UploadIcon} height={16} width={16} alt={'upload-icon'} style={iconStyle}/>
        <div style={textStyle}>{isSmall || isMobile ? 'Mbps' : 'Upload'}</div>
      </div>
      {
        !isSmall &&
        <div style={getLatencyLossColumnStyle()}>
          <img src={LatencyIcon} height={16} width={16} alt={'latency-icon'} style={iconStyle}/>
          <div style={textStyle}>{ isMobile ? 'ms' : 'Latency' }</div>
        </div>
      }
      {
        !isSmall &&
        <div style={getLatencyLossColumnStyle()}>
          <img src={LossIcon} height={16} width={16} alt={'loss-icon'} style={iconStyle}/>
          <div style={textStyle}>{isMobile ? '%' : 'Loss'}</div>
        </div>
      }
      { !isSmall && !isMobile && <div style={{width: '4%'}}></div> }
      { !isSmall && !isMobile && <div style={locationColumnStyle}>Location</div> }
      { (isSmall || isMobile) && <div style={{width: '11%'}}></div> }
    </div>
  )
}

export default MyHistoricalValuesTableHeader;