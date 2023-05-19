import {ReactElement} from "react";
import {styles} from "./styles/GeographicalTooltipContainer.style";
import './styles/GeographicalTooltipContainer.css';
import {capitalize} from "../../../utils/strings";
import SpeedDataCell from "../RightPanel/SpeedDataCell";
import {GeospaceOverview} from "../../../api/geospaces/types";
import {getSignalStateDownload, getSignalStateUpload} from "../../../utils/speeds";
import DownloadIconGray from '../../../assets/download-icon-gray.png';
import UploadIconGray from '../../../assets/upload-icon-gray.png';
import {SpeedFilters} from "../../../utils/filters";

interface GeographicalTooltipProps {
  geospace: GeospaceOverview;
  speedType: string;
}

const GeographicalTooltip = ({
  geospace,
  speedType
}: GeographicalTooltipProps): ReactElement => {

  const getCorrespondingSignalState = () => {
    return speedType === SpeedFilters.DOWNLOAD ?
      getSignalStateDownload(geospace.download_median) :
      getSignalStateUpload(geospace.upload_median);
  }

  return (
    <div style={styles.GeographicalTooltipContainer} id={'geographical-tooltip--container'}>
      <div style={styles.GeographicalTooltipContentWrapper}>
        <div style={styles.Header}>
          <div style={styles.TextContainer}>
            <p className={'fw-medium'} style={styles.MainText}>{geospace.geospace.name}</p>
            <p className={'fw-light'} style={styles.SecondaryText}>{'U.S.A.'}</p>
          </div>
          <div style={styles.SignalStateContainer}>
            <div style={styles.SignalStateIndicator(getCorrespondingSignalState())}></div>
            <p className={'fw-regular'} style={styles.SignalStateText}>{capitalize(getCorrespondingSignalState())}</p>
          </div>
        </div>
        <div style={styles.SpeedDataContainer}>
          <SpeedDataCell icon={<img src={DownloadIconGray} style={styles.Icon(getCorrespondingSignalState())} alt={'download-icon'}/>}
                         text={'Med. Download'}
                         value={geospace.download_median.toFixed(2)}
                         unit={'Mbps'}
                         smallVersion
          />
          <SpeedDataCell icon={<img src={UploadIconGray} style={styles.Icon()} alt={'upload-icon'}/>}
                         text={'Med. Upload'}
                         value={geospace.upload_median.toFixed(2)}
                         unit={'Mbps'}
                         smallVersion
          />
        </div>
      </div>
    </div>
  )
}

export default GeographicalTooltip;