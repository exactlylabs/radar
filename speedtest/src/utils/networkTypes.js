import WiredIcon from '../assets/icon-connection-wired.png';
import WiredSelectedIcon from '../assets/icon-connection-wired-selected.png';
import WiredSelectedThickIcon from '../assets/icon-connection-wired-selected-thick.png';
import WiredLightIcon from '../assets/icon-connection-wired-light.png';
import WiredPopupIcon from '../assets/icon-connection-wired-popup.png';
import WifiIcon from '../assets/icon-connection-wifi.png';
import WifiSelectedIcon from '../assets/icon-connection-wifi-selected.png';
import WifiSelectedThickIcon from '../assets/icon-connection-wifi-selected-thick.png';
import WifiLightIcon from '../assets/icon-connection-wifi-light.png';
import WifiPopupIcon from '../assets/icon-connection-wifi-popup.png';
import CellularIcon from '../assets/icon-connection-cellular.png';
import CellularSelectedIcon from '../assets/icon-connection-cellular-selected.png';
import CellularSelectedThickIcon from '../assets/icon-connection-cellular-selected-thick.png';
import CellularLightIcon from '../assets/icon-connection-cellular-light.png';
import CellularPopupIcon from '../assets/icon-connection-cellular-popup.png';

export const types = [
  {
    id: 0,
    iconSrc: WiredIcon,
    iconSelectedSrc: WiredSelectedIcon,
    iconSelectedThickSrc: WiredSelectedThickIcon,
    iconLightSrc: WiredLightIcon,
    iconPopupSrc: WiredPopupIcon,
    text: 'Wired',
  },
  {
    id: 1,
    iconSrc: WifiIcon,
    iconSelectedSrc: WifiSelectedIcon,
    iconSelectedThickSrc: WifiSelectedThickIcon,
    iconLightSrc: WifiLightIcon,
    iconPopupSrc: WifiPopupIcon,
    text: 'Wifi',
  },
  {
    id: 2,
    iconSrc: CellularIcon,
    iconSelectedSrc: CellularSelectedIcon,
    iconSelectedThickSrc: CellularSelectedThickIcon,
    iconLightSrc: CellularLightIcon,
    iconPopupSrc: CellularPopupIcon,
    text: 'Cellular',
  },
];
