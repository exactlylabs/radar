import {ReactElement} from "react";
import MyButton from "../../common/MyButton";
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
    <MyButton text={'Hide'}
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