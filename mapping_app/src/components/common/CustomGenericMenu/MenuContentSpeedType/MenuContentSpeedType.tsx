import {ReactElement, useState} from "react";
import Option from "../../../ExplorePage/TopFilters/Option";
import {speedFilters} from "../../../../utils/filters";
import {styles} from "./styles/MenuContentSpeedType.style";
import CustomFullWidthButton from "../../CustomFullWidthButton";

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

  const selectDownload = () => setSelectedOption(speedFilters.DOWNLOAD);
  const selectUpload = () => setSelectedOption(speedFilters.UPLOAD);

  const previewDownloadSelected = () => setInnerOption(speedFilters.DOWNLOAD);
  const previewUploadSelected = () => setInnerOption(speedFilters.UPLOAD);

  const applyOptionSelected = () => {
    innerOption === speedFilters.DOWNLOAD ?
      selectDownload() : selectUpload();
    closeMenu();
  }

  return (
    <div style={styles.MenuContentSpeedType}>
      <p className={'fw-medium'} style={styles.Title}>Filter speeds by</p>
      <div style={styles.MenuContentSpeedTypeContainer}>
        <Option option={speedFilters.DOWNLOAD}
                selected={innerOption === speedFilters.DOWNLOAD}
                onClick={previewDownloadSelected}
        />
        <Option option={speedFilters.UPLOAD}
                selected={innerOption === speedFilters.UPLOAD}
                onClick={previewUploadSelected}
        />
      </div>
      <CustomFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default MenuContentSpeedType;