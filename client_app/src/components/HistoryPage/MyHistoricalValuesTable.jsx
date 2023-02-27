import {useState} from "react";
import MyHistoricalValuesTablePaginator from "./MyHistoricalValuesTablePaginator";
import MyHistoricalValuesTableHeader from "./MyHistoricalValuesTableHeader";
import MyHistoricalValuesTableRow from "./MyHistoricalValuesTableRow";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const historicalValuesTableStyle = {
  width: '75%',
  maxWidth: '1200px',
  margin: '35px auto'
}

const mobileHistoricalValuesTableStyle = {
  width: '95%',
  margin: '30px auto 25px'
}

const MyHistoricalValuesTable = ({ values, openMeasurementInfoModal }) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedValues = () => {
    return values.slice((currentPage - 1) * 5, currentPage * 5);
  }

  return (
    <div style={isSmallSizeScreen || isMediumSizeScreen ? mobileHistoricalValuesTableStyle : historicalValuesTableStyle}>
      <MyHistoricalValuesTableHeader />
      {
        paginatedValues().map((measurement, index) => <MyHistoricalValuesTableRow key={measurement.timestamp}
                                                                                  measurement={measurement}
                                                                                  isEven={index % 2 === 0}
                                                                                  openMeasurementInfoModal={openMeasurementInfoModal}
        />)
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