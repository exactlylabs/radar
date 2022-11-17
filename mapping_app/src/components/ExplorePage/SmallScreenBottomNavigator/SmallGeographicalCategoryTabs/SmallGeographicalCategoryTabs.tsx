import {ReactElement} from "react";
import {styles} from "./styles/GeographicalCategoryBottomTabs.style";
import {tabs} from "../../../../utils/filters";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

interface SmallGeographicalCategoryTabsProps {
  namespace: string;
  selectNamespace: (newNamespace: string) => void;
  isRightPanelOpen: boolean;
}

const SmallGeographicalCategoryTabs = ({
  namespace,
  selectNamespace,
  isRightPanelOpen
}: SmallGeographicalCategoryTabsProps): ReactElement => {

  const {isLargeTabletScreen} = useViewportSizes();

  const selectStates = () => selectNamespace(tabs.STATES);
  const selectCounties = () => selectNamespace(tabs.COUNTIES);
  const selectTribalTracts = () => selectNamespace(tabs.TRIBAL_TRACTS);

  return (
    <div style={styles.GeographicalCategoryBottomTabsContainer(isLargeTabletScreen, isRightPanelOpen)}>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === tabs.STATES, '28%')}
           onClick={selectStates}
      >
        States
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === tabs.COUNTIES, '32%')}
           onClick={selectCounties}
      >
        Counties
      </div>
      <div className={'fw-regular hover-opaque'}
           style={styles.TabContainer(namespace === tabs.TRIBAL_TRACTS, '40%')}
           onClick={selectTribalTracts}
      >
        Tribal Lands
      </div>
    </div>
  )
}

export default SmallGeographicalCategoryTabs;