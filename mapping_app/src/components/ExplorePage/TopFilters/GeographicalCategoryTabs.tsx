import {ReactElement, useState} from "react";
import {styles} from "./styles/GeographicalCategoryTabs.style";

const tabs = {
  STATES: 'STATES',
  COUNTIES: 'COUNTIES',
  TRIBAL_TRACTS: 'TRIBAL_TRACTS',
}

interface GeographicalCategoryTabsProps {
  setGeospaceNamespace: (namespace: string) => void;
}

const GeographicalCategoryTabs = ({
  setGeospaceNamespace
}: GeographicalCategoryTabsProps): ReactElement => {

  const [selectedTab, setSelectedTab] = useState<string>(tabs.STATES)

  const selectStates = () => {
    setSelectedTab(tabs.STATES);
    setGeospaceNamespace(tabs.STATES.toLowerCase());
  }

  const selectCounties = () => {
    setSelectedTab(tabs.COUNTIES);
    setGeospaceNamespace(tabs.COUNTIES.toLowerCase());
  }

  const selectTribalLands = () => {
    setSelectedTab(tabs.TRIBAL_TRACTS);
    setGeospaceNamespace(tabs.TRIBAL_TRACTS.toLowerCase());
  }

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
           style={styles.Tab(selectedTab === tabs.TRIBAL_TRACTS)}
           onClick={selectTribalLands}
      >
        Tribal Lands
      </div>
    </div>
  )
}

export default GeographicalCategoryTabs;