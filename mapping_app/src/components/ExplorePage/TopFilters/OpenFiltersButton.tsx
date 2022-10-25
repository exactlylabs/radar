import {ReactElement} from "react";
import {styles} from "./styles/OpenFiltersButton";
import MyButton from "../../common/MyButton";
import {BLACK, DEFAULT_SECONDARY_BUTTON} from "../../../styles/colors";
import FiltersIcon from '../../../assets/show-filters.png';

interface OpenFiltersButtonProps {
  openFilters: () => void;
}

const OpenFiltersButton = ({
  openFilters
}: OpenFiltersButtonProps): ReactElement => {
  return (
    <MyButton text={'Show filters'}
              onClick={openFilters}
              color={BLACK}
              backgroundColor={DEFAULT_SECONDARY_BUTTON}
              icon={<img src={FiltersIcon} style={styles.Icon} alt={'filters-icon'}/> }
              iconFirst
              className={'fw-regular hover-opaque'}
    />
  )
}

export default OpenFiltersButton;