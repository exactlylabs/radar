import {useContext, useState} from "react";
import MyHistoricalValuesTablePaginator from "./MyHistoricalValuesTablePaginator";
import MyHistoricalValuesTableHeader from "./MyHistoricalValuesTableHeader";
import MyHistoricalValuesTableRow from "./MyHistoricalValuesTableRow";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import ConfigContext from "../../context/ConfigContext";

const historicalValuesTableStyle = {
  width: '75%',
  maxWidth: '960px',
  margin: '35px auto'
}

const mobileHistoricalValuesTableStyle = {
  width: '95%',
  margin: '30px auto 25px'
}

const widgetHistoricalValuesTableStyle = {
  width: '95%',
  margin: '16px auto'
}

const MyHistoricalValuesTable = ({ values, openMeasurementInfoModal }) => {

  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedValues = () => {
    return values.slice((currentPage - 1) * 5, currentPage * 5);
  }

  const getMainContainerStyle = () => {
    if(config.widgetMode) return widgetHistoricalValuesTableStyle;
    if(isSmallSizeScreen || isMediumSizeScreen) return mobileHistoricalValuesTableStyle;
    return historicalValuesTableStyle
  }

  return (
    <div style={getMainContainerStyle()}>
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