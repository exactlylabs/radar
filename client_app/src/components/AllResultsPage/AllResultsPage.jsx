import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { MyButton } from '../common/MyButton';
import { MapContainer, TileLayer} from 'react-leaflet';
import { STEPS } from '../../constants';
import SpeedResultsBox from './SpeedResultsBox';
import {
  DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD,
  getCorrespondingFilterTag,
  SPEED_FILTERS,
} from '../../utils/speeds';
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE, mapTileAttribution, mapTileUrl} from '../../utils/map';
import {getAllSpeedTests, getUserApproximateCoordinates} from '../../utils/apiRequests';
import { MyMap } from '../common/MyMap';
import MyCustomMarker from "./MyCustomMarker";

const mapWrapperStyle = {
  width: '100%',
  display: 'relative'
}

const AllResultsPage = ({ givenLocation, setStep, maxHeight }) => {

  const [requestArea, setRequestArea] = useState([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [centerCoordinatesLoading, setCenterCoordinatesLoading] = useState(true);
  const [selectedFilterType, setSelectedFilterType] = useState('download');

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
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    if(!givenLocation) {
      fetchUserApproximateCoordinates()
        .catch(err => setError(err.message))
        .finally(() => setCenterCoordinatesLoading(false));
    } else {
      setCenterCoordinatesLoading(false);
      setRequestArea(givenLocation);
    }
  }, []);

  const filterResults = (selectedTab, filters) => {
    let fullRange = [];
    setSelectedFilterType(selectedTab);
    filters.forEach(filter => {
      fullRange.push(getCorrespondingFilterTag(selectedTab, filter));
    });
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

  return (
    <div style={{ textAlign: 'center' }}>
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
        <div style={mapWrapperStyle}>
          <MapContainer
            center={requestArea ? requestArea : [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
            zoom={14}
            scrollWheelZoom
            style={{ height: `calc(${maxHeight} - 70px - 173px - 53px`, margin: 0 }}
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
