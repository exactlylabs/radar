import {ReactElement, useState} from "react";
import {styles} from "./styles/YearSelector.style";
import ChevronRight from '../../../assets/chevron-right.png';
import OptionsDropright from "./OptionsDropright";
import {years} from "../../../utils/filters";

interface YearSelectorProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const YearSelector = ({
  selectedYear,
  setSelectedYear,
}: YearSelectorProps): ReactElement => {

  const [isDroprightOpen, setIsDroprightOpen] = useState(false);

  const toggleDropright = () => setIsDroprightOpen(!isDroprightOpen);

  return (
    <div style={styles.YearSelector} onClick={toggleDropright}>
      <div className={'hover-opaque'} style={styles.YearSelectorContent}>
        <p className={'fw-regular'} style={styles.Year}>{selectedYear}</p>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      {
        isDroprightOpen &&
        <OptionsDropright options={years}
                          selectedOption={selectedYear}
                          setSelectedOption={setSelectedYear}
        />
      }
    </div>
  )
}

export default YearSelector;