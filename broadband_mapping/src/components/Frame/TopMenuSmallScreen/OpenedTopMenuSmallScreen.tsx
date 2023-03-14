import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/OpenedTopMenuSmallScreen.style";
import TopLevelTabsHeaderTab from "../TopLevelTabsHeaderTab";
import {paths} from "../../../utils/routes";
import PinIcon from "../../../assets/pin-icon.png";
import {buttonColors, buttonTextColors} from "../../../utils/buttons";
import {WHITE} from "../../../styles/colors";
import {useLocation} from "react-router-dom";
import SmallScreenTopMenuHorizontalDivider from "./SmallScreenTopMenuHorizontalDivider";
import AnthcLogo from "../../../assets/anthc-logo.png";
import ExactlyLogo from "../../../assets/exactly-logo.png";
import XlabLogo from "../../../assets/xlab-logo.png";
import {goToExactlyLabsWebsite} from "../../../utils/redirects";
import CustomButton from "../../common/CustomButton";
import CustomSpinner from "../../common/CustomSpinner";
import NoGeolocationAlert from "../NoGeolocationAlert/NoGeolocationAlert";

interface OpenedTopMenuSmallScreenProps {
  centerOnUser: (center: Array<number>) => void;
  closeMenu: () => void;
  setIsNoGeolocationAlertOpen: (value: boolean) => void;
  setIsOpening: (value: boolean) => void;
  setIsClosing: (value: boolean) => void;
}

const OpenedTopMenuSmallScreen = ({
  centerOnUser,
  closeMenu,
  setIsNoGeolocationAlertOpen,
  setIsOpening,
  setIsClosing
}: OpenedTopMenuSmallScreenProps): ReactElement => {

  const location = useLocation();

  const [selectedTab, setSelectedTab] = useState(location.pathname);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedTab(location.pathname);
  }, [location.pathname]);

  const onError = (err: GeolocationPositionError) => {
    setLoading(false);
    //handleError(new Error(err.message));
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
          closeMenu();
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
    <div style={styles.OpenedTopMenuContainer}>
      <SmallScreenTopMenuHorizontalDivider/>
      <div style={styles.TabsContainer}>
        <TopLevelTabsHeaderTab text={'Explore the map'}
                               url={'explore'}
                               className={selectedTab === paths.EXPLORE ? '' : 'hover-opaque'}
                               selected={selectedTab === paths.EXPLORE}
        />
        { /* Commented until we have an about page designed */ }
        { /* <div>About</div> */ }
      </div>
      <div style={styles.ButtonContainer}>
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
      <SmallScreenTopMenuHorizontalDivider/>
      {/* TODO: removing these until we have designs for both pages */}
      {/* <div style={styles.LinksContainer}>

        <a className={'fw-medium hover-opaque'} href={'/privacy'} style={styles.Link}>Privacy Policy</a>
        <a className={'fw-medium hover-opaque'} href={'/contact'} style={styles.Link}>Contact Us</a>
      </div>
      <SmallScreenTopMenuHorizontalDivider/> */}
      <div style={styles.AssociationsContainer}>
        <p className={'fw-light'} style={styles.AssociationText}>In association with:</p>
        <div style={styles.LogosContainer}>
          <img src={AnthcLogo} style={styles.AnthcLogo} alt={'ANTHC-logo'}/>
          <img src={ExactlyLogo} style={styles.ExactlyLogo} alt={'ANTHC-logo'} onClick={goToExactlyLabsWebsite}/>
          <img src={XlabLogo} style={styles.XlabLogo} alt={'ANTHC-logo'}/>
        </div>
        <p className={'fw-light'} style={styles.RightsText}>Broadband Mapping © 2022. All rights reserved.</p>
      </div>
    </div>
  )
}

export default OpenedTopMenuSmallScreen;