import {ReactElement, useState} from "react";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import WeekPicker from "../../../ExplorePage/DatePicker/WeekPicker";
import {styles} from "./styles/MenuContentWeek.style";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface MenuContentWeekProps {
  goBack: () => void;
  selectedWeek: number;
  selectedMonth: number;
  selectedYear: number;
  setSelectedWeek: (newWeek: number, year: number, month: number) => void;
  setSelectedMonth: (month: number) => void;
}

const MenuContentWeek = ({
  goBack,
  selectedWeek,
  selectedMonth,
  selectedYear,
  setSelectedWeek,
}: MenuContentWeekProps): ReactElement => {

  const [internalNewWeek, setInternalNewWeek] = useState(selectedWeek);
  const [internalYear, setInternalYear] = useState(selectedYear);
  const [internalMonth, setInternalMonth] = useState(selectedMonth);

  const confirmSelection = () => {
    setSelectedWeek(internalNewWeek, internalYear, internalMonth);
    goBack();
  }

  const handleSetSelectedWeek = (newWeek: number, year: number, month: number) => {
    setInternalNewWeek(newWeek);
    setInternalMonth(month);
    setInternalYear(year);
  }

  return (
    <div style={styles.MenuContentWeek}>
      <img src={GoBackIcon}
           style={styles.GoBackIcon}
           alt={'go-back'}
           onClick={goBack}
      />
      <p className={'fw-medium'} style={styles.Title}>Choose half-year</p>
      <div style={styles.ItemsContainer}>
        <WeekPicker selectedMonth={internalMonth}
                    selectedYear={internalYear}
                    selectedWeek={internalNewWeek}
                    setSelectedMonth={setInternalMonth}
                    setSelectedWeek={handleSetSelectedWeek}
        />
      </div>
      <CustomFullWidthButton text={'Confirm'} onClick={confirmSelection}/>
    </div>
  )
}

export default MenuContentWeek;