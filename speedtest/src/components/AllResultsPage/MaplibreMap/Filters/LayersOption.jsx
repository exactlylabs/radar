import checkIcon from '../../../../assets/check-icon.svg';
import styles from './layers_popup.module.css';

export default function LayersOption({ name, isActive }) {
    return (
        <div className={styles.option} data-active={isActive}>
            {name}
            {isActive && <img src={checkIcon} alt="check" width={16} height={16} />}
        </div>
    );
}