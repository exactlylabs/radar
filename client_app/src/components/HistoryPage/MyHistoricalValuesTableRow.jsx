import {
  DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_DARK_VALUES_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR,
  TRANSPARENT,
} from "../../utils/colors";
import {types} from "../../utils/networkTypes";
import {prettyPrintDate} from "../../utils/dates";
import InfoIcon from '../../assets/info-icon.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";

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
  fontSize: 15,
  color: DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
}

const networkTypeColumStyle = {
  ...commonRowStyle,
  width: '7%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const mobileNetworkTypeColumnStyle = {
  ...networkTypeColumStyle,
  width: '12%',
}

const dateTimeColumnStyle = {
  ...commonRowStyle,
  width: '18%',
  justifyContent: 'flex-start',
}

const midDateTimeColumnStyle = {
  ...dateTimeColumnStyle,
  width: '22%',
  textAlign: 'left',
}

const smallDateTimeColumnStyle = {
  ...dateTimeColumnStyle,
  width: '28%',
  textAlign: 'left'
}

const locationColumnStyle = {
  ...commonRowStyle,
  width: '16%',
  justifyContent: 'flex-start',
}

const ellipsisStyle = {
  maxWidth: '90%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const columnWithIconStyle = {
  ...commonRowStyle,
  width: '13.5%',
  color: HISTORICAL_VALUES_TABLE_ROW_DARK_VALUES_COLOR,
  justifyContent: 'flex-end',
}

const mobileColumnWithIconStyle = {
  ...columnWithIconStyle,
  width: '24%',
}

const midLatencyLossStyle = {
  ...columnWithIconStyle,
  width: '15%',
}

const columnWithIconNarrowStyle = {
  ...columnWithIconStyle,
  width: '14%',
}

const infoIconColumnStyle = {
  ...networkTypeColumStyle,
  width: '11%',
  cursor: 'pointer',
}

const smallInfoIconColumnStyle = {
  ...infoIconColumnStyle,
  width: '15%',
}

const MyHistoricalValuesTableRow = ({
  measurement,
  isEven,
  openMeasurementInfoModal
}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getNetworkTypeIcon = () => {
    const networkType = types.find(type => type.text === measurement.networkType);
    return networkType.iconSelectedSrc;
  }

  const getMbpsText = possibleValue => {
    if(!possibleValue) return '-';
    return isMediumSizeScreen || isSmallSizeScreen ? possibleValue.toFixed(2) : `${measurement.download.toFixed(2)} Mbps`;
  }

  const getMsText = possibleValue => {
    if(possibleValue === null) return '-';
    return isMediumSizeScreen || isSmallSizeScreen ? measurement.latency.toFixed(0) : `${measurement.latency.toFixed(0)} ms`;
  }

  const getPercentageText = possibleValue => {
    if(possibleValue === null) return '-';
    return isMediumSizeScreen || isSmallSizeScreen ? measurement.loss.toFixed(2) : `${measurement.loss.toFixed(2)} %`;
  }

  const getDownUpStyle = () => {
    let style = columnWithIconStyle;
    if(isSmallSizeScreen) return {...style, width: '24%'};
    if(isMediumSizeScreen) return {...style, width: '15%'}
    return style;
  }

  const getDateTimeStyle = () => {
    let style = dateTimeColumnStyle;
    if(isSmallSizeScreen) style = smallDateTimeColumnStyle;
    if(isMediumSizeScreen) style = midDateTimeColumnStyle;
    return style;
  }

  const getLatencyLossStyle = () => isMediumSizeScreen ? midLatencyLossStyle : columnWithIconNarrowStyle;

  const getInfoIconStyle = () => isSmallSizeScreen ? smallInfoIconColumnStyle : infoIconColumnStyle;

  const openInfoModal = () => openMeasurementInfoModal(measurement);

  return (
    <div style={{...historicalValuesTableRowStyle, backgroundColor: isEven ? HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR : TRANSPARENT}}>
      <div style={networkTypeColumStyle}>
        {measurement.networkType ?
          <img src={getNetworkTypeIcon()} width={16} height={16} alt={'network-type-icon'}/> :
          null
        }
      </div>
      <div style={getDateTimeStyle()}>{prettyPrintDate(measurement.timestamp)}</div>
      <div style={getDownUpStyle()}>
        {getMbpsText(measurement.download)}
      </div>
      <div style={getDownUpStyle()}>
        {getMbpsText(measurement.upload)}
      </div>
      {
        !isSmallSizeScreen &&
        <div style={getLatencyLossStyle()}>
          {getMsText(measurement.latency)}
        </div>
      }
      {
        !isSmallSizeScreen &&
        <div style={getLatencyLossStyle()}>
          {getPercentageText(measurement.loss)}
        </div>
      }
      {
        !isSmallSizeScreen && !isMediumSizeScreen && <div style={{width: '4%'}}></div>
      }
      {
        (!isSmallSizeScreen && !isMediumSizeScreen) &&
        <div style={locationColumnStyle}>
          <p style={ellipsisStyle}>{`${measurement.city}, ${measurement.state}`}</p>
        </div>
      }
      {
        (isSmallSizeScreen || isMediumSizeScreen) &&
        <div style={getInfoIconStyle()}>
          <img src={InfoIcon} width={22} height={22} alt={'info-icon'} onClick={openInfoModal}/>
        </div>
      }
    </div>
  )
}

export default MyHistoricalValuesTableRow;