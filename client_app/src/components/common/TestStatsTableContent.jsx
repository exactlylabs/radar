import DownloadIcon from "../../assets/small-download-icon.png";
import MyStatsTableVerticalDivider from "../StepsPage/Pages/SpeedTestStep/MyStatsTableVerticalDivider";
import UploadIcon from "../../assets/small-upload-icon.png";
import PingIcon from "../../assets/ping-icon.png";
import LatencyIcon from "../../assets/latency-icon.png";
import {DEFAULT_STATS_TABLE_TEXT_COLOR} from "../../utils/colors";
import {useIsMediumSizeScreen} from "../../hooks/useIsMediumSizeScreen";
import MyStatsTableHorizontalDivider from "../StepsPage/Pages/SpeedTestStep/MyStatsTableHorizontalDivider";
import {useIsSmallSizeScreen} from "../../hooks/useIsSmallSizeScreen";

const tableContentStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  paddingTop: 10,
}

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
  paddingTop: 12,
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

const TestStatsTableContent = ({
  extended,
  downloadValue,
  uploadValue,
  latencyValue,
  lossValue
}) => {

  const isMediumSizeScreen = useIsMediumSizeScreen();
  const isSmallSizeScreen = useIsSmallSizeScreen();

  const getStyle = () => {
    let style;
    if((isMediumSizeScreen || isSmallSizeScreen) && extended) style = mobileExtendedRowStyle;
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
          <img style={iconStyle} src={PingIcon} width={16} height={16} alt={'loss-icon'}/>
          <div style={titleStyle}>Loss</div>
        </div>
        <div style={valueStyle}>{lossValue ? lossValue : '-'}</div>
        <div style={unitStyle}>%</div>
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

  const getMobileContent = () => (
    <div style={mobileTableContentStyle}>
      <div style={halfColumnStyle}>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={DownloadIcon} width={16} height={16} alt={'download-icon'}/>
            <div style={titleStyle}>Download</div>
          </div>
          <div style={mobileValuesStyle}>
            <div style={mobileValueStyle}>{downloadValue ? downloadValue : '-'}</div>
            <div style={mobileUnitStyle}>Mbps</div>
          </div>
        </div>
        <MyStatsTableHorizontalDivider/>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={PingIcon} width={16} height={16} alt={'loss-icon'}/>
            <div style={titleStyle}>Loss</div>
          </div>
          <div style={mobileValuesStyle}>
            <div style={mobileValueStyle}>{lossValue ? lossValue : '-'}</div>
            <div style={mobileUnitStyle}>%</div>
          </div>
        </div>
      </div>
      <div style={halfColumnStyle}>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={UploadIcon} width={16} height={16} alt={'upload-icon'}/>
            <div style={titleStyle}>Upload</div>
          </div>
          <div style={mobileValuesStyle}>
            <div style={mobileValueStyle}>{uploadValue ? uploadValue : '-'}</div>
            <div style={mobileUnitStyle}>Mbps</div>
          </div>
        </div>
        <MyStatsTableHorizontalDivider/>
        <div style={mobileColumnStyle}>
          <div style={headerStyle}>
            <img style={iconStyle} src={LatencyIcon} width={16} height={16} alt={'latency-icon'}/>
            <div style={titleStyle}>Latency</div>
          </div>
          <div style={mobileValuesStyle}>
            <div style={mobileValueStyle}>{latencyValue ? latencyValue : '-'}</div>
            <div style={mobileUnitStyle}>ms</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={getStyle()}>
      { isMediumSizeScreen || isSmallSizeScreen ? getMobileContent() : getDesktopContent() }
    </div>
  )
}

export default TestStatsTableContent;