import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/TopLevelTabsHeader.style";
import MappingLogo from '../../assets/mapping-logo.png';
import TopLevelTabsHeaderTab from "./TopLevelTabsHeaderTab";
import {useLocation} from "react-router-dom";
import {paths} from "../../utils/routes";
import {buttonColors, buttonTextColors} from "../../utils/buttons";
import PinIcon from '../../assets/pin-icon.png';
import CustomButton from "../common/CustomButton";
import {handleError} from "../../api";
import CustomSpinner from "../common/CustomSpinner";
import {WHITE} from "../../styles/colors";
import './styles/RegionButton.css';
import NoGeolocationAlert from "./NoGeolocationAlert/NoGeolocationAlert";

interface TopLevelTabsHeaderProps {
  centerOnUser: (center: Array<number>) => void;
}

const TopLevelTabsHeader = ({centerOnUser}: TopLevelTabsHeaderProps): ReactElement => {

  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState(location.pathname);
  const [loading, setLoading] = useState(false);
  const [isNoGeolocationAlertOpen, setIsNoGeolocationAlertOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setSelectedTab(location.pathname);
  }, [location.pathname]);

  const onError = (err: GeolocationPositionError) => {
    setLoading(false);
    if(err.message === 'User denied Geolocation') openNoGeolocationAlert();
  }

  const centerOnUserPosition = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          const center: Array<number> = [pos.coords.latitude, pos.coords.longitude];
          centerOnUser(center);
          setLoading(false);
        },
        onError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }

  const openNoGeolocationAlert = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
      setIsNoGeolocationAlertOpen(true);
    }, 1000);
    setTimeout(() => { setIsClosing(true) }, 5000);
    setTimeout(() => {
      setIsClosing(false);
      setIsNoGeolocationAlertOpen(false);
    }, 6000);
  }

  return (
    <div style={styles.TopLevelTabsHeaderContainer}>
      <img src={MappingLogo} style={styles.MappingLogo} alt={'mapping-logo'}/>
      <TopLevelTabsHeaderTab text={'Explore the map'}
                             url={'explore'}
                             className={selectedTab === paths.EXPLORE ? '' : 'hover-opaque'}
                             selected={selectedTab === paths.EXPLORE}
      />
      {/* TODO: uncomment once about page is designed */}
      {/*<TopLevelTabsHeaderTab text={'About'}
                             url={'about'}
                             className={selectedTab === paths.ABOUT ? '' : 'hover-opaque'}
                             selected={selectedTab === paths.ABOUT}
      />*/}
      <div style={styles.RightSideButtonContainer}>
        {
          !loading ?
          <CustomButton text={'Check your region'}
                        icon={<img src={PinIcon} style={styles.PinIcon} alt={'pin-icon'}/>}
                        backgroundColor={buttonColors.BLACK}
                        color={buttonTextColors.WHITE}
                        iconFirst
                        onClick={centerOnUserPosition}
                        className={'fw-medium hover-opaque region-button'}
          /> :
          <CustomButton text={''}
                        icon={<CustomSpinner color={WHITE}/>}
                        backgroundColor={buttonColors.BLACK}
                        color={buttonTextColors.WHITE}
                        className={'region-button'}
          />
        }
      </div>
      <NoGeolocationAlert isOpen={isNoGeolocationAlertOpen}
                          isClosing={isClosing}
                          isOpening={isOpening}
      />
    </div>
  )
}

export default TopLevelTabsHeader;