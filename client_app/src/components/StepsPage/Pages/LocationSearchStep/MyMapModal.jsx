import {DEFAULT_MAP_MODAL_BACKGROUND_COLOR} from "../../../../utils/colors";
import {Box, CircularProgress, Modal} from '@mui/material';
import {MyModalTitle} from "../../../common/MyModalTitle";
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {ArrowForward} from "@mui/icons-material";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import {MyMap} from "../../../common/MyMap";
import {customMarker, mapTileAttribution, mapTileUrl} from "../../../../utils/map";
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import {getSuggestions} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {useMobile} from "../../../../hooks/useMobile";
import ConfigContext from "../../../../context/ConfigContext";
import {useSmall} from "../../../../hooks/useSmall";
import {widgetModalFraming} from "../../../../utils/modals";

const modalStyle = {
  width: '700px',
  height: '485px',
  position: 'fixed',
  top: '10%',
  left: 'calc(50% - 350px)'
}

const mobileModalStyle = {
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
  width: '55%',
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

const MyMapModal = ({
  isOpen,
  setIsOpen,
  goForward,
  address,
}) => {

  const config = useContext(ConfigContext);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressCoordinates, setAddressCoordinates] = useState(address.coordinates);
  const isMobile = useMobile();
  const isSmall = useSmall();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setError(null);
      const suggestions = await getSuggestions(address.name);
      if(suggestions.length > 0) {
        setAddressCoordinates(suggestions[0].coordinates);
      } else {
        setError(true);
      }
      setLoading(false);
    }
    setAddressCoordinates(address.coordinates);
    if (isOpen && address.coordinates.length === 0) {
      setLoading(true);
      fetchSuggestions()
        .catch(err => {
          notifyError(err);
          setError('Failed to fetch for suggestions. Please try again later.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, address.coordinates]);

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
    return isMobile || isSmall ? mobileModalStyle : modalStyle
  }

  const getFooterStyle = () => {
    if(isSmall && config.widgetMode) return smallFooterStyle;
    return isMobile || isSmall ? mobileFooterStyle : footerStyle
  }

  return (
    <Modal open={isOpen}
           onClose={() => setIsOpen(false)}
           style={getStyle()}
    >
      <Box sx={boxStyle}>
        <div style={headerStyle}>
          <MyModalTitle text={'Confirm your location'}/>
          <div>You can move the marker to your approximate location.</div>
        </div>
        <div style={isMobile || isSmall ? mobileMapContainerStyle : mapContainerStyle}>
          {
            !loading && addressCoordinates.length > 0 &&
            <MapContainer
              center={addressCoordinates}
              zoom={20}
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
                        onClick={() => setIsOpen(false)}
                        fullWidth
          />
          <MyForwardButton text={'Confirm location'}
                           icon={<ArrowForward style={{marginLeft: 15}} fontSize={'small'}/>}
                           onClick={() => goForward(addressCoordinates)}
                           fullWidth
          />
        </div>
      </Box>
    </Modal>

  );
}

export default MyMapModal;