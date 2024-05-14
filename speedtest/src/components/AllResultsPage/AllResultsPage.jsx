import React, {useEffect, useState, useContext} from 'react';
import { CircularProgress } from '@mui/material';
import {MapContainer, TileLayer, ZoomControl} from 'react-leaflet';
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
import {isNoConnectionError, notifyError} from "../../utils/errors";
import {hasVisitedAllResults, setAlreadyVisitedCookieIfNotPresent} from "../../utils/cookies";
import FirstTimeModal from "./FirstTimeModal";
import ConfigContext from "../../context/ConfigContext";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import FloatingMessageBox from "./FloatingMessageBox";
import searchIcon from '../../assets/search-icon.png';
import MySpinner from "../common/MySpinner";
import {DEFAULT_GRAY_BUTTON_TEXT_COLOR} from "../../utils/colors";
import {addMetadataToResults} from "../../utils/metadata";
import ConnectionContext from "../../context/ConnectionContext";

const mapWrapperStyle = {
  width: '100%',
  position: 'relative',
  height: '100%',
}

const searchIconStyle = {
  width: '14px',
  height: '14px',
  marginTop: '3px',
}

const AllResultsPage = ({ givenLocation, maxHeight, givenZoom }) => {
  const [requestArea, setRequestArea] = useState(givenLocation ?? [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [centerCoordinatesLoading, setCenterCoordinatesLoading] = useState(true);
  const [selectedFilterType, setSelectedFilterType] = useState('download');
  const [firstTimeModalOpen, setFirstTimeModalOpen] = useState(false);
  const [hasRecentered, setHasRecentered] = useState(false);
  const [floatingBoxVisible, setFloatingBoxVisible] = useState(false);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState(0);
  const [selectedRangeIndexes, setSelectedRangeIndexes] = useState([]);
  const [initialZoom, setInitialZoom] = useState(givenZoom);
  const [isBoxOpen, setIsBoxOpen] = useState(true);
  const [bottomFiltersVisible, setBottomFiltersVisible] = useState(true);

  const [map, setMap] = useState(null);

  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);
  const {setNoInternet} = useContext(ConnectionContext);
  let timerId;


  useEffect(() => {
    const fetchUserApproximateCoordinates = async () => getUserApproximateCoordinates(config.clientId);

    if(!givenLocation) {
      fetchUserApproximateCoordinates()
        .then(res => {
          const coordinates = res;
          if (coordinates.length > 0) {
            setRequestArea(coordinates);
          }
        })
        .catch(err => {
          if(isNoConnectionError(err)) setNoInternet(true);
          setRequestArea([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
          // Not setting UI error message, as we can default to fallback if this request fails
          // so the user still sees content, but unfortunately not centered around their coords.
          notifyError(err);
        })
        .finally(() => {setCenterCoordinatesLoading(false);});
    } else {
      setCenterCoordinatesLoading(false);
      setRequestArea(givenLocation);
    }

    if(!hasVisitedAllResults()) {
      setAlreadyVisitedCookieIfNotPresent();
      openFirstTimeModal();
    }
  }, []);

  useEffect(() => {
    const fetchSpeedTests = async () => {
      setFetchingResults(true);
      if(!map && requestArea) {
        const [lat, lng] = requestArea;
        // Create bounding box
        const _southWest = {lat: lat - 2, lng: lng - 2};
        const _northEast = {lat: lat + 2, lng: lng + 2};
        fetchTestsWithBounds({_southWest, _northEast});
      } else {
        // Way more precise way of getting current bounding box
        fetchTestsWithBounds(map.getBounds());
      }
    }

    fetchSpeedTests()
      .catch(err => {
        if(isNoConnectionError(err)) setNoInternet(true);
        notifyError(err);
        setError('Failed to fetch speed tests. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [requestArea, map]);

  const filterResults = (selectedTab, filters, paramResults = null) => {
    let fullRange = [];
    setSelectedFilterType(selectedTab);
    fullRange = filters.map(filter => getCorrespondingFilterTag(selectedTab, filter));
    if(fullRange.length === 0) {
      const handler = result => ({...result, visible: true});
      if(paramResults) setResults(paramResults.map(handler));
      else setResults(results.map(handler));
    } else {
      const handler = result => {
        let tagToCheck = selectedTab === 'download' ? result.downloadFilterTag : result.uploadFilterTag;
        return {
          ...result,
          visible: fullRange.includes(tagToCheck)
        };
      };
      if(paramResults) setResults(paramResults.map(handler));
      else setResults(results.map(handler));
    }
  }

  const getMapContainerHeight = () => {
    if(config.widgetMode || config.webviewMode) {
      return `100%`;
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

  const handleTestsWithBoundsResult = (res) => {
    if ('msg' in res) notifyError(res.msg);
    else {
      if (res.length > 0) {
        const modifiedResults = addMetadataToResults(res);
        setFloatingBoxVisible(false);
        filterResults(selectedFilterType, selectedRangeIndexes, modifiedResults);
      } else {
        setResults([]);
        setFloatingBoxVisible(true);
      }
    }
  }

  const fetchTestsWithBounds = (mapBounds) => {
    const {_northEast, _southWest} = mapBounds;
    setFloatingBoxVisible(true);
    setFetchingResults(true);
    getTestsWithBounds(_northEast, _southWest, config.clientId, config.global)
      .then(res => handleTestsWithBoundsResult(res))
      .catch(err => {
        if(isNoConnectionError(err)) setNoInternet(true);
        notifyError(err)
      })
      .finally(() => setFetchingResults(false));
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

  const userOnMoveHandler = () => {
    setFloatingBoxVisible(true);
    setFetchingResults(true);
    map.closePopup();
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
            id={'speedtest--all-results-page--map-container'}
            center={requestArea ? requestArea : [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
            zoom={initialZoom ? initialZoom : 10}
            scrollWheelZoom
            style={{ height: getMapContainerHeight(), margin: 0, position: 'relative', overflowY: 'hidden' }}
            zoomControl={(isMediumSizeScreen || isSmallSizeScreen) && !config.widgetMode && !config.noZoomControl}
          >
              <MyMap position={requestArea}
                     shouldRecenter={shouldRecenter}
                     hasRecentered={hasRecentered}
                     setHasRecentered={handleSetRecenter}
                     onPopupClose={disableRecenter}
                     onPopupOpen={forceRecenter}
                     userMapMovementHandler={userMapMovementHandler}
                     userZoomHandler={userZoomHandler}
                     userOnMoveHandler={userOnMoveHandler}
                     setMap={setMap}
              />
            { config.widgetMode && <ZoomControl position={'topright'}/> }
            <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
            {results?.map(measurement => (
              <MyCustomMarker key={measurement.id}
                              measurement={measurement}
                              currentFilterType={selectedFilterType}
                              recenterMap={setRequestArea}
                              setBottomFiltersVisible={setBottomFiltersVisible}
              />
            ))}
          </MapContainer>
          { bottomFiltersVisible &&
            <SpeedResultsBox setSelectedFilters={filterResults}
                             currentFilterType={currentFilterType}
                             setCurrentFilterType={setCurrentFilterType}
                             selectedRangeIndexes={selectedRangeIndexes}
                             setSelectedRangeIndexes={setSelectedRangeIndexes}
                             isBoxOpen={isBoxOpen}
                             setIsBoxOpen={setIsBoxOpen}
            />
          }
          { (!isExtraSmallSizeScreen && !isSmallSizeScreen) && floatingBoxVisible && bottomFiltersVisible &&
            <FloatingMessageBox icon={fetchingResults ? <MySpinner color={DEFAULT_GRAY_BUTTON_TEXT_COLOR} size={14}/> : <img src={searchIcon} style={searchIconStyle} alt={'search icon'}/>}
                                text={fetchingResults ? null : 'No test results in this area. Try adjusting your search area or speed filters.'}
                                isBoxOpen={isBoxOpen}
            />
          }
        </div>
      }
    </div>
  );
};

export default AllResultsPage;
