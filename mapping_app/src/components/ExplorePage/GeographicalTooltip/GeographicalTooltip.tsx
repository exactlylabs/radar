import {ReactElement} from "react";
import {SelectedAreaInfo} from "../../../utils/types";
import {styles} from "./styles/GeographicalTooltipContainer.style";
import {speedTexts} from "../../../utils/speeds";
import {capitalize} from "../../../utils/strings";
import SpeedDataCell from "../RightPanel/SpeedDataCell";
import {ArrowDownwardRounded, ArrowForwardRounded, ArrowUpwardRounded} from "@mui/icons-material";
import MyButton from "../../common/MyButton";
import MyFullWidthButton from "../../common/MyFullWidthButton";
import {DEFAULT_GREEN, WHITE} from "../../../styles/colors";

interface GeographicalTooltipProps {
  areaInfo: SelectedAreaInfo;
}

const GeographicalTooltip = ({
  areaInfo
}: GeographicalTooltipProps): ReactElement => {
  return (
    <div style={styles.GeographicalTooltipContainer()}>
      <div style={styles.GeographicalTooltipContentWrapper()}>
        <div style={styles.Header()}>
          <div style={styles.TextContainer()}>
            <p className={'fw-medium'} style={styles.MainText()}>{areaInfo.name}</p>
            <p className={'fw-light'} style={styles.SecondaryText()}>{areaInfo.country}</p>
          </div>
          <div style={styles.SignalStateContainer()}>
            <div style={styles.SignalStateIndicator(areaInfo.signalState)}></div>
            <p className={'fw-regular'} style={styles.SignalStateText()}>{capitalize(areaInfo.signalState)}</p>
          </div>
        </div>
        <div style={styles.SpeedDataContainer()}>
          <SpeedDataCell icon={<ArrowDownwardRounded style={styles.Icon(areaInfo.signalState)}/>}
                         text={'Med. Download'}
                         value={areaInfo.medianDownload}
                         unit={'Mbps'}
          />
          <SpeedDataCell icon={<ArrowUpwardRounded style={styles.Icon()}/>}
                         text={'Med. Upload'}
                         value={areaInfo.medianUpload}
                         unit={'Mbps'}
          />
        </div>
        <div style={styles.ButtonContainer()}>
          <MyFullWidthButton text={`View ${areaInfo.name}`} icon={<ArrowForwardRounded style={styles.Arrow(WHITE)}/>} backgroundColor={DEFAULT_GREEN} color={WHITE}/>
        </div>
      </div>
    </div>
  )
}

export default GeographicalTooltip;