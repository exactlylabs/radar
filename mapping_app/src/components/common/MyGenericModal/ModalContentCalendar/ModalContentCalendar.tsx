import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/ModalContentCalendar.style";
import {Filter, Optional} from "../../../../utils/types";
import {DatePickerState} from "../../../../utils/dates";
import {MenuContent} from "../../MyGenericMenu/menu";
import {calendarFilters} from "../../../../utils/filters";
import Option from "../../../ExplorePage/TopFilters/Option";
import MyFullWidthButton from "../../MyFullWidthButton";

interface ModalContentCalendarProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeModal: () => void;
  applyRanges: (queryString: string) => void;
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
  const [options, setOptions] = useState<Array<string>>(calendarFilters);

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
    if(option === calendarFilters[4]) goToCustomRange();
    else setInnerOption(option as string);
  }

  useEffect(() => {
    if(selectedOption && !calendarFilters.includes(selectedOption)) {
      setOptions([
        calendarFilters[0],
        calendarFilters[1],
        calendarFilters[2],
        calendarFilters[3],
        selectedOption,
        calendarFilters[4]
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
                    isLast={index === (options.length - 1) || !calendarFilters.includes(filter)}
            />
          ))
        }
      </div>
      <MyFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default ModalContentCalendar;