import {useState} from "react";
import {MyTitle} from "../common/MyTitle";
import {LOCAL_STORAGE_KEY} from "../../constants";
import MyHistoricalValuesTable from "./MyHistoricalValuesTable";

const historyPageStyle = {
  width: '100%',
  margin: '0 auto',
  textAlign: 'center',
  paddingTop: 40,
}

const HistoryPage = ({

}) => {

  const [historicalValues, setHistoricalValues] = useState(
    JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY))?.values ?? null
  );

  return (
    <div style={historyPageStyle}>
      <MyTitle text={'All your results'}/>
      {
        !!historicalValues &&
        <MyHistoricalValuesTable values={historicalValues}/>
      }
    </div>
  )
}

export default HistoryPage;