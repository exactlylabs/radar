import DownloadIcon from "../../../../assets/small-download-icon.png";
import MyStatsTableVerticalDivider from "./MyStatsTableVerticalDivider";
import UploadIcon from "../../../../assets/small-upload-icon.png";
import PingIcon from "../../../../assets/ping-icon.png";
import LatencyIcon from "../../../../assets/latency-icon.png";
import {DEFAULT_STATS_TABLE_TEXT_COLOR} from "../../../../utils/colors";

const tableContentStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  paddingTop: 10,
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

const extendedRowStyle = {
  ...tableContentStyle,
  paddingRight: 0,
  paddingLeft: 0,
  margin: 0,
  borderRadius: '0 0 16px 16px'
}

const TestStatsTableContent = ({
  extended,
  downloadValue,
  uploadValue,
  latencyValue,
  pingValue
}) => {
  return (
    <div style={extended ? extendedRowStyle : tableContentStyle}>
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

export default TestStatsTableContent;