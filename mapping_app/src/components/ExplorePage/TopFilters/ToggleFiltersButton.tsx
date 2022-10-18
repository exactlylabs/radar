import {ReactElement} from "react";
import {styles} from "./styles/OpenFiltersButton";
import MyButton from "../../common/MyButton";
import {BLACK, DEFAULT_SECONDARY_BUTTON} from "../../../styles/colors";
import FiltersIcon from '../../../assets/filters-icon.png';
import ArrowRightBlack from '../../../assets/arrow-right-black.png';

interface ToggleFiltersButtonProps {
  toggleFilters: () => void;
  openContent: boolean;
}

const ToggleFiltersButton = ({
  toggleFilters,
  openContent
}: ToggleFiltersButtonProps): ReactElement => {
  return (
    <MyButton onClick={toggleFilters}
              color={BLACK}
              text={''}
              backgroundColor={DEFAULT_SECONDARY_BUTTON}
              icon={<img src={openContent ? ArrowRightBlack : FiltersIcon} style={styles.Icon} alt={'filters-icon'}/> }
              iconFirst
              className={'fw-regular hover-opaque'}
    />
  )
}

export default ToggleFiltersButton;