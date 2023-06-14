import {ReactElement} from "react";
import CustomButton from "../../common/CustomButton";
import {BLACK, DEFAULT_SECONDARY_BUTTON} from "../../../styles/colors";
import {styles} from "./styles/HideFiltersButton.style";
import ArrowRightBlack from '../../../assets/arrow-right-black.png';

interface HideFiltersButtonProps {
  closeFilters: () => void;
}

const HideFiltersButton = ({
  closeFilters
}: HideFiltersButtonProps): ReactElement => {
  return (
    <CustomButton text={''}
                  onClick={closeFilters}
                  icon={<img src={ArrowRightBlack} style={styles.Icon} alt={'arrow-right'}/>}
                  iconFirst
                  color={BLACK}
                  backgroundColor={DEFAULT_SECONDARY_BUTTON}
                  className={'fw-regular hover-opaque'}
                  backdropFilter={'blur(10px)'}
    />
  )
}

export default HideFiltersButton;