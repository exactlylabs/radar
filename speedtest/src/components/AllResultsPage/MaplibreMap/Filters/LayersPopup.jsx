import { check } from 'prettier';
import styles from './layers_popup.module.css';
import checkIcon from '../../../../assets/check-icon.svg';
import helpIcon from '../../../../assets/help-icon.png';

export default function LayersPopup() {

  return (
    <div className={styles.container}>
      <div className={styles.title}>View by:</div>
      <div className={styles.optionsContainer}>
        <div className={styles.option} data-active={true}>
          Classification
          <img src={checkIcon} alt="check" width={16} height={16} />
        </div>
        <div className={styles.option}>Download speed</div>
        <div className={styles.option}>Upload speed</div>
      </div>
      <div className={styles.helpContainer}>
        <img src={helpIcon} alt="help" width={16} height={16} />
        <a href='#' className={styles.helpText}>How classification works</a>
      </div>
    </div>
  );
}