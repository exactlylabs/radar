import {ReactElement, useState} from "react";
import {styles} from "./styles/ModalContentSpeedType.style";
import {SpeedFilters} from "../../../../utils/filters";
import Option from "../../../ExplorePage/TopFilters/Option";
import CustomFullWidthButton from "../../CustomFullWidthButton";

interface ModalContentSpeedTypeProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  closeModal: () => void;
}

const ModalContentSpeedType = ({
  selectedOption,
  setSelectedOption,
  closeModal
}: ModalContentSpeedTypeProps): ReactElement => {

  const [innerOption, setInnerOption] = useState(selectedOption);

  const selectDownload = () => setSelectedOption(SpeedFilters.DOWNLOAD);
  const selectUpload = () => setSelectedOption(SpeedFilters.UPLOAD);

  const previewDownloadSelected = () => setInnerOption(SpeedFilters.DOWNLOAD);
  const previewUploadSelected = () => setInnerOption(SpeedFilters.UPLOAD);

  const applyOptionSelected = () => {
    innerOption === SpeedFilters.DOWNLOAD ?
      selectDownload() : selectUpload();
    closeModal();
  }

  return (
    <div style={styles.ModalContentSpeedType}>
      <p className={'fw-medium'} style={styles.Title}>Filter speeds by</p>
      <div style={styles.ModalContentSpeedTypeContainer}>
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

export default ModalContentSpeedType;