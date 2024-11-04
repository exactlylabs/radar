import styles from './custom_modal.module.css';
import {useContext, useEffect} from "react";
import ConfigContext from "../../../context/ConfigContext";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import closeModalIcon from '../../../assets/close-icon.png';

const CustomModal = ({isOpen, closeModal, responsive, children}) => {

  const {isExtraSmallSizeScreen, isSmallSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);

  useEffect(() => {
    if(isOpen) window.addEventListener('keydown', handleCloseModalWithEscapeKey);
    else window.removeEventListener('keydown', handleCloseModalWithEscapeKey)

    return () => {
      window.removeEventListener('keydown', handleCloseModalWithEscapeKey)
    }

  }, [isOpen]);

  function handleCloseModalWithEscapeKey(e) {
    if(e.key === 'Escape') {
      closeModal();
    }
  }

  const getModalAvailableSpace = () => {
    const mainFrameElement = document.getElementById('speedtest--frame--main-frame-wrapper');
    if (mainFrameElement) {
      const {width, height, top} = mainFrameElement.getBoundingClientRect();
      return { width, height, top };
    }
  }

  return (
    <div className={styles.modalContainer}
         data-hidden={!isOpen}
         style={getModalAvailableSpace()}
    >
      <div className={styles.underlay} onClick={closeModal}></div>
      <div className={styles.modal} data-responsive={responsive?.toString() ?? 'false'}>
        {children}
        <button className={styles.closeButton} onClick={closeModal}>
          <img src={closeModalIcon} height={12} width={12} alt={'close modal button'}/>
        </button>
      </div>
    </div>
  )
}

export default CustomModal;