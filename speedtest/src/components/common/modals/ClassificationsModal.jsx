import image from "../../../assets/classifications-image.svg";
import styles from "./classifications_modal.module.css";
import sharedModalStyles from "./shared_modals.module.css";

export default function ClassificationsModal({closeModal}) {
  return (
    <>
      <img src={image} alt={'Classifications Modal Image'} className={sharedModalStyles.mainImage}/>
      <h5 className={sharedModalStyles.header}>Understanding classification</h5>
      <p className={sharedModalStyles.subtext}>Test results are classified based on the lower value of either the
        download or upload speeds.</p>
      <div className={styles.bulletsContainer}>
        <p className={styles.subtextBullet}><span>Unserved: </span>0-25 Mbps download, 0-3 Mbps upload</p>
        <p className={styles.subtextBullet}><span>Underserved: </span>25-100 Mbps download, 3-20 Mbps upload</p>
        <p className={styles.subtextBullet}><span>Served: </span>100+ Mbps download, 20+ Mbps upload</p>
        <p className={styles.subtextBullet}><span>No Internet: </span>no service available</p>
      </div>
    </>
  )
}