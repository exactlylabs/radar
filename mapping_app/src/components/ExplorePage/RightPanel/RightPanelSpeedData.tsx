import {ReactElement} from "react";
import SpeedDataCell from "./SpeedDataCell";
import {styles} from "./styles/RightPanelSpeedData.style";
import LatencyIconGray from '../../../assets/latency-icon-gray.png';
import {getDownloadIconSrc, getUploadIconSrc} from "../../../utils/speeds";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface RightPanelSpeedDataProps {
  speedState: string;
  medianDownload: number;
  medianUpload: number;
  medianLatency: number;
  speedType: string,
}

const RightPanelSpeedData = ({
  speedState,
  medianDownload,
  medianUpload,
  medianLatency,
  speedType,
}: RightPanelSpeedDataProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isSmallTabletScreen;

  return (
    <div style={styles.RightPanelSpeedDataContainer(isSmall)}>
      <SpeedDataCell icon={<img src={getDownloadIconSrc(speedType, speedState)} style={styles.Icon(speedState)} alt={'download-icon'}/>}
                     text={'Med. Download'}
                     value={medianDownload.toFixed(2)}
                     unit={'Mbps'}
      />
      <SpeedDataCell icon={<img src={getUploadIconSrc(speedType, speedState)} style={styles.Icon()} alt={'upload-icon'}/>}
                     text={'Med. Upload'}
                     value={medianUpload.toFixed(2)}
                     unit={'Mbps'}
      />
      <SpeedDataCell icon={<img src={LatencyIconGray} style={styles.Icon()} alt={'latency-icon'}/>}
                     text={'Med. Latency'}
                     value={medianLatency.toFixed(2)}
                     unit={'ms'}
      />
    </div>
  )
}

export default RightPanelSpeedData;