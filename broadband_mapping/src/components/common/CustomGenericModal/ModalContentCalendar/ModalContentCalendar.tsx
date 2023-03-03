import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ModalContentCalendar.style";
import {Filter, Optional} from "../../../../utils/types";
import {DateFilter, DatePickerState} from "../../../../utils/dates";
import {MenuContent} from "../../CustomGenericMenu/menu";
import {CalendarFilters} from "../../../../utils/filters";
import Option from "../../../ExplorePage/TopFilters/Option";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface ModalContentCalendarProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeModal: () => void;
  applyRanges: (dateObject: DateFilter) => void;
  initialState: Optional<DatePickerState>;
  setModalContent: (menuContent: Optional<MenuContent>) => void;
}

const ModalContentCalendar = ({
  selectedOption,
  setSelectedOption,
  closeModal,
  applyRanges,
  initialState,
  setModalContent,
}: ModalContentCalendarProps): ReactElement => {

  const [innerOption, setInnerOption] = useState<string>(selectedOption);
  const [options, setOptions] = useState<Array<string>>(Object.values(CalendarFilters));

  const applyOptionSelected = () => {
    setSelectedOption(innerOption);
    closeModal();
  }

  const goToCustomRange = () => {
    const customDateRangeProps = {
      goBack: () => setModalContent(MenuContent.CALENDAR),
      applyRanges,
      initialState
    };
    setModalContent(MenuContent.CUSTOM_DATE_RANGE);
  }

  const handleSelectOption = (option: Filter) => {
    if(option === CalendarFilters.CUSTOM_DATE) goToCustomRange();
    else setInnerOption(option as string);
  }

  useEffect(() => {
    if(selectedOption && !Object.values(CalendarFilters).includes(selectedOption as CalendarFilters)) {
      setOptions([
        CalendarFilters.ALL_TIME,
        CalendarFilters.LAST_WEEK,
        CalendarFilters.LAST_MONTH,
        CalendarFilters.THIS_YEAR,
        selectedOption,
        CalendarFilters.CUSTOM_DATE
      ]);
    }
  }, [selectedOption]);

  return (
    <div style={styles.ModalContentCalendar}>
      <p className={'fw-medium'} style={styles.Title}>Filter by time</p>
      <div style={styles.MenuContentCalendarContainer}>
        {
          options.map((filter, index) => (
            <Option option={filter}
                    key={index}
                    selected={innerOption === filter}
                    onClick={handleSelectOption}
                    isLast={index === (options.length - 1) || !Object.values(CalendarFilters).includes(filter as CalendarFilters)}
            />
          ))
        }
      </div>
      <CustomFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default ModalContentCalendar;