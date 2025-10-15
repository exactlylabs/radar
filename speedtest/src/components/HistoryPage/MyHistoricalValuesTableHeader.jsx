import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/loss-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import {DEFAULT_HISTORICAL_VALUES_HEADER_TITLE_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    <div className={'speedtest--bold'} style={historicalValuesTableHeaderStyle}>
      <div style={getNetworkTypeColumnStyle()}></div>
      <div style={getDateTimeColumnStyle()}>{t('history.table.headers.dateTime')}</div>
      <div style={getDownUpColumnStyle()}>
        <img src={DownloadIcon} height={16} width={16} alt={t('alt.icons.download')} style={iconStyle}/>
        <div style={textStyle}>{isSmallSizeScreen || isMediumSizeScreen ? t('common.labels.mbps') : t('history.table.headers.download')}</div>
      </div>
      <div style={getDownUpColumnStyle()}>
        <img src={UploadIcon} height={16} width={16} alt={t('alt.icons.upload')} style={iconStyle}/>
        <div style={textStyle}>{isSmallSizeScreen || isMediumSizeScreen ? t('common.labels.mbps') : t('history.table.headers.upload')}</div>
      </div>
      {
        !isSmallSizeScreen &&
        <div style={getLatencyLossColumnStyle()}>
          <img src={LatencyIcon} height={16} width={16} alt={t('alt.icons.latency')} style={iconStyle}/>
          <div style={textStyle}>{ isMediumSizeScreen ? t('common.labels.ms') : t('history.table.headers.latency') }</div>
        </div>
      }
      {
        !isSmallSizeScreen &&
        <div style={getLatencyLossColumnStyle()}>
          <img src={LossIcon} height={16} width={16} alt={t('alt.icons.loss')} style={iconStyle}/>
          <div style={textStyle}>{isMediumSizeScreen ? t('common.labels.percent') : t('history.table.headers.loss')}</div>
        </div>
      }
      { !isSmallSizeScreen && !isMediumSizeScreen && <div style={{width: '4%'}}></div> }
      { !isSmallSizeScreen && !isMediumSizeScreen && <div style={locationColumnStyle}>{t('history.table.headers.location')}</div> }
      { (isSmallSizeScreen || isMediumSizeScreen) && <div style={{width: '11%'}}></div> }
    </div>
  )
}

export default MyHistoricalValuesTableHeader;