import {DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA, WHITE, WIDGET_STATS_BG_COLOR} from "../../../../utils/colors";
import ConnectionInformation from "./ConnectionInformation";
import TestStatsTableContent from "../../../common/TestStatsTableContent";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import {useContext} from "react";
import UserDataContext from "../../../../context/UserData";
import ConfigContext from "../../../../context/ConfigContext";
import SpeedTestContext from "../../../../context/SpeedTestContext";

const tableStyle = {
  width: '100%',
  minWidth: 550,
  maxWidth: 600,
  height: 125,
  borderRadius: 16,
  backgroundColor: WHITE,
  margin: '25px auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: `0 0 10px 0 ${DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA}`,
  paddingLeft: 18,
  paddingRight: 18,
}

const extendedStyle = {
  width: '100%',
  minWidth: 550,
  maxWidth: 600,
  borderRadius: 16,
  backgroundColor: WHITE,
  margin: '25px auto',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: `0 0 10px 0 ${DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA}`,
}

const mobileStyle = {
  width: '100%',
  height: 'max-content',
  borderRadius: 16,
  backgroundColor: WHITE,
  margin: '25px auto',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: `0 0 10px 0 ${DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA}`,
  paddingTop: 5,
  paddingBottom: 5,
}

const mobileExtendedStyle = {
  ...mobileStyle,
  paddingTop: 0,
  paddingBottom: 0,
}

const widgetStyle = {
  ...tableStyle,
  minWidth: 'none',
  maxWidth: 'none',
  paddingLeft: 0,
  paddingRight: 0,
  margin: '16px auto',
  height: 105,
  backgroundColor: WIDGET_STATS_BG_COLOR,
}

const widgetExtendedStyle = {
  ...widgetStyle,
  height: 'max-content',
  margin: '16px auto 0',
  backgroundColor: WIDGET_STATS_BG_COLOR,
  width: 'calc(100% - 3rem)',
}

const TestStatsTable = ({extended}) => {

  const config = useContext(ConfigContext);
  const {speedTestData} = useContext(SpeedTestContext);
  const {disabled} = speedTestData;
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getStyle = () => {
    let style;
    if(config.widgetMode && !extended) style = widgetStyle;
    else if(config.widgetMode && extended) style = widgetExtendedStyle;
    else if((isMediumSizeScreen || isSmallSizeScreen) && !extended) style = mobileStyle;
    else if((isMediumSizeScreen || isSmallSizeScreen) && extended) style = mobileExtendedStyle;
    else if(!(isMediumSizeScreen || isSmallSizeScreen) && extended) style = extendedStyle;
    else style = tableStyle;
    return !extended && disabled ? {...style, opacity: 0.3} : style;
  }

  return (
    <div style={getStyle()}>
      {extended && <ConnectionInformation integratedToStatsTable={extended}/>}
      <TestStatsTableContent extended={extended}/>
    </div>
  )
}

export default TestStatsTable;