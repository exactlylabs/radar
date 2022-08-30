import {DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA, WHITE} from "../../../../utils/colors";
import ConnectionInformation from "./ConnectionInformation";
import TestStatsTableContent from "../../../common/TestStatsTableContent";
import {useScreenSize} from "../../../../hooks/useScreenSize";

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
  boxShadow: DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA,
  paddingLeft: 18,
  paddingRight: 18,
}

const extendedStyle = {
  width: '100%',
  minWidth: 550,
  maxWidth: 600,
  height: 180,
  borderRadius: 16,
  backgroundColor: WHITE,
  margin: '25px auto',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA,
}

const mobileStyle = {
  width: '100%',
  height: 'max-content',
  borderRadius: 16,
  backgroundColor: WHITE,
  margin: '25px auto',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA,
  paddingTop: 5,
  paddingBottom: 5,
}

const mobileExtendedStyle = {
  ...mobileStyle,
  paddingTop: 0,
  paddingBottom: 0,
}

const opaqueStyle = {
  ...tableStyle,
  opacity: 0.5,
}

const TestStatsTable = ({
  extended,
  disabled,
  downloadValue,
  uploadValue,
  lossValue,
  latencyValue,
  userStepData,
}) => {

  const isMobile = useScreenSize();

  const getStyle = () => {
    let style;
    if(isMobile && !extended) style = mobileStyle;
    else if(isMobile && extended) style = mobileExtendedStyle;
    else if(!isMobile && extended) style = extendedStyle;
    else style = tableStyle;
    return disabled ? {...style, opacity: 0.3} : style;
  }

  return (
    <div style={getStyle()}>
      {
        extended ?
          <>
            <div>
              <ConnectionInformation userStepData={userStepData} integratedToStatsTable={extended}/>
            </div>
            <div>
              <TestStatsTableContent disabled={disabled}
                                     downloadValue={downloadValue}
                                     uploadValue={uploadValue}
                                     latencyValue={latencyValue}
                                     lossValue={lossValue}
              />
            </div>
          </> :
          <TestStatsTableContent disabled={disabled}
                                 downloadValue={downloadValue}
                                 uploadValue={uploadValue}
                                 latencyValue={latencyValue}
                                 lossValue={lossValue}
          />
      }
    </div>
  )
}

export default TestStatsTable;