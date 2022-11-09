import {ReactElement, useState} from "react";
import Option from "../../../ExplorePage/TopFilters/Option";
import {speedFilters} from "../../../../utils/filters";
import {styles} from "./styles/MenuContentSpeedType.style";
import MyFullWidthButton from "../../MyFullWidthButton";

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

  const selectDownload = () => setSelectedOption(speedFilters[0]);
  const selectUpload = () => setSelectedOption(speedFilters[1]);

  const previewDownloadSelected = () => setInnerOption(speedFilters[0]);
  const previewUploadSelected = () => setInnerOption(speedFilters[1]);

  const applyOptionSelected = () => {
    innerOption === speedFilters[0] ?
      selectDownload() : selectUpload();
    closeMenu();
  }

  return (
    <div style={styles.MenuContentSpeedType}>
      <p className={'fw-medium'} style={styles.Title}>Filter speeds by</p>
      <div style={styles.MenuContentSpeedTypeContainer}>
        <Option option={speedFilters[0]}
                selected={innerOption === speedFilters[0]}
                onClick={previewDownloadSelected}
        />
        <Option option={speedFilters[1]}
                selected={innerOption === speedFilters[1]}
                onClick={previewUploadSelected}
        />
      </div>
      <MyFullWidthButton text={'Apply'} onClick={applyOptionSelected}/>
    </div>
  )
}

export default MenuContentSpeedType;