import styles from './join_us_banner.module.css';
import arrowRightBlue from '../../../../assets/right-arrow-blue.png';

const JoinUsBanner = ({openModal}) => (
  <button className={styles.banner} onClick={openModal}>
    Help us understand broadband in your region.
    <span className={styles.link}>Join us</span>
    <img className={styles.arrowIcon} src={arrowRightBlue} width={14} height={14} alt={'blue arrow right'}/>
  </button>
);

export default JoinUsBanner;