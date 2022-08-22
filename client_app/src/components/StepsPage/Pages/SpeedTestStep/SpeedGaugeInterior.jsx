import DownloadIcon from '../../../../assets/small-download-icon.png';
import DownloadIconDisabled from '../../../../assets/small-download-icon-disabled.png';
import UploadIcon from '../../../../assets/small-upload-icon.png';
import UploadIconDisabled from '../../../../assets/small-upload-icon-disabled.png';

const gaugeInteriorStyle = {
  width: 150,
  height: 150,
  position: 'relative',
  top: '-215px',
  left: '50%',
  transform: 'translateX(-50%)',
}

const sharedNumbersStyle = {
  color: 'rgba(160 159 183 / 50%)',
  position: 'absolute',
  fontWeight: 'bold',
  fontSize: 13
}

const zeroStyle = {
  ...sharedNumbersStyle,
  bottom: -6,
  left: 0,
}

const fiveStyle = {
  ...sharedNumbersStyle,
  bottom: 36,
  left: -23,
}

const tenStyle = {
  ...sharedNumbersStyle,
  bottom: 90,
  left: -20,
}

const fifteenStyle = {
  ...sharedNumbersStyle,
  bottom: 135,
  left: 15,
}

const twentyStyle = {
  ...sharedNumbersStyle,
  position: 'relative',
  top: -15
}

const thirtyStyle = {
  ...sharedNumbersStyle,
  bottom: 135,
  right: 15,
}

const fiftyStyle = {
  ...sharedNumbersStyle,
  bottom: 90,
  right: -20,
}

const seventyFiveStyle = {
  ...sharedNumbersStyle,
  bottom: 36,
  right: -26,
}

const hundredStyle = {
  ...sharedNumbersStyle,
  bottom: -6,
  right: 0,
}

const currentValueStyle = {
  fontSize: 38,
  fontWeight: 'bold',
  position: 'absolute',
  top: 60,
  left: '50%',
  transform: 'translateX(-50%)',
}

const mbpsStyle = {
  fontSize: 14,
  fontWeight: 'bold',
  position: 'absolute',
  top: 105,
  left: '50%',
  transform: 'translateX(-50%)',
}

const iconsWrapperStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: 'max-content',
  margin: '20px auto',
}

/**
 * Custom inner gauge values to display. These come with its own normalizer
 * to map actual result values to their correct position inside the rounded gauge.
 * For reference: /src/components/StepsPage/Pages/SpeedTestStep/utils/normalizer.js
 * @param currentValue: either download or upload current value in Mbps.
 * @param isDownloading: simple flag to know when the test is running the download/upload phase.
 * @returns {JSX.Element}
 */
const SpeedGaugeInterior = ({
  currentValue,
  isDownloading,
}) => {

  return (
    <div style={gaugeInteriorStyle}>
      <div style={zeroStyle}>0</div>
      <div style={fiveStyle}>5</div>
      <div style={tenStyle}>10</div>
      <div style={fifteenStyle}>15</div>
      <div style={twentyStyle}>20</div>
      <div style={thirtyStyle}>30</div>
      <div style={fiftyStyle}>50</div>
      <div style={seventyFiveStyle}>75</div>
      <div style={hundredStyle}>100</div>
      <div style={iconsWrapperStyle}>
        <img src={isDownloading ? DownloadIcon : DownloadIconDisabled}
             width={18}
             height={18}
             alt={'download-icon'}
             style={{marginRight: 10}}
        />
        <img src={isDownloading ? UploadIconDisabled : UploadIcon}
             width={18}
             height={18}
             alt={'download-icon'}
        />
      </div>
      <div style={currentValueStyle}>{currentValue}</div>
      <div style={mbpsStyle}>Mbps</div>
    </div>
  )
}

export default SpeedGaugeInterior;