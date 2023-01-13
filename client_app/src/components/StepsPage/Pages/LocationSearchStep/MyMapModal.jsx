import {
  DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  DEFAULT_MODAL_BOX_SHADOW,
  DEFAULT_TEXT_COLOR
} from "../../../../utils/colors";
import {Box, CircularProgress, Modal} from '@mui/material';
import {MyModalTitle} from "../../../common/MyModalTitle";
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {ArrowForward} from "@mui/icons-material";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import {MyMap} from "../../../common/MyMap";
import {
  customMarker,
  mapTileAttribution,
  mapTileUrl
} from "../../../../utils/map";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {getAddressForCoordinates, getSuggestions, getUserApproximateCoordinates} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import ConfigContext from "../../../../context/ConfigContext";
import {widgetModalFraming} from "../../../../utils/modals";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

const commonModalStyle = {
  boxShadow: DEFAULT_MODAL_BOX_SHADOW,
}

const modalStyle = {
  ...commonModalStyle,
  width: '700px',
  height: '485px',
  position: 'fixed',
  top: '10%',
  left: 'calc(50% - 350px)'
}

const mobileModalStyle = {
  ...commonModalStyle,
  width: '90%',
  height: '85%',
  position: 'fixed',
  top: '10%',
  left: '5%',
}

const boxStyle = {
  width: '100%',
  height: '100%',
  backgroundColor: DEFAULT_MAP_MODAL_BACKGROUND_COLOR,
  borderRadius: '16px',
  textAlign: 'center',
}

const headerStyle = {
  height: 125
}

const mapContainerStyle = {
  height: 250,
}

const mobileMapContainerStyle = {
  height: '45%'
}

const footerStyle = {
  height: 110,
  display: 'flex',
  flexDirection: 'row',
  maxWidth: 385,
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: 'auto'
}

const smallFooterStyle = {
  ...footerStyle,
  width: '95%',
}

const mobileFooterStyle = {
  display: 'flex',
  height: 120,
  flexDirection: 'column',
  width: '70%',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '30px auto',
}

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const MyMapModal = ({
  isOpen,
  setIsOpen,
  confirmAddress,
  address,
  isGeneric,
  setAddress,
  goToNextPage
}) => {

  const config = useContext(ConfigContext);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressCoordinates, setAddressCoordinates] = useState(address?.coordinates ?? []);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setError(null);
      const suggestions = await getSuggestions(address.address);
      if(suggestions.length > 0) {
        setAddressCoordinates(suggestions[0].coordinates);
      } else {
        setError(true);
      }
    }
    const fetchUserCoordinates = async () => {
      setError(null);
      const coords = await getUserApproximateCoordinates();
      setAddressCoordinates(coords);
    }
    if (address?.coordinates) {
      setAddressCoordinates(address.coordinates);
    }
    if(isOpen) {
      if (!address) {
        setLoading(true);
        fetchUserCoordinates()
          .catch(err => setError(err))
          .finally(() => setLoading(false));
        return;
      }
      if (address.coordinates.length === 0) {
        setLoading(true);
        fetchSuggestions()
          .catch(err => {
            notifyError(err);
          })
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, address?.coordinates]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if(marker !== null) {
          const {lat, lng} = marker.getLatLng();
          setAddressCoordinates([lat, lng]);
        }
      }
    }),
    [],
  )

  const getStyle = () => {
    if(config.widgetMode) return widgetModalFraming(config);
    return isMediumSizeScreen || isSmallSizeScreen ? mobileModalStyle : modalStyle
  }

  const getFooterStyle = () => {
    if(isSmallSizeScreen && config.widgetMode) return smallFooterStyle;
    return isMediumSizeScreen || isSmallSizeScreen ? mobileFooterStyle : footerStyle
  }

  const closeModal = () => setIsOpen(false);

  const confirmCoordinates = async () => {
    const address = await getAddressForCoordinates(addressCoordinates);
    setAddress(address);
    confirmAddress(addressCoordinates);
    closeModal();
  }

  const handleContinue = () => {
    if(goToNextPage) {
      goToNextPage(true);
    } else {
      confirmCoordinates();
    }
  }

  return (
    <Modal open={isOpen}
           onClose={closeModal}
           style={getStyle()}
    >
      <Box sx={boxStyle}>
        <div style={headerStyle}>
          <MyModalTitle text={isGeneric ? 'Tell us your location' : 'Confirm your location'}/>
          <div style={subtitleStyle}>{isGeneric ? 'Zoom the map and drag the marker to tell us your current location.' : 'You can move the marker to your approximate location.'}</div>
        </div>
        <div style={isMediumSizeScreen || isSmallSizeScreen ? mobileMapContainerStyle : mapContainerStyle}>
          {
            !loading && addressCoordinates.length > 0 &&
            <MapContainer
              center={addressCoordinates}
              zoom={isGeneric ? 12 : 20}
              scrollWheelZoom
              style={{height: '100%', maxWidth: 800}}
            >
              <MyMap/>
              <TileLayer attribution={mapTileAttribution} url={mapTileUrl}/>
              <Marker position={addressCoordinates}
                      draggable
                      ref={markerRef}
                      eventHandlers={eventHandlers}
                      icon={customMarker}
              />
            </MapContainer>
          }
          {
            loading && <CircularProgress size={25} />
          }
          {
            !loading && error && <MyMessageSnackbar message={error} type={'error'}/>
          }
        </div>
        <div style={getFooterStyle()}>
          <MyBackButton text={'Change address'}
                        onClick={closeModal}
          />
          <MyForwardButton text={'Confirm location'}
                           icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                           onClick={handleContinue}
          />
        </div>
      </Box>
    </Modal>

  );
}

export default MyMapModal;