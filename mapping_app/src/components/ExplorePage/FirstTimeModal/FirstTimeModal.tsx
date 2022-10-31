import {ReactElement} from "react";
import MyFullWidthButton from "../../common/MyFullWidthButton";
import {styles} from "./styles/FirstTimeModal.style";
import CloseIcon from '../../../assets/close-icon.png';
import FiltersIcon from '../../../assets/modal-row-filters-icon.png';
import LayersIcon from '../../../assets/modal-row-layers-icon.png';
import ExploreIcon from '../../../assets/modal-row-explore-icon.png';
import {speedTypes} from "../../../utils/speeds";

interface FirstTimeModalProps {
  closeModal: () => void;
}

const FirstTimeModal = ({ closeModal }: FirstTimeModalProps): ReactElement => {
  return (
    <>
      <div style={styles.BlurredBackground} onClick={closeModal}></div>
      <div style={styles.FirstTimeModal}>
        <img className={'hover-opaque'} src={CloseIcon} style={styles.CloseIcon} alt={'close-icon'} onClick={closeModal}/>
        <p className={'fw-medium'} style={styles.Title}>Explore the Map</p>
        <p className={'fw-light'} style={styles.Subtitle}>Use our mapping tool to see how broadband speeds vary across the country.</p>
        <div style={styles.Grid}>
          <div style={styles.Row}>
            <img src={FiltersIcon} style={styles.RowIcon} alt={'filters-icon'}/>
            <p className={'fw-light'} style={styles.RowText}><b className={'fw-medium'}>Filter the map</b> by download or upload speeds, time and provider.</p>
          </div>
          <div style={styles.Row}>
            <img src={LayersIcon} style={styles.RowIcon} alt={'filters-icon'}/>
            <div className={'fw-light'} style={styles.CustomRowText}>
              <div style={styles.CustomRowTextLine}><b className={'fw-medium'}>View</b><div style={styles.Ball(speedTypes.UNSERVED)}></div> unserved,<div style={styles.Ball(speedTypes.UNDERSERVED)}></div> underserved, </div>
              <div style={styles.CustomRowTextLine}>and<div style={styles.Ball(speedTypes.SERVED)}></div> served areas on the map.</div>
            </div>
          </div>
          <div style={styles.Row}>
            <img src={ExploreIcon} style={styles.RowIcon} alt={'filters-icon'}/>
            <p className={'fw-light'} style={styles.RowText}><b className={'fw-medium'}>Explore the U.S.A.</b> by states, counties and tribal lands.</p>
          </div>
        </div>
        <MyFullWidthButton text={`Let's go`} onClick={closeModal} className={'hover-opaque'}/>
      </div>
    </>
  )
}

export default FirstTimeModal;