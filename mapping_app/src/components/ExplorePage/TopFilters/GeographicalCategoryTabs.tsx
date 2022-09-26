import {ReactElement, useState} from "react";
import {styles} from "./styles/GeographicalCategoryTabs.style";

const tabs = {
  STATES: 'STATES',
  COUNTIES: 'COUNTIES',
  TRIBAL_LANDS: 'TRIBAL_LANDS',
}

const GeographicalCategoryTabs = ({

}): ReactElement => {

  const [selectedTab, setSelectedTab] = useState<string>(tabs.STATES)

  const selectStates = () => setSelectedTab(tabs.STATES);

  const selectCounties = () => setSelectedTab(tabs.COUNTIES);

  const selectTribalLands = () => setSelectedTab(tabs.TRIBAL_LANDS);

  return (
    <div style={styles.GeographicalCategoryTabsContainer()}>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === tabs.STATES)}
           onClick={selectStates}
      >
        States
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === tabs.COUNTIES)}
           onClick={selectCounties}
      >
        Counties
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === tabs.TRIBAL_LANDS)}
           onClick={selectTribalLands}
      >
        Tribal Lands
      </div>
    </div>
  )
}

export default GeographicalCategoryTabs;