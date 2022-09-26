import {ReactElement} from "react";
import {styles} from "./styles/DropdownFilters.style";
import DropdownFilter from "./DropdownFilter";
import CalendarIcon from '../../../assets/calendar-icon.png';
import ProvidersIcon from '../../../assets/providers-icon.png';
import SpeedIcon from '../../../assets/speeds-icon.png';
import DropdownFilterVerticalDivider from "./DropdownFilterVerticalDivider";

export const filterTypes = {
  SPEED: 'speed',
  CALENDAR: 'calendar',
  PROVIDERS: 'providers',
}

const speedOptions = ['Download', 'Upload'];
const timeOptions = ['All time', 'This week', 'This month', 'This year'];
const providerOptions = ['AT&T Internet Services', 'Sparklight', 'Lumen Technologies', 'Charter Communications', 'Comcast (Xfinity)'];

const DropdownFilters = ({

}): ReactElement => {
  return (
    <div style={styles.DropdownFiltersContainer()}>
      <DropdownFilter icon={<img src={SpeedIcon} style={styles.Icon()} alt={'speed-icon'}/>}
                      options={speedOptions}
                      textWidth={'70px'}
                      type={filterTypes.SPEED}
      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter icon={<img src={CalendarIcon} style={styles.Icon()} alt={'speed-icon'}/>}
                      options={timeOptions}
                      textWidth={'70px'}
                      type={filterTypes.CALENDAR}
      />
      <DropdownFilterVerticalDivider/>
      <DropdownFilter icon={<img src={ProvidersIcon} style={styles.Icon()} alt={'speed-icon'}/>}
                      options={providerOptions}
                      withSearchbar
                      textWidth={'85px'}
                      type={filterTypes.PROVIDERS}
      />
    </div>
  )
}

export default DropdownFilters;