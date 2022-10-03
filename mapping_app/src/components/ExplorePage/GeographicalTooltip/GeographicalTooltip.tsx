import {ReactElement} from "react";
import {SelectedAreaInfo} from "../../../utils/types";
import {styles} from "./styles/GeographicalTooltipContainer.style";
import {capitalize} from "../../../utils/strings";
import SpeedDataCell from "../RightPanel/SpeedDataCell";
import {ArrowDownwardRounded, ArrowForwardRounded, ArrowUpwardRounded} from "@mui/icons-material";
import MyFullWidthButton from "../../common/MyFullWidthButton";
import {DEFAULT_GREEN, WHITE} from "../../../styles/colors";
import {GeospaceOverview} from "../../../api/geospaces/types";
import {getSignalStateDownload} from "../../../utils/speeds";

interface GeographicalTooltipProps {
  geospace: GeospaceOverview;
}

const GeographicalTooltip = ({
  geospace
}: GeographicalTooltipProps): ReactElement => {
  return (
    <div style={styles.GeographicalTooltipContainer()}>
      <div style={styles.GeographicalTooltipContentWrapper()}>
        <div style={styles.Header()}>
          <div style={styles.TextContainer()}>
            <p className={'fw-medium'} style={styles.MainText()}>{geospace.geospace.name}</p>
            <p className={'fw-light'} style={styles.SecondaryText()}>{'U.S.A.'}</p>
          </div>
          <div style={styles.SignalStateContainer()}>
            <div style={styles.SignalStateIndicator(getSignalStateDownload(geospace.download_median))}></div>
            <p className={'fw-regular'} style={styles.SignalStateText()}>{capitalize(getSignalStateDownload(geospace.download_median))}</p>
          </div>
        </div>
        <div style={styles.SpeedDataContainer()}>
          <SpeedDataCell icon={<ArrowDownwardRounded style={styles.Icon(getSignalStateDownload(geospace.download_median))}/>}
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
        {/*<div style={styles.ButtonContainer()}>
          <MyFullWidthButton text={`View ${geospace.geospace.name}`} icon={<ArrowForwardRounded style={styles.Arrow(WHITE)}/>} backgroundColor={DEFAULT_GREEN} color={WHITE}/>
        </div>*/}
      </div>
    </div>
  )
}

export default GeographicalTooltip;