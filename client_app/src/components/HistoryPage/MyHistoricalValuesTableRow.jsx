import {
  DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_DARK_VALUES_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR,
  TRANSPARENT,
} from "../../utils/colors";
import {types} from "../../utils/networkTypes";
import {prettyPrintDate} from "../../utils/dates";
import {useScreenSize} from "../../hooks/useScreenSize";
import InfoIcon from '../../assets/info-icon.png';

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

const mobileDateTimeColumnStyle = {
  ...dateTimeColumnStyle,
  width: '28%',
  textAlign: 'left'
}

const locationColumnStyle = {
  ...commonRowStyle,
  width: '20%',
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

const columnWithIconNarrowStyle = {
  ...columnWithIconStyle,
  width: '12%',
}

const infoIconColumnStyle = {
  ...networkTypeColumStyle,
  width: '12%',
  cursor: 'pointer',
}

const MyHistoricalValuesTableRow = ({
  measurement,
  isEven,
  openMeasurementInfoModal
}) => {

  const isMobile = useScreenSize();

  const getNetworkTypeIcon = () => {
    const networkType = types.find(type => type.text === measurement.networkType);
    return networkType.iconSelectedSrc;
  }

  const getMbpsText = possibleValue => {
    if(!possibleValue) return '-';
    return isMobile ? possibleValue.toFixed(2) : `${measurement.download.toFixed(2)} Mbps`;
  }

  const openInfoModal = () => openMeasurementInfoModal(measurement);

  return (
    <div style={{...historicalValuesTableRowStyle, backgroundColor: isEven ? HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR : TRANSPARENT}}>
      <div style={isMobile ? mobileNetworkTypeColumnStyle : networkTypeColumStyle}>
        {measurement.networkType ?
          <img src={getNetworkTypeIcon()} width={16} height={16} alt={'network-type-icon'}/> :
          null
        }
      </div>
      <div style={isMobile ? mobileDateTimeColumnStyle : dateTimeColumnStyle}>{prettyPrintDate(measurement.timestamp)}</div>
      <div style={isMobile ? mobileColumnWithIconStyle : columnWithIconStyle}>
        {getMbpsText(measurement.download)}
      </div>
      <div style={isMobile ? mobileColumnWithIconStyle : columnWithIconStyle}>
        {getMbpsText(measurement.upload)}
      </div>
      {
        !isMobile &&
        <div style={columnWithIconNarrowStyle}>
        {measurement.loss !== null ? `${measurement.loss.toFixed(2)} %` : '-'}
        </div>
      }
      {
        !isMobile &&
        <div style={columnWithIconNarrowStyle}>
          {measurement.latency !== null ? `${measurement.latency.toFixed(0)} ms` : '-'}
        </div>
      }
      {
        !isMobile && <div style={{width: '4%'}}></div>
      }
      {
        !isMobile &&
        <div style={locationColumnStyle}>
          <p style={ellipsisStyle}>{`${measurement.city}, ${measurement.state}`}</p>
        </div>
      }
      {
        isMobile &&
        <div style={infoIconColumnStyle}>
          <img src={InfoIcon} width={22} height={22} alt={'info-icon'} onClick={openInfoModal}/>
        </div>
      }
    </div>
  )
}

export default MyHistoricalValuesTableRow;