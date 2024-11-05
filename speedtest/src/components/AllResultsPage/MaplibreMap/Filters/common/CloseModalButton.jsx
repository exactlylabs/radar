import styles from './close_modal_button.module.css';
import closeIcon from '../../../../../assets/alert-close.svg';

export default function CloseModalButton({ onClick }) {
    return (
        <button className={styles.closeButton} onClick={onClick}>
            <img src={closeIcon} width={12} height={12} alt={'close icon'} />
        </button>
    );
}