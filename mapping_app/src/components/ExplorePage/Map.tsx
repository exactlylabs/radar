import React, {ReactElement, useEffect, useState} from "react";
import L, {control} from "leaflet";
import {MapContainer} from "react-leaflet";
import {styles} from "./styles/Map.style";
import {GeoJSONFilters} from "../../api/geojson/types";
import {GeospaceInfo} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import {Asn} from "../../api/asns/types";
import CustomMap from "./CustomMap/CustomMap";
import {useViewportSizes} from "../../hooks/useViewportSizes";
// @ts-ignore
import vectorTileLayer from 'leaflet-vector-tile-layer';
import {getVectorTilesUrl} from "../../api/tiles/requests";
import {getVectorTileOptions} from "../../utils/vectorTiles";
import FloatingPopover from "./FloatingPopover/FloatingPopover";
import zoom = control.zoom;

interface MapProps {
  namespace: string;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: Optional<GeospaceInfo>, center?: L.LatLng) => void;
  speedType: string;
  provider: Asn;
  calendarType: string;
  selectedSpeedFilters: Array<string>;
  initialZoom: number;
  setZoom: (zoom: number) => void;
  initialCenter: Array<number>;
  setCenter: (center: Array<number>) => void;
  setLoading: (value: boolean) => void;
  isRightPanelHidden: boolean;
  viewAllDetails: () => void;
  isFloatingPopoverOpen: boolean;
  closePopover: () => void;
}

const Map = ({
  namespace,
  selectedGeospace,
  selectGeospace,
  speedType,
  provider,
  selectedSpeedFilters,
  initialZoom,
  setZoom,
  initialCenter,
  setCenter,
  setLoading,
  isRightPanelHidden,
  calendarType,
  viewAllDetails,
  isFloatingPopoverOpen,
  closePopover
}: MapProps): ReactElement => {

  const {isSmallScreen, isTabletScreen} = useViewportSizes();

  const [tileLayer, setTileLayer] = useState(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    const filters: GeoJSONFilters = {
      speedType: speedType as string,
      calendar: calendarType as string,
      provider: provider as Asn,
    };
    setTileLayer(vectorTileLayer(
      getVectorTilesUrl(namespace.toLowerCase(), filters),
      getVectorTileOptions(selectedGeospace, speedType, selectedSpeedFilters)
    ));
    setLastUpdate(new Date());
    setLoading(false);
  }, [namespace, calendarType, provider, speedType]);

  return (
    <>
      {
        tileLayer ?
        <MapContainer center={{lat: initialCenter[0], lng: initialCenter[1]}}
                    zoom={initialZoom}
                    scrollWheelZoom
                    style={styles.MapContainer(isSmallScreen || isTabletScreen)}
        >
          <CustomMap selectedGeospace={selectedGeospace}
                     selectGeospace={selectGeospace}
                     speedType={speedType}
                     selectedSpeedFilters={selectedSpeedFilters}
                     setZoom={setZoom}
                     setCenter={setCenter}
                     center={initialCenter}
                     zoom={initialZoom}
                     isRightPanelHidden={isRightPanelHidden}
                     lastGeoJSONUpdate={lastUpdate}
                     vectorTileLayer={tileLayer}
                     viewAllDetails={viewAllDetails}
          />
          {
            isFloatingPopoverOpen && selectedGeospace &&
            <FloatingPopover selectedGeospace={selectedGeospace}
                             viewAllDetails={viewAllDetails}
                             speedType={speedType}
                             center={initialCenter}
                             zoom={initialZoom}
                             closePopover={closePopover}
            />
          }
        </MapContainer>
      :
        <div style={styles.SpinnerContainer}></div>
      }
    </>
  )
}

export default Map;