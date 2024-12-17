import styles from './classification_and_layers_panel.module.css';
import ClassificationFilter from './Filters/ClassificationFilter';
import LayersPopup from './Filters/LayersPopup';
import layersIcon from "../../../assets/layers-icon.svg";

export default function ClassificationAndLayersPanel({ isOpen, toggleLayersPopup, onHelpClick }) {

  return (
    <>
      <div className={styles.classificationAndLayersPanel} data-open={isOpen.toString()}>
        <div className={styles.classificationContainer}>
          <ClassificationFilter />
        </div>
        <div className={styles.layersContainer}>
          <div className={styles.layersIconContainer} onClick={toggleLayersPopup}>
            <img src={layersIcon} width={16} height={16} alt={'layers icon'}/>
          </div>
        </div>
      </div>
      <LayersPopup isOpen={isOpen} toggleLayersPopup={toggleLayersPopup} onHelpClick={onHelpClick} />
    </>
  );
}