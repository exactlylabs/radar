import {ReactElement} from "react";
import {GeospaceInfo, GeospaceOverview} from "../../../../api/geospaces/types";
import {styles} from "./styles/MenuContentGeospace.style";
import {capitalize} from "../../../../utils/strings";
import SpeedDataCell from "../../../ExplorePage/RightPanel/SpeedDataCell";
import DownloadIconGray from "../../../../assets/download-icon-gray.png";
import UploadIconGray from "../../../../assets/upload-icon-gray.png";
import {
  getDownloadIconSrc,
  getSignalStateDownload,
  getSignalStateUpload,
  getUploadIconSrc
} from "../../../../utils/speeds";
import MyFullWidthButton from "../../MyFullWidthButton";
import ArrowRight from '../../../../assets/arrow-right.png';
import {BLACK, WHITE} from "../../../../styles/colors";

interface MenuContentGeospaceProps {
  geospace: GeospaceOverview;
  speedType: string;
  openFullMenu: () => void;
}

const MenuContentGeospace = ({
  geospace,
  speedType,
  openFullMenu
}: MenuContentGeospaceProps): ReactElement => {

  const speedState = speedType === 'Download' ?
      getSignalStateDownload(geospace.download_median) :
      getSignalStateUpload(geospace.upload_median);

  return (
    <div style={styles.MenuContentGeospace}>
      <div style={styles.Header}>
        <div style={styles.TextContainer}>
          <p className={'fw-medium'} style={styles.MainText}>{geospace.geospace.name}</p>
          <p className={'fw-light'} style={styles.SecondaryText}>{'U.S.A.'}</p>
        </div>
        <div style={styles.SignalStateContainer}>
          <div style={styles.SignalStateIndicator(speedState)}></div>
          <p className={'fw-regular'} style={styles.SignalStateText}>{capitalize(speedState)}</p>
        </div>
      </div>
      <div style={styles.SpeedDataContainer}>
        <SpeedDataCell icon={<img src={getDownloadIconSrc(speedType, speedState)} style={styles.Icon(speedState)} alt={'download-icon'}/>}
                       text={'Med. Download'}
                       value={geospace.download_median.toFixed(2)}
                       unit={'Mbps'}
        />
        <SpeedDataCell icon={<img src={getUploadIconSrc(speedType, speedState)} style={styles.Icon(speedState)} alt={'download-icon'}/>}
                       text={'Med. Upload'}
                       value={geospace.upload_median.toFixed(2)}
                       unit={'Mbps'}
        />
      </div>
      <div style={styles.ButtonContainer}>
        <MyFullWidthButton backgroundColor={BLACK}
                           color={WHITE}
                           text={'View all details'}
                           icon={<img src={ArrowRight} style={styles.ArrowRight} alt={'arrow-right'}/>}
                           onClick={openFullMenu}
        />
      </div>
      <div style={styles.FooterTextContainer}>
        <p className={'fw-regular'} style={styles.FooterText}>View latency, speed distribution and other data.</p>
      </div>
    </div>
  )
}

export default MenuContentGeospace;