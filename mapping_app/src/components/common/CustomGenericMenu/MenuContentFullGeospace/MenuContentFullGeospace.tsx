import {ReactElement} from "react";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../../api/geospaces/types";
import {getSignalState} from "../../../../utils/filters";
import {styles} from "./styles/MenuContentFullGeospace.style";
import './styles/MenuContentFullGeospace.css';
import {Asn} from "../../../../api/asns/types";
import {DateFilter} from "../../../../utils/dates";
import MenuFullGeospaceLoader from "./MenuFullGeospaceLoader";
import MenuContentFullGeospaceLoaded from "./MenuContentFullGeospaceLoaded";

interface MenuContentFullGeospaceProps {
  geospace: GeospaceOverview;
  setSelectedGeoSpaceInfo: (value: GeospaceInfo) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  speedType: string;
  setSpeedType: (value: string) => void;
  calendarType: string;
  setCalendarType: (value: string) => void;
  provider: Asn;
  setProvider: (value: Asn) => void;
  applyRanges: (dateObject: DateFilter) => void;
}

const MenuContentFullGeospace = ({
  geospace,
  setSelectedGeoSpaceInfo,
  loading,
  setLoading,
  speedType,
  setSpeedType,
  calendarType,
  setCalendarType,
  provider,
  setProvider,
  applyRanges,
}: MenuContentFullGeospaceProps): ReactElement => {

  const getName = (): string => {
    if(isGeospaceData(geospace)) {
      if(geospace.state) return geospace.state as string;
      else return geospace.county as string;
    } else {
      const info: GeospaceOverview = geospace as GeospaceOverview;
      return info.geospace.name;
    }
  }

  return (
    <div style={styles.MenuFullGeospaceContentContainer}>
      {
        loading ?
          <MenuFullGeospaceLoader geospaceName={getName()}
                                  parentName={(geospace as GeospaceOverview).geospace.parent?.name}
                                  stateSignalState={getSignalState(speedType as string, geospace)}
                                  country={'U.S.A'}
          /> :
          <MenuContentFullGeospaceLoaded geospace={geospace}
                                         setSelectedGeoSpaceInfo={setSelectedGeoSpaceInfo}
                                         setLoading={setLoading}
                                         speedType={speedType}
                                         setSpeedType={setSpeedType}
                                         calendarType={calendarType}
                                         setCalendarType={setCalendarType}
                                         provider={provider}
                                         setProvider={setProvider}
                                         applyRanges={applyRanges}
                                         geospaceName={getName()}
          />
      }
    </div>
  )
}

export default MenuContentFullGeospace;