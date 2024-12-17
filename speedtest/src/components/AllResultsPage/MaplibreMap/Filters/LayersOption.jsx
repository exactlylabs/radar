import checkIcon from '../../../../assets/check-icon.svg';
import styles from './layers_popup.module.css';

export default function LayersOption({ name, isActive, handleSelectOption }) {
  return (
    <button className={styles.option}
      data-active={isActive}
      onClick={handleSelectOption}
    >
      {name}
      <img src={checkIcon} alt="check" width={16} height={16} />
    </button>
  );
}