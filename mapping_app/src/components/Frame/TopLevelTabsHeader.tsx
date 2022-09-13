import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/TopLevelTabsHeader.style";
import MappingLogo from '../../assets/mapping-logo.png';
import MyButton from "../common/MyButton";
import TopLevelTabsHeaderTab from "./TopLevelTabsHeaderTab";
import {buttonColors, buttonTextColors} from "../../utils/buttons";
import {Room} from "@mui/icons-material";
import {useLocation} from "react-router-dom";
import {paths} from "../../utils/routes";

const TopLevelTabsHeader = (): ReactElement => {

  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState(location.pathname);

  useEffect(() => {
    setSelectedTab(location.pathname);
  }, [location.pathname])

  return (
    <div style={styles.TopLevelTabsHeaderContainer()}>
      <img src={MappingLogo} style={styles.MappingLogo()} alt={'mapping-logo'}/>
      <TopLevelTabsHeaderTab text={'Explore the map'}
                             url={'explore'}
                             className={selectedTab === paths.EXPLORE ? '' : 'hover-opaque'}
                             selected={selectedTab === paths.EXPLORE}
      />
      <TopLevelTabsHeaderTab text={'About'}
                             url={'about'}
                             className={selectedTab === paths.ABOUT ? '' : 'hover-opaque'}
                             selected={selectedTab === paths.ABOUT}
      />
      <div style={styles.RightSideButtonContainer()}>
        {/* TODO: remove false flag once we have the functionality implemented */}
        {
          false &&
          <MyButton text={'Check your region'}
                    icon={<Room style={{marginRight: '4px'}}/>}
                    backgroundColor={buttonColors.BLACK}
                    color={buttonTextColors.WHITE}
                    iconFirst
                    onClick={() => console.log('Check your region!')}
          />
        }
      </div>
    </div>
  )
}

export default TopLevelTabsHeader;