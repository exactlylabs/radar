import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/loss-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import {DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";

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
  color: DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
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
  width: '21%',
  justifyContent: 'flex-start',
}

const columnWithIconStyle = {
  ...commonHeaderStyle,
  width: '13%',
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
  width: '14%',
}

const iconStyle = {
  marginRight: 5
}

const textStyle = {
  color: '#6d6a94'
}

const MyHistoricalValuesTableHeader = ({

}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getNetworkTypeColumnStyle = () => ({...commonHeaderStyle, height: '100%', width: '7%'});

  const getDateTimeColumnStyle = () => {
    let style = dateTimeColumnStyle;
    if(isSmallSizeScreen) style = smallDateTimeColumnStyle;
    if(isMediumSizeScreen) style = midDateTimeColumnStyle;
    return style;
  }

  const getDownUpColumnStyle = () => {
    let style = columnWithIconStyle;
    if(isSmallSizeScreen) style = smallColumnWithIconStyle;
    if(isMediumSizeScreen) style = midColumnWithIconStyle;
    return style;
  }

  const getLatencyLossColumnStyle = () => isMediumSizeScreen ? midColumnWithIconStyle : columnWithIconNarrowStyle;

  return (
    <div className={'bold'} style={historicalValuesTableHeaderStyle}>
      <div style={getNetworkTypeColumnStyle()}></div>
      <div style={getDateTimeColumnStyle()}>Date/Time</div>
      <div style={getDownUpColumnStyle()}>
        <img src={DownloadIcon} height={16} width={16} alt={'download-icon'} style={iconStyle}/>
        <div style={textStyle}>{isSmallSizeScreen || isMediumSizeScreen ? 'Mbps' : 'Download'}</div>
      </div>
      <div style={getDownUpColumnStyle()}>
        <img src={UploadIcon} height={16} width={16} alt={'upload-icon'} style={iconStyle}/>
        <div style={textStyle}>{isSmallSizeScreen || isMediumSizeScreen ? 'Mbps' : 'Upload'}</div>
      </div>
      {
        !isSmallSizeScreen &&
        <div style={getLatencyLossColumnStyle()}>
          <img src={LatencyIcon} height={16} width={16} alt={'latency-icon'} style={iconStyle}/>
          <div style={textStyle}>{ isMediumSizeScreen ? 'ms' : 'Latency' }</div>
        </div>
      }
      {
        !isSmallSizeScreen &&
        <div style={getLatencyLossColumnStyle()}>
          <img src={LossIcon} height={16} width={16} alt={'loss-icon'} style={iconStyle}/>
          <div style={textStyle}>{isMediumSizeScreen ? '%' : 'Loss'}</div>
        </div>
      }
      { !isSmallSizeScreen && !isMediumSizeScreen && <div style={{width: '4%'}}></div> }
      { !isSmallSizeScreen && !isMediumSizeScreen && <div style={locationColumnStyle}>Location</div> }
      { (isSmallSizeScreen || isMediumSizeScreen) && <div style={{width: '11%'}}></div> }
    </div>
  )
}

export default MyHistoricalValuesTableHeader;