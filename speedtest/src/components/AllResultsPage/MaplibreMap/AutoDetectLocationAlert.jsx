import {useEffect, useRef} from "react";
import styles from './auto_detect_location_alert.module.css';
import close from '../../../assets/alert-close.svg';

const ANIMATION_DURATION = 290;
const AUTO_CLOSE_DURATION = 5000;

export default function AutoDetectLocationAlert({closeAlert}) {

  const alertRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      handleCloseAlert();
    }, AUTO_CLOSE_DURATION);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCloseAlert = () => {
    alertRef.current.classList.add(styles.slideOut);
    timeoutRef.current = setTimeout(() => {
      closeAlert();
      clearTimeout(timeoutRef.current);
    }, ANIMATION_DURATION);
  }

  return (
    <div className={styles.autoDetectAlert} ref={alertRef}>
      <div>
        <h6 className={styles.title}>Your location could not be detected.</h6>
        <p className={styles.subtitle}>Make sure your browser location is enabled.</p>
      </div>
      <button className={styles.closeButton} onClick={handleCloseAlert}>
        <img src={close} alt={'close'} width={12} height={12}/>
      </button>
    </div>
  )
}