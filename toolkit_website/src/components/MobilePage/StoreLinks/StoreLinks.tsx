import { ReactElement } from "react";
import { styles } from "./styles/StoreLinks.style";
import { useViewportSizes } from "../../../hooks/useViewportSizes";

const GooglePlayIcon = '/assets/images/google-play-icon.png';
const AppStoreIcon = '/assets/images/appstore-icon.png';

const StoreLinks = (): ReactElement => {
  
  const {isSmallScreen} = useViewportSizes();

  return (
    <div style={styles.StoreLinks(isSmallScreen)}>
      <a href="https://apps.apple.com/id/app/radar-speed-test/id1660999617" target="_blank" rel="noreferrer">
        <img src={AppStoreIcon} style={styles.StoreIcon} alt={'appstore icon'} />
      </a>
      <a href="https://play.google.com/store/apps/details?id=org.anthc.radar&hl=en_US&pli=1" target="_blank" rel="noreferrer">
        <img src={GooglePlayIcon} style={styles.StoreIcon} alt={'google play icon'}/>
      </a>
    </div>
  );
}

export default StoreLinks;