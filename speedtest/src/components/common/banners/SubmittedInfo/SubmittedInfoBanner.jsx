import styles from './submitted_info_banner.module.css';
import greenCheck from '../../../../assets/green-check.png';

const SubmittedInfoBanner = () => (
  <div className={styles.banner}>
    <div className={styles.checkContainer}>
      <img src={greenCheck} width={16} height={16} alt={'green check'}/>
    </div>
    Thanks for joining us! We will get in touch soon.
  </div>
)

export default SubmittedInfoBanner;