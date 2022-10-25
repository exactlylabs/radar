import {ReactElement} from "react";
import {styles} from "./styles/WeekPickerRow.style";
import './styles/WeekPickerRow.css';
import {Day, isDay} from "../../../utils/dates";

interface WeekPickerRowProps {
  elements: Array<Day | string>;
  disabled?: boolean;
  selected: boolean;
  header?: boolean;
  currentMonth: number;
  setSelectedWeek?: (newWeek: number, newMonth: number) => void;
}

const WeekPickerRow = ({
  elements,
  disabled,
  selected,
  header,
  currentMonth,
  setSelectedWeek
}: WeekPickerRowProps): ReactElement => {

  const isNotCurrentMonth = (elem: Day | string): boolean => {
    if(!isDay(elem)) return true;
    const dayElem: Day = elem as Day;
    return dayElem.month !== currentMonth;
  }

  const selectWeek = () => setSelectedWeek && setSelectedWeek((elements[0] as Day).week, (elements[0] as Day).month);

  return (
    <div className={`week-picker-row ${selected ? 'week-picker-row--selected' : ''} ${disabled ? 'week-picker-row--disabled' : ''}`}
         style={styles.WeekPickerRow(selected, header)}
         onClick={disabled ? undefined : selectWeek}
    >
      { elements.map((elem, index) => (
        <div key={`${isDay(elem) ? (elem as Day).dayNumber : elem as string}${index}`} style={styles.TextContainer}>
          <p className={header ? 'fw-medium' : 'fw-regular'}
             style={styles.Text(selected, isNotCurrentMonth(elem), header, disabled)}>
            {isDay(elem) ? (elem as Day).dayNumber : elem as string}
          </p>
        </div>
      ))
      }
    </div>
  )
}

export default WeekPickerRow;