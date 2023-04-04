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
import {isNoConnectionError, notifyError} from "../../../../utils/errors";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import ConfigContext from "../../../../context/ConfigContext";
import {widgetModalFraming} from "../../../../utils/modals";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import ConnectionContext from "../../../../context/ConnectionContext";
import {ADDRESS_PROVIDER} from "../../../../utils/userMetadata";
import UserDataContext from "../../../../context/UserData";

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

const mapContainerStyle = {
  height: 250,
}

const mobileMapContainerStyle = {
  height: '45%'
}

const smallMapContainerStyle = {
  height: '55%'
}

const xsMapContainerStyle = {
  height: '65%'
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
  height: undefined,
  marginTop: '10px',
  width: '90%',
  justifyContent: 'center',
  maxWidth: 450
}

const mobileFooterStyle = {
  display: 'flex',
  height: 'max-content',
  flexDirection: 'row',
  width: '90%',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '15px auto',
}

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR,
  fontFamily: 'MulishRegular',
  fontSize: 16,
  lineHeight: '25px',
  marginBottom: '20px'
}

const xsSubtitleStyle = {
  ...subtitleStyle,
  fontSize: 13,
  lineHeight: '20px',
  marginBottom: '10px'
}

const MyMapModal = ({
  isOpen,
  setIsOpen,
  confirmAddress,
  isGeneric,
  goToNextPage
}) => {

  const config = useContext(ConfigContext);
  const {userData, setUserData} = useContext(UserDataContext);
  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const {setNoInternet} = useContext(ConnectionContext);
  const markerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressCoordinates, setAddressCoordinates] = useState(userData.address?.coordinates ?? []);
  const [positionedManually, setPositionedManually] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setError(null);
      try {
        const suggestions = await getSuggestions(userData.address.address, config.clientId);
        if (suggestions.length > 0) {
          setAddressCoordinates(suggestions[0].coordinates);
        } else {
          setError('There has been an error finding suggestions for given marker position. Please try again later.');
        }
      } catch (e) {
        if(isNoConnectionError(e)) setNoInternet(true);
        notifyError(e);
        setError('There has been an unexpected error. Please try again later.');
      }
    }
    const fetchUserCoordinates = async () => {
      setError(null);
      try {
        const coords = await getUserApproximateCoordinates(config.clientId);
        setAddressCoordinates(coords);
      } catch (e) {
        if(isNoConnectionError(e)) setNoInternet(true);
        notifyError(e);
        setError('There has been an error finding position for given marker position. Please try again later.');
      }
    }
    if (userData.address?.coordinates) {
      setAddressCoordinates(userData.address.coordinates);
    }
    if(isOpen) {
      if (!userData.address || userData.address.coordinates.length === 0) {
        setLoading(true);
        fetchUserCoordinates()
          .catch(err => {
            if(isNoConnectionError(err)) setNoInternet(true);
            notifyError(err);
            setError(err);
          })
          .finally(() => setLoading(false));
      }
      /*if (userData.address.coordinates.length === 0) {
        setLoading(true);
        fetchSuggestions()
          .catch(err => {
            if(isNoConnectionError(err)) setNoInternet(true);
            notifyError(err);
          })
          .finally(() => setLoading(false));
      }*/
    }
  }, [isOpen, userData.address?.coordinates]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker !== null) {
          const {lat, lng} = marker.getLatLng();
          setAddressCoordinates([lat, lng]);
          setPositionedManually(true);
        }
      }
    }),
    [],
  )

  const getStyle = () => {
    if(config.widgetMode) return widgetModalFraming(config, isExtraSmallSizeScreen || isSmallSizeScreen);
    return isMediumSizeScreen || isSmallSizeScreen ? mobileModalStyle : modalStyle
  }

  const getFooterStyle = () => {
    if(config.widgetMode) return smallFooterStyle;
    return isMediumSizeScreen || isSmallSizeScreen ? mobileFooterStyle : footerStyle
  }

  const closeModal = () => setIsOpen(false);

  const handleChangeAddress = () => {
    confirmAddress(null);
    closeModal();
  }

  const confirmCoordinates = async () => {
    try {
      const address = await getAddressForCoordinates(addressCoordinates, config.clientId);
      confirmAddress(addressCoordinates);
      setUserData({...userData, address, accuracy: null, altitude: null, addressProvider: ADDRESS_PROVIDER.MANUAL});
      closeModal();
    } catch (e) {
      if(isNoConnectionError(e)) setNoInternet(true);
      notifyError(e);
    }
  }

  const handleContinue = () => {
    console.log(goToNextPage);
    if(goToNextPage) {
      goToNextPage(true);
      if(positionedManually) {
        confirmCoordinates()
          .catch(err => {
            if(isNoConnectionError(err)) setNoInternet(true);
            notifyError(err);
          });
      }
    }
  }

  const getMapWrapperStyle = () => {

    let style;
    if(isExtraSmallSizeScreen) style = xsMapContainerStyle;
    else if(isSmallSizeScreen) style = smallMapContainerStyle;
    else if(isMediumSizeScreen) style = mobileMapContainerStyle;
    else style = mapContainerStyle;

    return style;
  }

  return (
    <Modal open={isOpen}
           onClose={closeModal}
           style={getStyle()}
    >
      <Box sx={boxStyle}>
        <div>
          <MyModalTitle text={isGeneric ? 'Tell us your location' : 'Confirm your location'}/>
          <div style={isExtraSmallSizeScreen || isSmallSizeScreen ? xsSubtitleStyle : subtitleStyle}>{isGeneric ? 'Zoom the map and drag the marker to tell us your current location.' : 'You can move the marker to your approximate location.'}</div>
        </div>
        <div style={getMapWrapperStyle()}>
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
          <MyBackButton text={isSmallSizeScreen || isExtraSmallSizeScreen ? 'Change' : 'Change address'}
                        onClick={handleChangeAddress}
          />
          <MyForwardButton text={isSmallSizeScreen || isExtraSmallSizeScreen ? 'Confirm' : 'Confirm location'}
                           icon={<ArrowForward style={{marginLeft: isExtraSmallSizeScreen ? 5 : 15}} fontSize={'small'}/>}
                           onClick={handleContinue}
          />
        </div>
      </Box>
    </Modal>

  );
}

export default MyMapModal;