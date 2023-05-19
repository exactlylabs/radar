import {ReactElement, useState} from "react";
import Option from "../../../ExplorePage/TopFilters/Option";
import {styles} from "./styles/MenuContentSpeedType.style";
import CustomFullWidthButton from "../../CustomFullWidthButton";
import {SpeedFilters} from "../../../../utils/filters";

interface MenuContentSpeedTypeProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeMenu: () => void;
}

const MenuContentSpeedType = ({
  selectedOption,
  setSelectedOption,
  closeMenu
}: MenuContentSpeedTypeProps): ReactElement => {

  const [innerOption, setInnerOption] = useState(selectedOption);

  const selectDownload = () => setSelectedOption(SpeedFilters.DOWNLOAD);
  const selectUpload = () => setSelectedOption(SpeedFilters.UPLOAD);

  const previewDownloadSelected = () => setInnerOption(SpeedFilters.DOWNLOAD);
  const previewUploadSelected = () => setInnerOption(SpeedFilters.UPLOAD);

  const applyOptionSelected = () => {
    innerOption === SpeedFilters.DOWNLOAD ?
      selectDownload() : selectUpload();
    closeMenu();
  }

  return (
    <div style={styles.MenuContentSpeedType}>
      <p className={'fw-medium'} style={styles.Title}>Filter speeds by</p>
      <div style={styles.MenuContentSpeedTypeContainer}>
        <Option option={SpeedFilters.DOWNLOAD}
                selected={innerOption === SpeedFilters.DOWNLOAD}
                onClick={previewDownloadSelected}
        />
        <Option option={SpeedFilters.UPLOAD}
                selected={innerOption === SpeedFilters.UPLOAD}
                onClick={previewUploadSelected}
        />
      </div>
      <CustomFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default MenuContentSpeedType;