import React, { useEffect, useState, useContext } from 'react';
import { CircularProgress } from '@mui/material';
import { MyButton } from '../common/MyButton';
import {MapContainer, TileLayer, useMap} from 'react-leaflet';
import { TABS } from '../../constants';
import SpeedResultsBox from './SpeedResultsBox';
import {getCorrespondingFilterTag} from '../../utils/speeds';
import {
  DEFAULT_FALLBACK_LATITUDE,
  DEFAULT_FALLBACK_LONGITUDE,
  mapTileAttribution,
  mapTileUrl,
} from '../../utils/map';
import {getTestsWithBounds, getUserApproximateCoordinates} from '../../utils/apiRequests';
import { MyMap } from '../common/MyMap';
import MyCustomMarker from "./MyCustomMarker";
import {notifyError} from "../../utils/errors";
import {hasVisitedAllResults, setAlreadyVisitedCookieIfNotPresent} from "../../utils/cookies";
import FirstTimeModal from "./FirstTimeModal";
import ConfigContext from "../../context/ConfigContext";
import {useViewportSizes} from "../../hooks/useViewportSizes";

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
  const [firstTimeModalOpen, setFirstTimeModalOpen] = useState(false);
  const [hasRecentered, setHasRecentered] = useState(false);

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);
  let timerId;

  useEffect(() => {
    const fetchSpeedTests = async () => {
      const coordinates = await getUserApproximateCoordinates();
      if(coordinates.length > 0) {
        setRequestArea(coordinates);
      } else {
        setRequestArea([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
      }
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

    if(!hasVisitedAllResults()) {
      setAlreadyVisitedCookieIfNotPresent();
      openFirstTimeModal();
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

  const getMapContainerHeight = () => {
    if(config.widgetMode) {
      const widgetHeight = config.frameStyle.height;
      return `calc(${widgetHeight} - 53px - 55px)`;
    } else if(config.webviewMode) {
      return '100%';
    }
    if(isMediumSizeScreen || isSmallSizeScreen) return 'calc(99vh - 125px)';
    else return `calc(${maxHeight} - 70px - 173px - 53px)`;
  }

  const getMapWrapperStyle = () => {
    if(config.widgetMode) {
      return {...mapWrapperStyle, height: '100%'}
    } else {
      return mapWrapperStyle;
    }
  }

  const openFirstTimeModal = () => setFirstTimeModalOpen(true);

  const forceRecenter = () => setShouldRecenter(true);

  const disableRecenter = () => {
    setShouldRecenter(false);
    setHasRecentered(false);
  }

  const fetchTestsWithBounds = (mapBounds) => {
    const {_northEast, _southWest} = mapBounds;
    getTestsWithBounds(_northEast, _southWest)
      .then(res => {
        if('msg' in res) notifyError(res.msg);
        else {
          if(res.length > 0) setResults(res);
          else alert('no results in area')
        }
      })
      .catch(err => {
        notifyError(err);
      })
  }

  const userMapMovementHandler = (mapBounds) => {
    if(!mapBounds) return;
    if(timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fetchTestsWithBounds(mapBounds);
    });
  }

  const userZoomHandler = (mapBounds) => {
    if(!mapBounds) return;
    if(timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fetchTestsWithBounds(mapBounds);
    });
  }

  const handleSetRecenter = (value) => setHasRecentered(value);

  return (
    <div style={{ textAlign: 'center', height: '100%' }}>
      {(loading || centerCoordinatesLoading) && <CircularProgress size={25} />}
      {(!loading || !centerCoordinatesLoading) && error && <p>{error}</p>}
      <FirstTimeModal isOpen={firstTimeModalOpen} setIsOpen={setFirstTimeModalOpen}/>
      {!loading && !centerCoordinatesLoading &&
        <div style={getMapWrapperStyle()}>
          <MapContainer
            id={'all-results-page--map-container'}
            center={requestArea ? requestArea : [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
            zoom={10}
            scrollWheelZoom
            style={{ height: getMapContainerHeight(), margin: 0, position: 'relative' }}
            zoomControl={(isMediumSizeScreen || isSmallSizeScreen || config.widgetMode) && !config.noZoomControl}
          >
              <MyMap position={requestArea}
                     shouldRecenter={shouldRecenter}
                     hasRecentered={hasRecentered}
                     setHasRecentered={handleSetRecenter}
                     onPopupClose={disableRecenter}
                     onPopupOpen={forceRecenter}
                     userMapMovementHandler={userMapMovementHandler}
                     userZoomHandler={userZoomHandler}
              />
            <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
            {results?.map(measurement => (
              <MyCustomMarker key={measurement.id}
                              measurement={measurement}
                              currentFilterType={selectedFilterType}
                              recenterMap={setRequestArea}
              />
            ))}
          </MapContainer>
          <SpeedResultsBox setSelectedFilters={filterResults} />
        </div>
      }
    </div>
  );
};

export default AllResultsPage;
