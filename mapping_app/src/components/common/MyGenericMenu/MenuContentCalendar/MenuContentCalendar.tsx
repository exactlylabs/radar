import {ReactElement, useState} from "react";
import {styles} from "./styles/MenuContentCalendar.style";
import Option from "../../../ExplorePage/TopFilters/Option";
import {calendarFilters} from "../../../../utils/filters";
import MyFullWidthButton from "../../MyFullWidthButton";
import {getMenuContent, MenuContent} from "../menu";
import {Optional} from "../../../../utils/types";
import {useContentMenu} from "../../../../hooks/useContentMenu";

interface MenuContentCalendarProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeMenu: () => void;
}

const MenuContentCalendar = ({
  selectedOption,
  setSelectedOption,
  closeMenu,
}: MenuContentCalendarProps): ReactElement => {

  const {setMenuContent} = useContentMenu();

  const [innerOption, setInnerOption] = useState<string>(selectedOption);

  const pickDefaultOption = (index: number) => setInnerOption(calendarFilters[index]);

  const applyOptionSelected = () => {
    setSelectedOption(innerOption);
    closeMenu();
  }

  const goToCustomRange = () => {
    const thisProps = {selectedOption, setSelectedOption, closeMenu, setMenuContent};
    const customDateRangeProps = {
      goBack: () => setMenuContent(getMenuContent(MenuContent.CALENDAR, thisProps))
    };
    setMenuContent(getMenuContent(MenuContent.CUSTOM_DATE_RANGE, customDateRangeProps));
  }

  return (
    <div style={styles.MenuContentCalendar}>
      <p className={'fw-medium'} style={styles.Title}>Filter by time</p>
      <div style={styles.MenuContentCalendarContainer}>
        {
          calendarFilters.map((filter, index) => (
            <Option option={filter}
                    key={index}
                    selected={innerOption === filter}
                    onClick={index === (calendarFilters.length - 1) ? goToCustomRange : () => pickDefaultOption(index)}
                    isLast={index === (calendarFilters.length - 1)}
            />
          ))
        }
      </div>
      <MyFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default MenuContentCalendar;