import {ReactElement} from "react";
import {styles} from "./styles/MyGenericModal.style";
import {Optional} from "../../../utils/types";
import CloseIconBlack from '../../../assets/close-icon-gray.png';

interface MyGenericModalProps {
  closeModal: () => void;
  children: Optional<ReactElement>;
  isDarker: boolean;
}

const CustomGenericModal = ({
  closeModal,
  children,
  isDarker
}: MyGenericModalProps): ReactElement => {
  return (
    <>
      <div style={styles.Underlay} onClick={closeModal}></div>
      <div style={styles.MyGenericModal(isDarker)}>
        <img className={'hover-opaque'}
             src={CloseIconBlack}
             onClick={closeModal}
             style={styles.CloseIcon}
             alt={'close-icon'}
        />
        {children}
      </div>
    </>
  )
}

export default CustomGenericModal;