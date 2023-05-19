import {ReactElement} from "react";
import {styles} from "./styles/DateRangeSelectorTabs.style";
import {DateTabs} from "../../../utils/filters";

interface DateRangeSelectorTabsProps {
  selectedTab: string;
  selectDateTab: (tab: string) => void;
}

const DateRangeSelectorTabs = ({
  selectedTab,
  selectDateTab
}: DateRangeSelectorTabsProps): ReactElement => {

  const selectWeek = () => selectDateTab(DateTabs.WEEK);
  const selectMonth = () => selectDateTab(DateTabs.MONTH);
  const selectQuarter = () => selectDateTab(DateTabs.QUARTER);
  const selectHalfyear = () => selectDateTab(DateTabs.HALF_YEAR);

  return (
    <div style={styles.DateRangeSelectorTabs}>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === DateTabs.MONTH)}
           onClick={selectMonth}
      >
        Month
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === DateTabs.WEEK)}
           onClick={selectWeek}
      >
        Week
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === DateTabs.QUARTER)}
           onClick={selectQuarter}
      >
        Quarter
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === DateTabs.HALF_YEAR)}
           onClick={selectHalfyear}
      >
        Half-year
      </div>
    </div>
  )
}

export default DateRangeSelectorTabs;