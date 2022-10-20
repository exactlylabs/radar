import {ReactElement} from "react";
import {styles} from "./styles/DateRangeSelectorTabs.style";
import {dateTabs} from "../../../utils/filters";

interface DateRangeSelectorTabsProps {
  selectedTab: string;
  selectDateTab: (tab: string) => void;
}

const DateRangeSelectorTabs = ({
  selectedTab,
  selectDateTab
}: DateRangeSelectorTabsProps): ReactElement => {

  const selectWeek = () => selectDateTab(dateTabs.WEEK);
  const selectMonth = () => selectDateTab(dateTabs.MONTH);
  const selectQuarter = () => selectDateTab(dateTabs.QUARTER);
  const selectHalfyear = () => selectDateTab(dateTabs.HALF_YEAR);

  return (
    <div style={styles.DateRangeSelectorTabs}>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === dateTabs.MONTH)}
           onClick={selectMonth}
      >
        Month
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === dateTabs.WEEK)}
           onClick={selectWeek}
      >
        Week
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === dateTabs.QUARTER)}
           onClick={selectQuarter}
      >
        Quarter
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === dateTabs.HALF_YEAR)}
           onClick={selectHalfyear}
      >
        Halfyear
      </div>
    </div>
  )
}

export default DateRangeSelectorTabs;