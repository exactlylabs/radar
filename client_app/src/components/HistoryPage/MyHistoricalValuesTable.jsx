import {useState} from "react";
import MyHistoricalValuesTablePaginator from "./MyHistoricalValuesTablePaginator";
import MyHistoricalValuesTableHeader from "./MyHistoricalValuesTableHeader";
import MyHistoricalValuesTableRow from "./MyHistoricalValuesTableRow";

const historicalValuesTableStyle = {
  width: '65%',
  minWidth: 900,
  maxHeight: 270,
  margin: '35px auto'
}

const MyHistoricalValuesTable = ({ values }) => {

  const [currentPage, setCurrentPage] = useState(1);

  const paginatedValues = () => {
    return values.reverse().slice((currentPage - 1) * 5, currentPage * 5);
  }

  return (
    <div style={historicalValuesTableStyle}>
      <MyHistoricalValuesTableHeader />
      {
        paginatedValues().map((measurement, index) => <MyHistoricalValuesTableRow key={measurement.timestamp} measurement={measurement} isEven={index % 2 === 0}/>)
      }
      <MyHistoricalValuesTablePaginator currentPage={currentPage} setCurrentPage={setCurrentPage}/>
    </div>
  )
}

export default MyHistoricalValuesTable;