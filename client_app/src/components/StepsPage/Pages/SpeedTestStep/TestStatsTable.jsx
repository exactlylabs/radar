import {DEFAULT_STATS_TABLE_BOX_SHADOW_RGBA, WHITE} from "../../../../utils/colors";
import ConnectionInformation from "./ConnectionInformation";
import TestStatsTableContent from "./TestStatsTableContent";

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

const opaqueStyle = {
  ...tableStyle,
  opacity: 0.5,
}

const TestStatsTable = ({
  extended,
  disabled,
  downloadValue,
  uploadValue,
  pingValue,
  latencyValue,
  userStepData,
}) => {

  const getStyle = () => {
    if(extended) return extendedStyle;
    return disabled ? opaqueStyle : tableStyle;
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
                                     pingValue={pingValue}
              />
            </div>
          </> :
          <TestStatsTableContent disabled={disabled}
                                 downloadValue={downloadValue}
                                 uploadValue={uploadValue}
                                 latencyValue={latencyValue}
                                 pingValue={pingValue}
          />
      }
    </div>
  )
}

export default TestStatsTable;