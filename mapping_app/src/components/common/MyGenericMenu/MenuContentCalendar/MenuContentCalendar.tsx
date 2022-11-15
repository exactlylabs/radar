import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/MenuContentCalendar.style";
import Option from "../../../ExplorePage/TopFilters/Option";
import {calendarFilters} from "../../../../utils/filters";
import MyFullWidthButton from "../../MyFullWidthButton";
import {getMenuContent, MenuContent} from "../menu";
import {Filter, Optional} from "../../../../utils/types";
import {useContentMenu} from "../../../../hooks/useContentMenu";
import {DatePickerState} from "../../../../utils/dates";

interface MenuContentCalendarProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeMenu: () => void;
  applyRanges: (queryString: string) => void;
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
  const [options, setOptions] = useState<Array<string>>(calendarFilters);

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
    if(option === calendarFilters[4]) goToCustomRange();
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
                    isLast={index === (options.length - 1) || !calendarFilters.includes(filter)}
            />
          ))
        }
      </div>
      <MyFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default MenuContentCalendar;