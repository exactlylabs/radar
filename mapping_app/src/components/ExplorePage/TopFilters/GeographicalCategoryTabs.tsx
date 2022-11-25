import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/GeographicalCategoryTabs.style";
import {GeospacesTabs} from "../../../utils/filters";

interface GeographicalCategoryTabsProps {
  geospaceNamespace: string;
  setGeospaceNamespace: (namespace: string) => void;
  isRightPanelHidden: boolean;
}

const GeographicalCategoryTabs = ({
  geospaceNamespace,
  setGeospaceNamespace,
  isRightPanelHidden
}: GeographicalCategoryTabsProps): ReactElement => {

  const [selectedTab, setSelectedTab] = useState<string>(GeospacesTabs.STATES)

  useEffect(() => {
    setSelectedTab(geospaceNamespace);
  }, [geospaceNamespace]);

  const selectStates = () => setGeospaceNamespace(GeospacesTabs.STATES);

  const selectCounties = () => setGeospaceNamespace(GeospacesTabs.COUNTIES);

  const selectTribalLands = () => setGeospaceNamespace(GeospacesTabs.TRIBAL_TRACTS);

  return (
    <div style={styles.GeographicalCategoryTabsContainer(isRightPanelHidden)}>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === GeospacesTabs.STATES)}
           onClick={selectStates}
      >
        States
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === GeospacesTabs.COUNTIES)}
           onClick={selectCounties}
      >
        Counties
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.Tab(selectedTab === GeospacesTabs.TRIBAL_TRACTS)}
           onClick={selectTribalLands}
      >
        Tribal Lands
      </div>
    </div>
  )
}

export default GeographicalCategoryTabs;