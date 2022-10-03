import {ReactElement} from "react";
import SpeedDataCell from "./SpeedDataCell";
import {ArrowDownwardRounded, ArrowUpwardRounded, CompareArrowsRounded} from "@mui/icons-material";
import {styles} from "./styles/RightPanelSpeedData.style";

interface RightPanelSpeedDataProps {
  speedState: string;
  medianDownload: number;
  medianUpload: number;
  medianLatency: number;
}

const RightPanelSpeedData = ({
  speedState,
  medianDownload,
  medianUpload,
  medianLatency,
}: RightPanelSpeedDataProps): ReactElement => {

  return (
    <div style={styles.RightPanelSpeedDataContainer()}>
      <SpeedDataCell icon={<ArrowDownwardRounded style={styles.Icon(speedState)}/>}
                     text={'Med. Download'}
                     value={medianDownload.toFixed(2)}
                     unit={'Mbps'}
      />
      <SpeedDataCell icon={<ArrowUpwardRounded style={styles.Icon()}/>}
                     text={'Med. Upload'}
                     value={medianUpload.toFixed(2)}
                     unit={'Mbps'}
      />
      <SpeedDataCell icon={<CompareArrowsRounded style={styles.Icon()}/>}
                     text={'Med. Latency'}
                     value={medianLatency.toFixed(2)}
                     unit={'ms'}
      />
    </div>
  )
}

export default RightPanelSpeedData;