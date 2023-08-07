import {
  DOWNLOAD_RANGES,
  UPLOAD_RANGES,
} from "../../utils/speeds";
import MyResultFilter from "./MyResultFilter";
import {
  DEFAULT_DOWNLOAD_FILTER_NONE,
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID
} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";


const MyFiltersList = ({
  currentFilter,
  selectedRangeIndexes,
  setSelectedRangeIndexes
}) => {

  const {isExtraSmallSizeScreen} = useViewportSizes();

  const toggleFilter = index => {
    if(selectedRangeIndexes.includes(index)) {
      setSelectedRangeIndexes(selectedRangeIndexes.filter(idx => idx !== index));
    } else {
      setSelectedRangeIndexes([...selectedRangeIndexes, index]);
    }
  }

  const toggleFilterWithZero = () => toggleFilter(0);

  const toggleFilterWithOne = () => toggleFilter(1);

  const toggleFilterWithTwo = () => toggleFilter(2);

  const toggleFilterWithThree = () => toggleFilter(3);

  return (
    <div>
      {
        currentFilter === 'download' &&
        <div>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_NONE}
                          selected={selectedRangeIndexes.includes(0)}
                          onClick={toggleFilterWithZero}
                          state={'No Internet'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(0)}
          />
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_LOW}
                          selected={selectedRangeIndexes.includes(1)}
                          onClick={toggleFilterWithOne}
                          state={'(Unserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(1)}
                          range={DOWNLOAD_RANGES[0]}
                          filterTextWidth={'80px'}
          />
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_MID}
                          selected={selectedRangeIndexes.includes(2)}
                          onClick={toggleFilterWithTwo}
                          state={'(Underserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(2)}
                          range={DOWNLOAD_RANGES[1]}
                          filterTextWidth={'96px'}
          />
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_HIGH}
                          selected={selectedRangeIndexes.includes(3)}
                          onClick={toggleFilterWithThree}
                          state={'(Other)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(3)}
                          range={DOWNLOAD_RANGES[2]}
                          filterTextWidth={'78px'}
          />
        </div>
      }
      {
        currentFilter === 'upload' &&
        <div>
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_NONE}
                          selected={selectedRangeIndexes.includes(0)}
                          onClick={toggleFilterWithZero}
                          state={'No Internet'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(0)}
          />
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_LOW}
                          selected={selectedRangeIndexes.includes(1)}
                          onClick={toggleFilterWithOne}
                          state={'(Unserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(1)}
                          range={UPLOAD_RANGES[0]}
                          filterTextWidth={'71px'}
          />
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_MID}
                          selected={selectedRangeIndexes.includes(2)}
                          onClick={toggleFilterWithTwo}
                          state={'(Underserved)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(2)}
                          range={UPLOAD_RANGES[1]}
                          filterTextWidth={'80px'}
          />
          <MyResultFilter color={DEFAULT_DOWNLOAD_FILTER_HIGH}
                          selected={selectedRangeIndexes.includes(3)}
                          onClick={toggleFilterWithThree}
                          state={'(Other)'}
                          opaque={selectedRangeIndexes.length > 0 && !selectedRangeIndexes.includes(3)}
                          range={UPLOAD_RANGES[2]}
                          filterTextWidth={'70px'}
          />
        </div>
      }
    </div>
  )
}

export default MyFiltersList;