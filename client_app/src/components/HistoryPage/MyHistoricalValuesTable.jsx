import {useState} from "react";
import MyHistoricalValuesTablePaginator from "./MyHistoricalValuesTablePaginator";
import MyHistoricalValuesTableHeader from "./MyHistoricalValuesTableHeader";
import MyHistoricalValuesTableRow from "./MyHistoricalValuesTableRow";

const historicalValuesTableStyle = {
  width: '65%',
  minWidth: 900,
  margin: '35px auto'
}

const MyHistoricalValuesTable = ({ values }) => {

  const [currentPage, setCurrentPage] = useState(1);

  const paginatedValues = () => {
    return values.slice((currentPage - 1) * 5, currentPage * 5);
  }

  return (
    <div style={historicalValuesTableStyle}>
      <MyHistoricalValuesTableHeader />
      {
        paginatedValues().map((measurement, index) => <MyHistoricalValuesTableRow key={measurement.timestamp} measurement={measurement} isEven={index % 2 === 0}/>)
      }
      {
        values.length > 5 &&
        <MyHistoricalValuesTablePaginator currentPage={currentPage}
                                          setCurrentPage={setCurrentPage}
                                          pageCount={Math.ceil(values.length / 5)}
        />
      }
    </div>
  )
}

export default MyHistoricalValuesTable;