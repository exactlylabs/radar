import WiredIcon from "../assets/icon-connection-wired.png";
import WiredSelectedIcon from "../assets/icon-connection-wired-selected.png";
import WiredLightIcon from "../assets/icon-connection-wired-light.png";
import WifiIcon from "../assets/icon-connection-wifi.png";
import WifiSelectedIcon from "../assets/icon-connection-wifi-selected.png";
import WifiLightIcon from "../assets/icon-connection-wifi-light.png";
import CellularIcon from "../assets/icon-connection-cellular.png";
import CellularSelectedIcon from "../assets/icon-connection-cellular-selected.png";
import CellularLightIcon from "../assets/icon-connection-cellular-light.png";

export const types = [
  {
    id: 0,
    iconSrc: WiredIcon,
    iconSelectedSrc: WiredSelectedIcon,
    iconLightSrc: WiredLightIcon,
    text: 'Wired'
  },
  {
    id: 1,
    iconSrc: WifiIcon,
    iconSelectedSrc: WifiSelectedIcon,
    iconLightSrc: WifiLightIcon,
    text: 'Wifi'
  },
  {
    id: 2,
    iconSrc: CellularIcon,
    iconSelectedSrc: CellularSelectedIcon,
    iconLightSrc: CellularLightIcon,
    text: 'Cellular'
  }
]