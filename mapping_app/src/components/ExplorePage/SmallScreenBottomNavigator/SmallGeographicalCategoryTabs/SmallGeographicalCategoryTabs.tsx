import {ReactElement} from "react";
import {styles} from "./styles/GeographicalCategoryBottomTabs.style";
import {GeospacesTabs} from "../../../../utils/filters";

interface SmallGeographicalCategoryTabsProps {
  namespace: string;
  selectNamespace: (newNamespace: string) => void;
}

const SmallGeographicalCategoryTabs = ({
  namespace,
  selectNamespace
}: SmallGeographicalCategoryTabsProps): ReactElement => {

  const selectStates = () => selectNamespace(GeospacesTabs.STATES);
  const selectCounties = () => selectNamespace(GeospacesTabs.COUNTIES);
  const selectTribalTracts = () => selectNamespace(GeospacesTabs.TRIBAL_TRACTS);

  return (
    <div style={styles.GeographicalCategoryBottomTabsContainer}>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === GeospacesTabs.STATES, '28%')}
           onClick={selectStates}
      >
        States
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === GeospacesTabs.COUNTIES, '32%')}
           onClick={selectCounties}
      >
        Counties
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === GeospacesTabs.TRIBAL_TRACTS, '40%')}
           onClick={selectTribalTracts}
      >
        Tribal Lands
      </div>
    </div>
  )
}

export default SmallGeographicalCategoryTabs;