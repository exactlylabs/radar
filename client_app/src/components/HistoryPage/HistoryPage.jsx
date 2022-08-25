import {useState} from "react";
import {MyTitle} from "../common/MyTitle";
import {LOCAL_STORAGE_KEY} from "../../constants";
import MyHistoricalValuesTable from "./MyHistoricalValuesTable";
import MyStepSwitcher from "../StepsPage/Stepper/MyStepSwitcher";
import {MyBackButton} from "../common/MyBackButton";
import {ArrowBack} from "@mui/icons-material";
import {MyForwardButton} from "../common/MyForwardButton";
import {MyButton} from "../common/MyButton";

const historyPageStyle = {
  width: '100%',
  margin: '0 auto',
  textAlign: 'center',
  paddingTop: 40,
}

const buttonsContainerStyle = {
  width: 380,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '50px auto',
}

const emptyStateTextStyle = {
  marginBottom: 20,
}

const emptyStateStyle = {
  width: '50%',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}

const HistoryPage = ({
  goToMapPage,
  goToSpeedTest,
  goToLastTest,
  hasRecentTest,
}) => {

  const historicalValues = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY))?.values ?? null

  return (
    <div style={historyPageStyle}>
      <MyTitle text={'All your results'}/>
      {
        !historicalValues &&
        <div style={emptyStateStyle}>
          <div style={emptyStateTextStyle}>You have not taken any speed tests so far!</div>
          <MyButton text={'Take your first test'} onClick={goToSpeedTest}/>
        </div>
      }
      {
        !!historicalValues &&
        <MyHistoricalValuesTable values={historicalValues}/>
      }
      <div style={{...buttonsContainerStyle, justifyContent: hasRecentTest ? 'space-between' : 'center'}}>
        {
          hasRecentTest &&
          <MyBackButton text={'Go to last test'}
                        icon={<ArrowBack style={{marginRight: 15}}/>}
                        iconFirst
                        onClick={goToLastTest}
          />
        }
        <MyForwardButton text={'Explore the map'} onClick={() => goToMapPage(null)} />
      </div>
    </div>
  )
}

export default HistoryPage;