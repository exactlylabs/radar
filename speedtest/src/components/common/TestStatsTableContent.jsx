import DownloadIcon from "../../assets/small-download-icon.png";
import MyStatsTableVerticalDivider from "../StepsPage/Pages/SpeedTestStep/MyStatsTableVerticalDivider";
import UploadIcon from "../../assets/small-upload-icon.png";
import LossIcon from "../../assets/loss-icon.png";
import LatencyIcon from "../../assets/latency-icon.png";
import {DEFAULT_POPUP_VALUE_COLOR, DEFAULT_STATS_TABLE_TEXT_COLOR} from "../../utils/colors";
import MyStatsTableHorizontalDivider from "../StepsPage/Pages/SpeedTestStep/MyStatsTableHorizontalDivider";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";
import SpeedTestContext from "../../context/SpeedTestContext";

const tableContentStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  paddingTop: 10,
}

const widgetContentStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: '95%'
}

const widgetExtendedContentStyle = widgetContentStyle;

const mobileTableContentStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
}

const columnStyle = {
  width: '13%',
  minWidth: 100,
  height: 90,
  margin: 'auto',
}

const mobileColumnStyle = {
  width: '100%',
  paddingTop: 12,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}

const headerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center'
}

const titleStyle = {
  fontSize: 14,
  color: DEFAULT_STATS_TABLE_TEXT_COLOR
}

const xsTitleStyle = {
  ...titleStyle,
  fontSize: 11
}

const iconStyle = {
  marginRight: 5
}

const valueStyle = {
  fontSize: 26,
  height: 33,
  color: DEFAULT_POPUP_VALUE_COLOR,
  margin: '5px auto'
}

const xsValueStyle = {
  ...valueStyle,
  fontSize: 16,
  height: 'auto'
}

const unitStyle = {
  fontSize: 14,
  height: 25,
  color: DEFAULT_POPUP_VALUE_COLOR
}

const mobileValueStyle = {
  ...valueStyle,
  fontSize: 22,
  margin: '5px 5px'
}

const mobileUnitStyle = {
  fontSize: 14,
  color: DEFAULT_STATS_TABLE_TEXT_COLOR,
}

const extendedRowStyle = {
  ...tableContentStyle,
  paddingRight: 0,
  paddingLeft: 0,
  margin: 0,
  borderRadius: '0 0 16px 16px'
}

const mobileExtendedRowStyle = {

}

const halfColumnStyle = {
  width: '35%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}

const mobileValuesStyle = {
  width: '80%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
}

const TestStatsTableContent = ({extended}) => {

  const config = useContext(ConfigContext);
  const {speedTestData} = useContext(SpeedTestContext);
  const {downloadValue, uploadValue, loss, latency} = speedTestData;
  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getStyle = () => {
    let style;
    if(config.widgetMode && !extended) style = widgetContentStyle;
    else if(config.widgetMode && extended) style = widgetExtendedContentStyle;
    else if((isMediumSizeScreen || isSmallSizeScreen) && extended) style = mobileExtendedRowStyle;
    else if((isMediumSizeScreen || isSmallSizeScreen) && !extended) style = mobileTableContentStyle;
    else if(extended) style = extendedRowStyle;
    else style = tableContentStyle;
    return style;
  }

  const getDesktopContent = () => (
    <div style={tableContentStyle}>
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={DownloadIcon} width={16} height={16} alt={'download-icon'}/>
          <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Download</div>
        </div>
        <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : valueStyle}>{downloadValue ? downloadValue.toFixed(2) : '-'}</div>
        <div style={unitStyle}>Mbps</div>
      </div>
      <MyStatsTableVerticalDivider />
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={UploadIcon} width={16} height={16} alt={'upload-icon'}/>
          <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Upload</div>
        </div>
        <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : valueStyle}>{uploadValue ? uploadValue.toFixed(2) : '-'}</div>
        <div style={unitStyle}>Mbps</div>
      </div>
      <MyStatsTableVerticalDivider />
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={LossIcon} width={16} height={16} alt={'loss-icon'}/>
          <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Loss</div>
        </div>
        <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : valueStyle}>{loss ? loss.toFixed(0) : '-'}</div>
        <div style={unitStyle}>%</div>
      </div>
      <MyStatsTableVerticalDivider />
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={LatencyIcon} width={16} height={16} alt={'latency-icon'}/>
          <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Latency</div>
        </div>
        <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : valueStyle}>{latency ? latency.toFixed(0) : '-'}</div>
        <div style={unitStyle}>ms</div>
      </div>
    </div>
  )

  const getMobileContent = () => (
    <div style={mobileTableContentStyle}>
      <div style={halfColumnStyle}>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={DownloadIcon} width={16} height={16} alt={'download-icon'}/>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Download</div>
          </div>
          <div style={mobileValuesStyle}>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : mobileValueStyle}>{downloadValue ? downloadValue.toFixed(2) : '-'}</div>
            <div style={mobileUnitStyle}>Mbps</div>
          </div>
        </div>
        <MyStatsTableHorizontalDivider/>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={LossIcon} width={16} height={16} alt={'loss-icon'}/>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Loss</div>
          </div>
          <div style={mobileValuesStyle}>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : mobileValueStyle}>{loss ? loss.toFixed(0) : '-'}</div>
            <div style={mobileUnitStyle}>%</div>
          </div>
        </div>
      </div>
      <div style={halfColumnStyle}>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={UploadIcon} width={16} height={16} alt={'upload-icon'}/>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Upload</div>
          </div>
          <div style={mobileValuesStyle}>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : mobileValueStyle}>{uploadValue ? uploadValue.toFixed(2) : '-'}</div>
            <div style={mobileUnitStyle}>Mbps</div>
          </div>
        </div>
        <MyStatsTableHorizontalDivider/>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={LatencyIcon} width={16} height={16} alt={'latency-icon'}/>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsTitleStyle : titleStyle}>Latency</div>
          </div>
          <div style={mobileValuesStyle}>
            <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsValueStyle : mobileValueStyle}>{latency ? latency.toFixed(2) : '-'}</div>
            <div style={mobileUnitStyle}>ms</div>
          </div>
        </div>
      </div>
    </div>
  )

  const getContent = () => {
    if (!config.widgetMode && (isMediumSizeScreen || isSmallSizeScreen)) return getMobileContent();
    return getDesktopContent();
  }

  return (
    <div style={getStyle()}>
      {getContent()}
    </div>
  )
}

export default TestStatsTableContent;