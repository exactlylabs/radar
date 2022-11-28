import {ReactElement} from "react";
import {styles} from "./styles/MenuContentCustomRange.style";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import ChevronRight from "../../../../assets/chevron-right.png";
import DateRangeSelectorTabs from "../../../ExplorePage/DatePicker/DateRangeSelectorTabs";
import CustomFullWidthButton from "../../CustomFullWidthButton";
import {DateFilter, DatePickerState, getMonthNumberFromName, getWeekLimits} from "../../../../utils/dates";
import {Optional} from "../../../../utils/types";
import {dateTabs, halves, months} from "../../../../utils/filters";
import {DateMenuLevel} from "./MenuContentCustomDateRange";

interface InitialMenuContentCustomRangeProps {
  goBack: () => void;
  applyRanges: (dateObject: DateFilter) => void;
  selectedYear: number;
  selectedWeek: number;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  currentLevel: DateMenuLevel;
  setCurrentLevel: (level: DateMenuLevel) => void;
  subtitleText: string;
  setSubtitleText: (text: string) => void;
  innerValue: string | number;
  setInnerValue: (value: string | number) => void;
}

const InitialMenuContentCustomRange = ({
  goBack,
  applyRanges,
  selectedYear,
  selectedWeek,
  selectedTab,
  setSelectedTab,
  currentLevel,
  setCurrentLevel,
  subtitleText,
  setSubtitleText,
  innerValue,
  setInnerValue,
}: InitialMenuContentCustomRangeProps): ReactElement => {

  const goToYearSelectionScreen = () => setCurrentLevel(DateMenuLevel.SELECT_YEAR);

  const handleSelectTab = (newTab: string) => {
    setSelectedTab(newTab);
    if(newTab === dateTabs.WEEK) {
      setInnerValue(getWeekLimits(selectedYear, selectedWeek));
      setSubtitleText(`Week: ${selectedWeek}`);
    } else if(newTab === dateTabs.MONTH) {
      setInnerValue(months[0]);
      setSubtitleText('');
    } else if(newTab === dateTabs.HALF_YEAR) {
      setInnerValue(halves[0]);
      setSubtitleText('H1');
    }
  }

  const applyChanges = () => {
    let dateObject: DateFilter = {selectedYear};
    switch (selectedTab) {
      case dateTabs.MONTH:
        if(innerValue !== months[0]) {
          dateObject.selectedMonth = getMonthNumberFromName(innerValue as string) + 1;
        }
        break;
      case dateTabs.HALF_YEAR:
        dateObject.selectedSemester = subtitleText === 'H1' ? 1 : 2;
        break;
      case dateTabs.WEEK:
        dateObject.selectedWeek = selectedWeek - 1;
        break;
    }
    applyRanges(dateObject);
  }

  const goToSpecificTabPage = () => {
    let level: DateMenuLevel;
    switch (selectedTab) {
      case dateTabs.MONTH:
        level = DateMenuLevel.SELECT_MONTH;
        break;
      case dateTabs.HALF_YEAR:
        level = DateMenuLevel.SELECT_HALF;
        break;
      case dateTabs.WEEK:
        level = DateMenuLevel.SELECT_WEEK;
        break;
      default:
        level = currentLevel;
        break;
    }
    setCurrentLevel(level);
  }


  return (
    <div style={styles.MenuContentCustomRange}>
      <img src={GoBackIcon}
           style={styles.GoBackIcon}
           alt={'go-back'}
           onClick={goBack}
      />
      <p className={'fw-medium'} style={styles.Title}>Select custom range</p>
      <p className={'fw-regular'} style={styles.Subtitle}>Choose a year</p>
      <div style={styles.YearSelectorContainer} onClick={goToYearSelectionScreen}>
        <p>{selectedYear}</p>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      <p className={'fw-regular'} style={styles.Subtitle}>Choose a date range</p>
      <div style={styles.PickersContainer}>
        <DateRangeSelectorTabs selectedTab={selectedTab} selectDateTab={handleSelectTab}/>
        <div style={styles.DateRangeSelector} onClick={goToSpecificTabPage}>
          <div>
            <p className={'fw-regular'} style={styles.SelectedRangeTitle}>{innerValue}</p>
            {subtitleText && <p className={'fw-light'} style={styles.SelectedRangeSubtitle}>{subtitleText}</p>}
          </div>
          <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
        </div>
      </div>
      <CustomFullWidthButton text={'Apply'} onClick={applyChanges}/>
    </div>
  )
}

export default InitialMenuContentCustomRange;