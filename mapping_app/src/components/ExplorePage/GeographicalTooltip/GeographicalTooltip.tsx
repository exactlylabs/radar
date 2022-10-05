import {ReactElement} from "react";
import {styles} from "./styles/GeographicalTooltipContainer.style";
import {capitalize} from "../../../utils/strings";
import SpeedDataCell from "../RightPanel/SpeedDataCell";
import {ArrowDownwardRounded, ArrowUpwardRounded} from "@mui/icons-material";
import {GeospaceOverview} from "../../../api/geospaces/types";
import {getSignalStateDownload, getSignalStateUpload} from "../../../utils/speeds";

interface GeographicalTooltipProps {
  geospace: GeospaceOverview;
  speedType: string;
}

const GeographicalTooltip = ({
  geospace,
  speedType
}: GeographicalTooltipProps): ReactElement => {

  const getCorrespondingSignalState = () => {
    return speedType === 'Download' ?
      getSignalStateDownload(geospace.download_median) :
      getSignalStateUpload(geospace.upload_median);
  }

  return (
    <div style={styles.GeographicalTooltipContainer}>
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
          <SpeedDataCell icon={<ArrowDownwardRounded style={styles.Icon(getCorrespondingSignalState())}/>}
                         text={'Med. Download'}
                         value={geospace.download_median.toFixed(2)}
                         unit={'Mbps'}
          />
          <SpeedDataCell icon={<ArrowUpwardRounded style={styles.Icon()}/>}
                         text={'Med. Upload'}
                         value={geospace.upload_median.toFixed(2)}
                         unit={'Mbps'}
          />
        </div>
      </div>
    </div>
  )
}

export default GeographicalTooltip;