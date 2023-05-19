import {
  DEFAULT_LINK_COLOR,
  DEFAULT_TITLE_COLOR,
} from "../../../../utils/colors";
import SelectedIcon from '../../../../assets/location-icon-blue.png';
import Icon from '../../../../assets/location-icon-gray.png';
import './SuggestionModalRow.css';

const rowStyle = {
  width: '312px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  borderRadius: '6px',
  cursor: 'pointer',
  margin: '0 auto 12px'
}

const IconStyle = {
  width: '32px',
  height: '32px',
  marginRight: '10px'
}

const titleStyle = {
  fontSize: '15px',
  color: DEFAULT_TITLE_COLOR,
  margin: '0 0 3px 0'
}

const subtitleStyle = {
  fontSize: '13px',
  color: DEFAULT_LINK_COLOR,
  margin: '0',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '265px'
}

const textContainerStyle = {
  height: '100%',
  width: 'calc(100% - 42px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const SuggestionModalRow = ({
  suggestion,
  selectSuggestion,
  selected
}) => {

  return (
    <div style={rowStyle}
         className={`speedtest--suggestion-modal-row ${selected ? 'speedtest--suggestion-modal-row--selected' : ''}`}
         onClick={selectSuggestion}
    >
      <img src={selected ? SelectedIcon : Icon}
           alt={'suggestion pin icon'}
           style={IconStyle}
      />
      <div style={textContainerStyle}>
        <p className={'speedtest--p speedtest--bold'} style={titleStyle}>{`${suggestion.house_number} ${suggestion.street}`}</p>
        <p style={subtitleStyle}>{`${suggestion.city}, ${suggestion.state} ${suggestion.postal_code}`}</p>
      </div>
    </div>
  )
}

export default SuggestionModalRow;