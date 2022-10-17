import {ReactElement} from "react";
import SpeedDataCell from "./SpeedDataCell";
import {styles} from "./styles/RightPanelSpeedData.style";
import DownloadIconGray from '../../../assets/download-icon-gray.png';
import DownloadIconUnserved from '../../../assets/download-icon-unserved.png';
import DownloadIconUnderserved from '../../../assets/download-icon-underserved.png';
import DownloadIconServed from '../../../assets/download-icon-served.png';
import UploadIconGray from '../../../assets/upload-icon-gray.png';
import UploadIconUnserved from '../../../assets/upload-icon-unserved.png';
import UploadIconUnderserved from '../../../assets/upload-icon-underserved.png';
import UploadIconServed from '../../../assets/upload-icon-served.png';
import LatencyIconGray from '../../../assets/latency-icon-gray.png';
import {speedTypes} from "../../../utils/speeds";


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

  const getDownloadIconSrc = () => {
    if(speedType !== 'Download') return DownloadIconGray;
    if(speedState === speedTypes.UNSERVED) return DownloadIconUnserved;
    else if(speedState === speedTypes.UNDERSERVED) return DownloadIconUnderserved;
    else return DownloadIconServed;
  }

  const getUploadIconSrc = () => {
    if(speedType !== 'Upload') return UploadIconGray;
    if(speedState === speedTypes.UNSERVED) return UploadIconUnserved;
    else if(speedState === speedTypes.UNDERSERVED) return UploadIconUnderserved;
    else return UploadIconServed;
  }

  return (
    <div style={styles.RightPanelSpeedDataContainer}>
      <SpeedDataCell icon={<img src={getDownloadIconSrc()} style={styles.Icon(speedState)} alt={'download-icon'}/>}
                     text={'Med. Download'}
                     value={medianDownload.toFixed(2)}
                     unit={'Mbps'}
      />
      <SpeedDataCell icon={<img src={getUploadIconSrc()} style={styles.Icon()} alt={'upload-icon'}/>}
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