import HomeIcon from '../assets/icon-location-home.png';
import HomeIconSelected from '../assets/icon-location-home-selected.png';
import HomeIconLight from '../assets/icon-location-home-light.png';
import HomeIconPopup from '../assets/icon-location-home-popup.png';
import WorkIcon from '../assets/icon-location-work.png';
import WorkIconSelected from '../assets/icon-location-work-selected.png';
import WorkIconLight from '../assets/icon-location-work-light.png';
import WorkIconPopup from '../assets/icon-location-work-popup.png';
import OtherIcon from '../assets/icon-location-other.png';
import OtherIconSelected from '../assets/icon-location-other-selected.png';
import OtherIconLight from '../assets/icon-location-other-light.png';
import OtherIconPopup from '../assets/icon-location-other-popup.png';
import NoneIcon from '../assets/icon-location-nointernet.png';
import NoneIconSelected from '../assets/icon-location-nointernet-selected.png';
import NoneIconLight from '../assets/icon-location-nointernet-light.png';
import NoneIconPopup from '../assets/icon-location-nointernet-popup.png';

export const placementOptions = [
  {
    id: 0,
    iconSrc: HomeIcon,
    iconSelectedSrc: HomeIconSelected,
    iconLightSrc: HomeIconLight,
    iconPopupSrc: HomeIconPopup,
    text: 'Home',
  },
  {
    id: 1,
    iconSrc: WorkIcon,
    iconSelectedSrc: WorkIconSelected,
    iconLightSrc: WorkIconLight,
    iconPopupSrc: WorkIconPopup,
    text: 'Work',
  },
  {
    id: 2,
    iconSrc: OtherIcon,
    iconSelectedSrc: OtherIconSelected,
    iconLightSrc: OtherIconLight,
    iconPopupSrc: OtherIconPopup,
    text: 'Other',
  },
  {
    id: 3,
    iconSrc: NoneIcon,
    iconSelectedSrc: NoneIconSelected,
    iconLightSrc: NoneIconLight,
    iconPopupSrc: NoneIconPopup,
    text: "I don't have",
  },
];

//
export const getNetworkPlacementIcon = (givenPlacement, iconKey) => {
  return placementOptions.find(placement => placement.text.toLowerCase() === givenPlacement.toLowerCase())[iconKey];
}