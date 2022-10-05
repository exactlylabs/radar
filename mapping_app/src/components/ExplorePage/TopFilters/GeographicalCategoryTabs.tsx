import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/GeographicalCategoryTabs.style";

export const tabs = {
  STATES: 'STATES',
  COUNTIES: 'COUNTIES',
  TRIBAL_TRACTS: 'TRIBAL_TRACTS',
}

interface GeographicalCategoryTabsProps {
  geospaceNamespace: string;
  setGeospaceNamespace: (namespace: string) => void;
}

const GeographicalCategoryTabs = ({
  geospaceNamespace,
  setGeospaceNamespace
}: GeographicalCategoryTabsProps): ReactElement => {

  const [selectedTab, setSelectedTab] = useState<string>(tabs.STATES)

  useEffect(() => {
    setSelectedTab(geospaceNamespace);
  }, [geospaceNamespace]);

  const selectStates = () => setGeospaceNamespace(tabs.STATES);

  const selectCounties = () => setGeospaceNamespace(tabs.COUNTIES);

  const selectTribalLands = () => setGeospaceNamespace(tabs.TRIBAL_TRACTS);

  return (
    <div style={styles.GeographicalCategoryTabsContainer}>
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