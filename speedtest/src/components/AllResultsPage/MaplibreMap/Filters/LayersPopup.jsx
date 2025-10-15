import { check } from 'prettier';
import styles from './layers_popup.module.css';
import ClassificationFilter from './ClassificationFilter';
import helpIcon from '../../../../assets/help-icon.svg';
import LayersOption from './LayersOption';
import CloseModalButton from './common/CloseModalButton';
import {useContext} from "react";
import FiltersContext, {VIEW_BY} from "../../../../context/FiltersContext";
import { useTranslation } from 'react-i18next';

export default function LayersPopup({isOpen, toggleLayersPopup, onHelpClick}) {
  const { t } = useTranslation();
  const { filters, setViewBy } = useContext(FiltersContext);
  const { viewBy } = filters;

  const selectOption = (option) => {
    if (viewBy !== option) {
      setViewBy(option);
    }
  }

  return (
    <div className={styles.container} data-open={isOpen.toString()}>
      <div className={styles.closeButtonContainer}>
        <CloseModalButton onClick={toggleLayersPopup} />
      </div>
      <div className={styles.layersContainer}>
        <div className={styles.title}>{t('map.filters.layers.viewBy')}</div>
        <div className={styles.optionsContainer}>
          <LayersOption name={t('map.filters.layers.classification')}
            handleSelectOption={() => selectOption(VIEW_BY.CLASSIFICATION)}
            isActive={viewBy === VIEW_BY.CLASSIFICATION}
          />
          <LayersOption name={t('map.filters.layers.downloadSpeed')}
            handleSelectOption={() => selectOption(VIEW_BY.DOWNLOAD)}
            isActive={viewBy === VIEW_BY.DOWNLOAD}
          />
          <LayersOption name={t('map.filters.layers.uploadSpeed')}
            handleSelectOption={() => selectOption(VIEW_BY.UPLOAD)}
            isActive={viewBy === VIEW_BY.UPLOAD}
          />
        </div>
      </div>
      <div className={styles.classificationContainer}>
        <div className={styles.title}>{t('map.filters.layers.include')}</div>
        <ClassificationFilter />
      </div>
      <div className={styles.helpContainer}>
        <img src={helpIcon} alt="help" width={16} height={16} />
        <button onClick={onHelpClick} className={styles.helpButton}>{t('map.filters.layers.helpButton')}</button>
      </div>
      <div className={styles.applyContainer}>
        <button className={styles.applyButton} onClick={toggleLayersPopup}>{t('map.filters.layers.apply')}</button>
      </div>
    </div>
  );
}