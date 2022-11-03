import {ReactElement} from "react";
import {styles} from "./styles/GeographicalCategoryBottomTabs.style";
import {tabs} from "../../../../utils/filters";

interface SmallGeographicalCategoryTabsProps {
  namespace: string;
  selectNamespace: (newNamespace: string) => void;
}

const SmallGeographicalCategoryTabs = ({
  namespace,
  selectNamespace
}: SmallGeographicalCategoryTabsProps): ReactElement => {

  const selectStates = () => selectNamespace(tabs.STATES);
  const selectCounties = () => selectNamespace(tabs.COUNTIES);
  const selectTribalTracts = () => selectNamespace(tabs.TRIBAL_TRACTS);

  return (
    <div style={styles.GeographicalCategoryBottomTabsContainer}>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === tabs.STATES)}
           onClick={selectStates}
      >
        States
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === tabs.COUNTIES)}
           onClick={selectCounties}
      >
        Counties
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === tabs.TRIBAL_TRACTS)}
           onClick={selectTribalTracts}
      >
        Tribal Lands
      </div>
    </div>
  )
}

export default SmallGeographicalCategoryTabs;