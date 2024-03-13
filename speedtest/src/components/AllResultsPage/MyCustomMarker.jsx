import {CircleMarker, useMap} from "react-leaflet";
import {
  DOWNLOAD_FILTER_TAGS,
  UPLOAD_FILTER_TAGS,
} from "../../utils/speeds";
import {
  DEFAULT_DOWNLOAD_FILTER_NONE,
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID
} from "../../utils/colors";
import MyPopup from "./MyPopup";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";
import L from 'leaflet';

const sharedMarkerProps = {
  stroke: true,
  weight: 1,
}

const MyCustomMarker = ({
  currentFilterType,
  measurement,
  recenterMap,
  areFiltersOpen,
  forceCloseFilters
}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getPathOptions = () => {
    const { downloadFilterTag, uploadFilterTag } = measurement;
    let pathOptions = {
      ...sharedMarkerProps,
      opacity: 1.0,
      fillOpacity: 0.7,
    };
    const tagToCheck = currentFilterType === 'download' ? downloadFilterTag : uploadFilterTag;
    const thresholdToConsider = currentFilterType === 'download' ? DOWNLOAD_FILTER_TAGS : UPLOAD_FILTER_TAGS;
    if (tagToCheck === thresholdToConsider[0]) 
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_NONE,
        fillColor: DEFAULT_DOWNLOAD_FILTER_NONE,
      }
    else if (tagToCheck === thresholdToConsider[1])
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_LOW,
        fillColor: DEFAULT_DOWNLOAD_FILTER_LOW,
    };
    else if (tagToCheck === thresholdToConsider[2])
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_MID,
        fillColor: DEFAULT_DOWNLOAD_FILTER_MID
    };
    else return {
      ...pathOptions,
      color: DEFAULT_DOWNLOAD_FILTER_HIGH,
      fillColor: DEFAULT_DOWNLOAD_FILTER_HIGH
    };
  };

  if(!measurement.visible) return;

  const config = useContext(ConfigContext);
  const map = useMap();

  const getXOffset = () => {
    if(areFiltersOpen) {
      if(config.widgetMode || isSmallSizeScreen || isMediumSizeScreen) return 70;
      else return 325;
    } else {
      if(config.widgetMode || isSmallSizeScreen || isMediumSizeScreen) return 70;
      else return 90;
    }
  }

  const getYOffset = () => {
    if(areFiltersOpen) {
      if(config.widgetMode || isSmallSizeScreen || isMediumSizeScreen) return 150;
      else return 350;
    } else {
      if(config.widgetMode || isSmallSizeScreen || isMediumSizeScreen) return 50;
      else return 90;
    }
  }

  const getShapeCoordinates = (shapeWidth, shapeHeight, position, availableWidth, availableHeight, shouldExtendHorizontally = false) => {
    const offset = 20;
    let topLeftCorner;
    let bottomRightCorner;

    if(position === 'bottomright') {
      topLeftCorner = {x: availableWidth - shapeWidth - 2 * offset, y: availableHeight - shapeHeight - 2 * offset};
      bottomRightCorner = {x: availableWidth - offset, y: availableHeight - offset};
    } else if(position === 'bottomleft') {
      topLeftCorner = {x: offset, y: availableHeight - shapeHeight - 2 * offset};
      bottomRightCorner = {x: shapeWidth + 2 * offset, y: availableHeight - offset};
    }
    if(shouldExtendHorizontally) {
      topLeftCorner.x = 0;
      bottomRightCorner.x = availableWidth;
    }
    return {topLeftCorner, bottomRightCorner};
  }

  const updateCoordinatesIfWithinBounds = (shapeCoordinates, currentPoint, shapePosition, mapHorizontalLimit, mapVerticalLimit, identifier) => {
    console.log('update coords with ', identifier);
    const shiftingOffset = 10;
    const padding = 20;
    const popupWidth = 280;
    const popupHeight = 300;

    const shapeWidth = Math.abs(shapeCoordinates.bottomRightCorner.x - shapeCoordinates.topLeftCorner.x);
    const shapeHeight = Math.abs(shapeCoordinates.bottomRightCorner.y - shapeCoordinates.topLeftCorner.y);

    let popupCoordinates = {
      topLeftCorner: { x: currentPoint.x + padding, y: currentPoint.y - padding },
      bottomRightCorner: { x: currentPoint.x + popupWidth + padding, y: currentPoint.y - padding + popupHeight }
    }

    const collidesHorizontally = shapesCollide(shapeCoordinates, shapeWidth, popupCoordinates, popupWidth, 'horizontal');
    const collidesVertically = shapesCollide(shapeCoordinates, shapeHeight, popupCoordinates, popupHeight, 'vertical');

    if(!collidesHorizontally || !collidesVertically) return currentPoint;

    const horizontalCollisionQuantity = shapeCollisionQuantity(shapeCoordinates, shapeWidth, popupCoordinates, popupWidth, 'horizontal');
    const verticalCollisionQuantity = shapeCollisionQuantity(shapeCoordinates, shapeHeight, popupCoordinates, popupHeight, 'vertical');

    if(horizontalCollisionQuantity > verticalCollisionQuantity) {
      while(shapesCollide(shapeCoordinates, shapeHeight, popupCoordinates, popupHeight, 'vertical')) {
        console.log(popupCoordinates.bottomRightCorner.y, mapVerticalLimit, popupCoordinates.bottomRightCorner.y > mapVerticalLimit, popupCoordinates.topLeftCorner.y < 0)
        popupCoordinates.topLeftCorner.y -= shiftingOffset;
        popupCoordinates.bottomRightCorner.y -= shiftingOffset;
        // this means the shifting should only be done vertically for now
        console.log(shapeCoordinates.topLeftCorner.y, popupCoordinates.bottomRightCorner.y, mapVerticalLimit, popupCoordinates.bottomRightCorner.y > mapVerticalLimit, popupCoordinates.topLeftCorner.y < 0)
        if(popupCoordinates.topLeftCorner.y < 0) {
          console.log('se me paso vertical')
          popupCoordinates.topLeftCorner.y = currentPoint.y - padding;
          popupCoordinates.bottomRightCorner.y = currentPoint.y + popupHeight - padding;
          break;
        }
      }
    } else {
      while(shapesCollide(shapeCoordinates, shapeWidth, popupCoordinates, popupWidth, 'horizontal')) {
        const positionMultiplier = shapePosition === 'bottomright' ? -1 : 1;
        popupCoordinates.topLeftCorner.x += shiftingOffset * positionMultiplier;
        popupCoordinates.bottomRightCorner.x += shiftingOffset * positionMultiplier;
        // this means the shifting should only be done vertically for now
        console.log(popupCoordinates.bottomRightCorner.x > mapHorizontalLimit, popupCoordinates.topLeftCorner.x < 0)
        if(popupCoordinates.bottomRightCorner.x > mapHorizontalLimit || popupCoordinates.topLeftCorner.x < 0) {
          console.log('se me paso horizontal')
          popupCoordinates.topLeftCorner.x = currentPoint.x + padding;
          popupCoordinates.bottomRightCorner.x = currentPoint.x + padding;
          break;
        }
      }
    }

    console.log('after all', popupCoordinates.topLeftCorner.x, popupCoordinates.topLeftCorner.y);

    return {
      x: popupCoordinates.topLeftCorner.x,
      y: popupCoordinates.topLeftCorner.y
    };
  }

  const shapesCollide = (shape1, shape1Dimension, shape2, shape2Dimension, direction) => {
    if(direction === 'horizontal') {
      return (shape1.topLeftCorner.x + shape1Dimension - shape2.topLeftCorner.x) >= 0 &&
        (shape2.topLeftCorner.x + shape2Dimension - shape1.topLeftCorner.x) >= 0;
    } else {
      return (shape1.bottomRightCorner.y + shape1Dimension - shape2.bottomRightCorner.y) >= 0 &&
        (shape2.bottomRightCorner.y + shape2Dimension - shape1.bottomRightCorner.y) >= 0;
    }
  }

  const shapeCollisionQuantity = (shape1, shape1Dimension, shape2, shape2Dimension, direction) => {
    if(direction === 'horizontal') {
      return (shape1.topLeftCorner.x + shape1Dimension - shape2.topLeftCorner.x);
    } else {
      return (shape1.topLeftCorner.y + shape1Dimension - shape2.topLeftCorner.y);
    }
  }


  const getWidgetShiftedCoordinates = (x, y, width, height) => {
    let currentPoint = {x, y};
    let filtersAreaCoordinates = {
      topLeftCorner: {x: -1, y: -1},
      bottomRightCorner: {x: -1, y: -1}
    };
    let buttonAreaCoordinates;
    const requiredPopupArea = 300 * 280;
    const totalArea = width * height;
    if(areFiltersOpen) {
      filtersAreaCoordinates = getShapeCoordinates(250, 130, 'bottomleft', width, height);
      buttonAreaCoordinates = getShapeCoordinates(68, 68, 'bottomright', width, height, true);

      const filtersArea =
        Math.abs(filtersAreaCoordinates.bottomRightCorner.x - filtersAreaCoordinates.topLeftCorner.x) *
        Math.abs(filtersAreaCoordinates.bottomRightCorner.y - filtersAreaCoordinates.topLeftCorner.y);
      const buttonArea =
        Math.abs(buttonAreaCoordinates.bottomRightCorner.x - buttonAreaCoordinates.topLeftCorner.x) *
        Math.abs(buttonAreaCoordinates.bottomRightCorner.y - buttonAreaCoordinates.topLeftCorner.y);
      const totalBlockedArea = filtersArea + buttonArea;
      if((totalArea - totalBlockedArea) < requiredPopupArea) {
        forceCloseFilters();
        getWidgetShiftedCoordinates(x, y, width, height);
      } else {
        currentPoint = {...currentPoint, ...updateCoordinatesIfWithinBounds(filtersAreaCoordinates, currentPoint, 'bottomleft', width, height, 'filters')};
        currentPoint = {...currentPoint, ...updateCoordinatesIfWithinBounds(buttonAreaCoordinates, currentPoint, 'bottomright', width, height, 'button')};
      }
    } else {
      buttonAreaCoordinates = getShapeCoordinates(68, 68, 'bottomright', width, height, false);
      const buttonArea =
        Math.abs(buttonAreaCoordinates.bottomRightCorner.x - buttonAreaCoordinates.topLeftCorner.x) *
        Math.abs(buttonAreaCoordinates.bottomRightCorner.y - buttonAreaCoordinates.topLeftCorner.y);

      // impossible to render correctly
      if((totalArea - buttonArea) < requiredPopupArea) {
        return null;
      }
      currentPoint = updateCoordinatesIfWithinBounds(buttonAreaCoordinates, currentPoint, 'bottomright', width, height);
    }
    return currentPoint;
  }

  const getMobileShiftedCoordinates = (x, y, width, height) => {

  }

  const getDesktopShiftedCoordinates = (x, y, width, height) => {

  }

  const getShiftedCoordinates = (x, y, width, height) => {
    if(config.widgetMode) return getWidgetShiftedCoordinates(x, y, width, height);
    else if(isSmallSizeScreen || isMediumSizeScreen) return getMobileShiftedCoordinates(x, y, width, height);
    else return getDesktopShiftedCoordinates(x, y, width, height);
  }

  const handleMarkerClick = (e) => {
    const {x, y} = map.latLngToLayerPoint([e.latlng.lat, e.latlng.lng]);
    console.log('init', {x,y}, e.latlng);
    const container = document.getElementById('speedtest--frame--main-frame-wrapper');
    if(container) {
      const {width, height} = container.getBoundingClientRect();
      let newX = x;
      let newY = y;
      const newCoordinates = getShiftedCoordinates(x, y, width, height);
      if(newCoordinates) {
        newX = newCoordinates.x;
        newY = newCoordinates.y;
      }
      const newPoint = map.layerPointToLatLng([newX, newY]);
      console.log('final', {x: newX, y: newY}, newPoint);
      recenterMap([newPoint.lat, newPoint.lng]);
    } else {
      recenterMap([e.latlng.lat, e.latlng.lng]);
    }
  }

  return (
    <CircleMarker
      key={measurement.id}
      radius={6}
      center={[measurement.latitude , measurement.longitude]}
      pathOptions={getPathOptions()}
      eventHandlers={{click: handleMarkerClick}}
    >
      <MyPopup measurement={measurement}/>
    </CircleMarker>
  )
}

export default MyCustomMarker;