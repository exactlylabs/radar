import styles from './styles/animated_banner.module.css';

const AnimatedBanner = ({children}) => {
  return (
    <div className={styles.banner}>
      {children}
    </div>
  );
}

export default AnimatedBanner;
