import { check } from 'prettier';
import styles from './layers_popup.module.css';
import ClassificationFilter from './ClassificationFilter';
import helpIcon from '../../../../assets/help-icon.svg';
import LayersOption from './LayersOption';
import CloseModalButton from './common/CloseModalButton';

export default function LayersPopup({isOpen, toggleLayersPopup, layerSelected}) {

  return (
    <div className={styles.container} data-open={isOpen.toString()}>
      <div className={styles.closeButtonContainer}>
        <CloseModalButton onClick={toggleLayersPopup} />
      </div>
      <div className={styles.layersContainer}>
        <div className={styles.title}>View by:</div>
        <div className={styles.optionsContainer}>
          <LayersOption name="Classification" isActive={layerSelected === 'classification'} />
          <LayersOption name="Download speed" isActive={layerSelected === 'download-speed'} />
          <LayersOption name="Upload speed" isActive={layerSelected === 'upload-speed'} />
        </div>
      </div>
      <div className={styles.classificationContainer}>
        <div className={styles.title}>Include:</div>
        <ClassificationFilter />
      </div>
      <div className={styles.helpContainer}>
        <img src={helpIcon} alt="help" width={16} height={16} />
        <a href='#' className={styles.helpText}>How classification works</a>
      </div>
      <div className={styles.applyContainer}>
        <button className={styles.applyButton}>Apply</button>
      </div>
    </div>
  );
}