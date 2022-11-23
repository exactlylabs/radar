import {ReactElement} from "react";
import {styles} from "./styles/OpenFiltersButton";
import CustomButton from "../../common/CustomButton";
import {BLACK, DEFAULT_SECONDARY_BUTTON} from "../../../styles/colors";
import FiltersIcon from '../../../assets/show-filters.png';

interface OpenFiltersButtonProps {
  openFilters: () => void;
}

const OpenFiltersButton = ({
  openFilters
}: OpenFiltersButtonProps): ReactElement => {
  return (
    <CustomButton text={'Show filters'}
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