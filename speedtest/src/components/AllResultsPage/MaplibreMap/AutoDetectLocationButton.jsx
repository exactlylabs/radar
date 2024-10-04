import {useState} from "react";
import styles from './auto_detect_location.module.css';
import autoDetectImage from '../../../assets/auto-detect-location.svg';
import spinner from '../../../assets/loading-auto-location-spinner.svg';
import AutoDetectLocationAlert from "./AutoDetectLocationAlert";

export default function AutoDetectLocationButton({useLocation}) {

  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAutoDetectLocation = () => {
    setLoading(true);
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          useLocation({lat, lng});
          setLoading(false);
        },
        () => {
          setAlertOpen(true);
          setLoading(false);
        });
    } else {
      setAlertOpen(true);
      setLoading(false);
    }
  }

  return (
    <>
      { alertOpen && <AutoDetectLocationAlert closeAlert={() => { setAlertOpen(false) }}/> }
      <button className={styles.autoDetectButton}
              onClick={handleAutoDetectLocation}
              disabled={loading}
      >
        <img src={loading ? spinner : autoDetectImage}
             className={loading ? styles.spinner : styles.autoDetectImage} alt={'auto detect location'} width={16} height={16}/>
      </button>
    </>
  )
}
