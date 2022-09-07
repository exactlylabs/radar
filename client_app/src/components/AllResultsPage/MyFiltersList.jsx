import {
  DOWNLOAD_RANGES,
  UPLOAD_RANGES,
} from "../../utils/speeds";
import MyResultFilter from "./MyResultFilter";
import {
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID
} from "../../utils/colors";


const MyFiltersList = ({
  currentFilter,
  selectedRangeIndexes,
  setSelectedRangeIndexes
}) => {

  const toggleFilter = index => {
    if(selectedRangeIndexes.includes(index)) {
      setSelectedRangeIndexes(selectedRangeIndexes.filter(idx => idx !== index));
    } else {
      setSelectedRangeIndexes([...selectedRangeIndexes, index]);
    }
  }

  return (
    <div>
      {
        currentFilter === 'download' &&
        <div>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_LOW}
                          selected={selectedRangeIndexes.includes(0)}
                          onClick={() => toggleFilter(0)}
                          state={'(Unserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(0)}
                          range={DOWNLOAD_RANGES[0]}/>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_MID}
                          selected={selectedRangeIndexes.includes(1)}
                          onClick={() => toggleFilter(1)}
                          state={'(Underserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(1)}
                          range={DOWNLOAD_RANGES[1]}/>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_HIGH}
                          selected={selectedRangeIndexes.includes(2)}
                          onClick={() => toggleFilter(2)}
                          state={'(Other)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(2)}
                          range={DOWNLOAD_RANGES[2]}/>
        </div>
      }
      {
        currentFilter === 'upload' &&
        <div>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_LOW}
                          selected={selectedRangeIndexes.includes(0)}
                          onClick={() => toggleFilter(0)}
                          state={'(Unserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(0)}
                          range={UPLOAD_RANGES[0]}/>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_MID}
                          selected={selectedRangeIndexes.includes(1)}
                          onClick={() => toggleFilter(1)}
                          state={'(Underserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(1)}
                          range={UPLOAD_RANGES[1]}/>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_HIGH}
                          selected={selectedRangeIndexes.includes(2)}
                          onClick={() => toggleFilter(2)}
                          state={'(Other)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(2)}
                          range={UPLOAD_RANGES[2]}/>
        </div>
      }
    </div>
  )
}

export default MyFiltersList;