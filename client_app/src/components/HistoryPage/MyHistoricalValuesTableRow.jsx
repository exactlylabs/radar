import {
  DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_DARK_VALUES_COLOR,
  HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR,
  TRANSPARENT,
} from "../../utils/colors";
import {types} from "../../utils/networkTypes";
import {prettyPrintDate} from "../../utils/dates";

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

const dateTimeColumnStyle = {
  ...commonRowStyle,
  width: '18%',
  justifyContent: 'flex-start',
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

const MyHistoricalValuesTableRow = ({
  measurement,
  isEven
}) => {

  const getNetworkTypeIcon = () => {
    const networkType = types.find(type => type.text === measurement.networkType);
    return networkType.iconSelectedSrc;
  }

  return (
    <div style={{...historicalValuesTableRowStyle, backgroundColor: isEven ? HISTORICAL_VALUES_TABLE_ROW_EVEN_BG_COLOR : TRANSPARENT}}>
      <div style={networkTypeColumStyle}>
        {measurement.networkType ?
          <img src={getNetworkTypeIcon()} width={16} height={16} alt={'network-type-icon'}/> :
          null
        }
      </div>
      <div style={dateTimeColumnStyle}>{prettyPrintDate(measurement.timestamp)}</div>
      <div style={columnWithIconStyle}>
        {measurement.download !== null ? `${measurement.download.toFixed(2)} Mbps` : '-'}
      </div>
      <div style={columnWithIconStyle}>
        {measurement.upload !== null ? `${measurement.upload.toFixed(2)} Mbps` : '-'}
      </div>
      <div style={columnWithIconNarrowStyle}>
        {measurement.loss !== null ? `${measurement.loss.toFixed(2)} %` : '-'}
      </div>
      <div style={columnWithIconNarrowStyle}>
        {measurement.latency !== null ? `${measurement.latency.toFixed(0)} ms` : '-'}
      </div>
      <div style={{width: '4%'}}></div>
      <div style={locationColumnStyle}>
        <p style={ellipsisStyle}>{measurement.address}</p>
      </div>
    </div>
  )
}

export default MyHistoricalValuesTableRow;