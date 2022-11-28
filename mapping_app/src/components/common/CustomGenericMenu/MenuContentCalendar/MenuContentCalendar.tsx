import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/MenuContentCalendar.style";
import Option from "../../../ExplorePage/TopFilters/Option";
import {calendarFilters} from "../../../../utils/filters";
import {getMenuContent, MenuContent} from "../menu";
import {Filter, Optional} from "../../../../utils/types";
import {useContentMenu} from "../../../../hooks/useContentMenu";
import {DateFilter, DatePickerState} from "../../../../utils/dates";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface MenuContentCalendarProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeMenu: () => void;
  applyRanges: (dateObject: DateFilter) => void;
  initialState: Optional<DatePickerState>;
  setMenuContent: (menuContent: Optional<MenuContent>) => void;
}

const MenuContentCalendar = ({
  selectedOption,
  setSelectedOption,
  closeMenu,
  applyRanges,
  initialState,
  setMenuContent,
}: MenuContentCalendarProps): ReactElement => {

  const [innerOption, setInnerOption] = useState<string>(selectedOption);
  const [options, setOptions] = useState<Array<string>>(Object.values(calendarFilters));

  useEffect(() => {
    if(selectedOption && !Object.values(calendarFilters).includes(selectedOption as calendarFilters)) {
      setOptions([
        calendarFilters.ALL_TIME,
        calendarFilters.LAST_WEEK,
        calendarFilters.LAST_MONTH,
        calendarFilters.THIS_YEAR,
        selectedOption,
        calendarFilters.CUSTOM_DATE
      ]);
    }
  }, [selectedOption]);

  const applyOptionSelected = () => {
    setSelectedOption(innerOption);
    closeMenu();
  }

  const goToCustomRange = () => {
    const customDateRangeProps = {
      goBack: () => setMenuContent(MenuContent.CALENDAR),
      applyRanges,
      initialState
    };
    setMenuContent(MenuContent.CUSTOM_DATE_RANGE);
  }

  const handleSelectOption = (option: Filter) => {
    if(option === calendarFilters.CUSTOM_DATE) goToCustomRange();
    else setInnerOption(option as string);
  }

  return (
    <div style={styles.MenuContentCalendar}>
      <p className={'fw-medium'} style={styles.Title}>Filter by time</p>
      <div style={styles.MenuContentCalendarContainer}>
        {
          options.map((filter, index) => (
            <Option option={filter}
                    key={index}
                    selected={innerOption === filter}
                    onClick={handleSelectOption}
                    isLast={index === (options.length - 1) || !Object.values(calendarFilters).includes(filter as calendarFilters)}
            />
          ))
        }
      </div>
      <CustomFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default MenuContentCalendar;