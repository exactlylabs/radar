import {ReactElement} from "react";
import MyButton from "../../common/MyButton";
import {BLACK, DEFAULT_SECONDARY_BUTTON} from "../../../styles/colors";
import {ArrowForwardRounded} from "@mui/icons-material";
import {styles} from "./styles/HideFiltersButton.style";

interface HideFiltersButtonProps {
  closeFilters: () => void;
}

const HideFiltersButton = ({
  closeFilters
}: HideFiltersButtonProps): ReactElement => {
  return (
    <MyButton text={'Hide'}
              onClick={closeFilters}
              icon={<ArrowForwardRounded style={styles.Icon}/>}
              iconFirst
              color={BLACK}
              backgroundColor={DEFAULT_SECONDARY_BUTTON}
              className={'fw-regular hover-opaque'}
    />
  )
}

export default HideFiltersButton;