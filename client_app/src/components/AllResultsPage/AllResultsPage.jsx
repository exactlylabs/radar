import React, { useEffect, useState, useContext } from 'react';
import { CircularProgress } from '@mui/material';
import { MyButton } from '../common/MyButton';
import {MapContainer, TileLayer, ZoomControl} from 'react-leaflet';
import { STEPS } from '../../constants';
import SpeedResultsBox from './SpeedResultsBox';
import {getCorrespondingFilterTag} from '../../utils/speeds';
import {
  DEFAULT_FALLBACK_LATITUDE,
  DEFAULT_FALLBACK_LONGITUDE,
  mapTileAttribution,
  mapTileUrl,
} from '../../utils/map';
import {getAllSpeedTests, getUserApproximateCoordinates} from '../../utils/apiRequests';
import { MyMap } from '../common/MyMap';
import MyCustomMarker from "./MyCustomMarker";
import {notifyError} from "../../utils/errors";
import {useMobile} from "../../hooks/useMobile";
import ConfigContext from "../../context/ConfigContext";
import {useSmall} from "../../hooks/useSmall";

const mapWrapperStyle = {
  width: '100%',
  position: 'relative',
  height: '100%',
}

const AllResultsPage = ({ givenLocation, setStep, maxHeight }) => {

  const [requestArea, setRequestArea] = useState([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [centerCoordinatesLoading, setCenterCoordinatesLoading] = useState(true);
  const [selectedFilterType, setSelectedFilterType] = useState('download');

  const isMobile = useMobile();
  const isSmall = useSmall();
  const config = useContext(ConfigContext);

  useEffect(() => {

    const fetchSpeedTests = async () => {
      const speedTests = await getAllSpeedTests();
      setResults(speedTests);
    }

    const fetchUserApproximateCoordinates = async () => {
      const coordinates = await getUserApproximateCoordinates();
      if(coordinates.length > 0) {
        setRequestArea(coordinates);
      }
    }

    fetchSpeedTests()
      .catch(err => {
        notifyError(err);
        setError('Failed to fetch speed tests. Please try again later.');
      })
      .finally(() => setLoading(false));

    if(!givenLocation) {
      fetchUserApproximateCoordinates()
        .catch(err => {
          setRequestArea([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
          // Not setting UI error message, as we can default to fallback if this request fails
          // so the user still sees content, but unfortunately not centered around their coords.
          notifyError(err);
        })
        .finally(() => setCenterCoordinatesLoading(false));
    } else {
      setCenterCoordinatesLoading(false);
      setRequestArea(givenLocation);
    }
  }, []);

  const filterResults = (selectedTab, filters) => {
    let fullRange = [];
    setSelectedFilterType(selectedTab);
    fullRange = filters.map(filter => getCorrespondingFilterTag(selectedTab, filter));
    if(fullRange.length === 0) {
      setResults(results.map(results => { return {...results, visible: true} }));
    } else {
      setResults(results.map(result => {
        let tagToCheck = selectedTab === 'download' ? result.downloadFilterTag : result.uploadFilterTag;
        return {
          ...result,
          visible: fullRange.includes(tagToCheck)
        };
      }));
    }
  }

  const goToSpeedTest = () => setStep(STEPS.SPEED_TEST);

  const getMapContainerHeight = () => {
    if(config.widgetMode) {
      const widgetHeight = config.frameStyle.height;
      return `calc(${widgetHeight} - 53px - 55px)`;
    }
    if(isMobile || isSmall) return 'calc(99vh - 125px)';
    else return `calc(${maxHeight} - 70px - 173px - 53px)`;
  }

  const getMapWrapperStyle = () => {
    if(config.widgetMode) {
      return {...mapWrapperStyle, height: '100%'}
    } else {
      return mapWrapperStyle;
    }
  }

  return (
    <div style={{ textAlign: 'center', height: '100%' }}>
      {(loading || centerCoordinatesLoading) && <CircularProgress size={25} />}
      {(!loading || !centerCoordinatesLoading) && error && <p>{error}</p>}
      {!loading && results !== null && results.length === 0 && (
        <div>
          <p>No measurements taken so far!</p>
          <MyButton text={'Test'} onClick={goToSpeedTest} />
        </div>
      )}
      {!loading && !centerCoordinatesLoading &&
        results !== null && results.length > 0 && (
        <div style={getMapWrapperStyle()}>
          <MapContainer
            center={requestArea ? requestArea : [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
            zoom={14}
            scrollWheelZoom
            style={{ height: getMapContainerHeight(), margin: 0, position: 'relative' }}
            zoomControl={isMobile || isSmall || config.widgetMode}
          >
            <MyMap position={requestArea}
                   shouldRecenter={shouldRecenter}
                   onPopupClose={() => setShouldRecenter(false)}
                   onPopupOpen={() => setShouldRecenter(true)}
            />
            <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
            {results.map(measurement => (
              <MyCustomMarker key={measurement.id}
                              measurement={measurement}
                              currentFilterType={selectedFilterType}
                              recenterMap={setRequestArea}
              />
            ))}
          </MapContainer>
          <SpeedResultsBox setSelectedFilters={filterResults} />
        </div>
      )}
    </div>
  );
};

export default AllResultsPage;
