import {ReactElement} from "react";
import {styles} from "./styles/NoGeolocationAlert.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import './styles/NoGeolocationAlert.css'

interface NoGeoloactionAlertProps {
  isOpen: boolean;
  isOpening: boolean;
  isClosing: boolean;
}

const NoGeolocationAlert = ({isOpen, isOpening, isClosing}: NoGeoloactionAlertProps): ReactElement => {

  const {isSmallScreen, isTabletScreen} = useViewportSizes();

  const isSmall = isSmallScreen || isTabletScreen;

  const getClassName = () => {
    if(isSmall) {
      return `${isOpen ? 'alert-open-small' : 'alert-closed-small'} ${isOpening ? 'alert-opening-small' : ''} ${isClosing ? 'alert-closing-small' : ''}`;
    } else {
      return `${isOpen ? 'alert-open' : 'alert-closed'} ${isOpening ? 'alert-opening' : ''} ${isClosing ? 'alert-closing' : ''}`;
    }
  }

  return (
    <div id={'no-geolocation-alert'}
         className={getClassName()}
         style={styles.NoGeolocationAlert(isSmallScreen)}
    >
      <p className={'fw-light'} style={styles.Text}>Our website does not have permission to use your location. Please check your browser settings.</p>
    </div>
  )
}

export default NoGeolocationAlert;