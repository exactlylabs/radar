import {DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA, DEFAULT_STATS_TABLE_TEXT_COLOR, WHITE} from "../../../../utils/colors";
import DownloadIcon from '../../../../assets/small-download-icon.png';
import UploadIcon from '../../../../assets/small-upload-icon.png';
import PingIcon from '../../../../assets/ping-icon.png';
import LatencyIcon from '../../../../assets/latency-icon.png';

import MyStatsTableVerticalDivider from "./MyStatsTableVerticalDivider";

const tableStyle = {
  width: '100%',
  minWidth: 550,
  maxWidth: 600,
  height: 125,
  borderRadius: 16,
  backgroundColor: WHITE,
  margin: '70px auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  boxShadow: DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA,
  paddingLeft: 18,
  paddingRight: 18,
}

const opaqueStyle = {
  ...tableStyle,
  opacity: 0.5,
}

const columnStyle = {
  width: '13%',
  minWidth: 100,
  paddingTop: 12,
  height: 90,
  margin: 'auto',
}

const headerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center'
}

const titleStyle = {
  fontSize: 14,
  fontWeight: 'bold',
  color: DEFAULT_STATS_TABLE_TEXT_COLOR
}

const iconStyle = {
  marginRight: 5
}

const valueStyle = {
  fontSize: 26,
  fontWeight: 'bold',
  height: 33,
  color: DEFAULT_STATS_TABLE_TEXT_COLOR,
  margin: '5px auto'
}

const unitStyle = {
  fontSize: 14,
  height: 25,
  color: DEFAULT_STATS_TABLE_TEXT_COLOR
}

const TestStatsTable = ({
  disabled,
  downloadValue,
  uploadValue,
  pingValue,
  latencyValue,
}) => {

  return (
    <div style={disabled ? opaqueStyle : tableStyle}>
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={DownloadIcon} width={16} height={16} alt={'download-icon'}/>
          <div style={titleStyle}>Download</div>
        </div>
        <div style={valueStyle}>{downloadValue ? downloadValue : '-'}</div>
        <div style={unitStyle}>Mbps</div>
      </div>
      <MyStatsTableVerticalDivider />
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={UploadIcon} width={16} height={16} alt={'upload-icon'}/>
          <div style={titleStyle}>Upload</div>
        </div>
        <div style={valueStyle}>{uploadValue ? uploadValue : '-'}</div>
        <div style={unitStyle}>Mbps</div>
      </div>
      <MyStatsTableVerticalDivider />
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={PingIcon} width={16} height={16} alt={'ping-icon'}/>
          <div style={titleStyle}>Ping</div>
        </div>
        <div style={valueStyle}>{pingValue ? pingValue : '-'}</div>
        <div style={unitStyle}>ms</div>
      </div>
      <MyStatsTableVerticalDivider />
      <div style={columnStyle}>
        <div style={headerStyle}>
          <img style={iconStyle} src={LatencyIcon} width={16} height={16} alt={'latency-icon'}/>
          <div style={titleStyle}>Latency</div>
        </div>
        <div style={valueStyle}>{latencyValue ? latencyValue : '-'}</div>
        <div style={unitStyle}>ms</div>
      </div>
    </div>
  )
}

export default TestStatsTable;