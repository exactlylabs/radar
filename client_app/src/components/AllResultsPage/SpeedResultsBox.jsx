import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Adjust, CheckCircle } from '@mui/icons-material';
import { DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD, SPEED_FILTERS } from '../../utils/speeds';
import './SpeedResultsBox.css';
import {DEFAULT_SPEED_FILTER_BACKGROUND_COLOR, DEFAULT_SPEED_FILTER_BOX_SHADOW, WHITE} from "../../utils/colors";

const speedFiltersBoxStyle = {
  width: 275,
  height: 300,
  borderRadius: 16,
  backgroundColor: DEFAULT_SPEED_FILTER_BACKGROUND_COLOR,
  boxShadow: DEFAULT_SPEED_FILTER_BOX_SHADOW,
  position: 'absolute',
  bottom: 200,
  right: 25,
  zIndex: 1000,
  color: WHITE,
}

const SpeedResultsBox = ({ selectedFilter, setSelectedFilter }) => {
  const handleFilterClick = e => {
    e.preventDefault();
    const target = e.target.offsetParent ?? e.target;
    const filterName = target.getAttribute('name');
    setSelectedFilter(selectedFilter === filterName ? null : filterName);
  };

  return (
    <div style={speedFiltersBoxStyle}>
      <My
      <List className={'speed-results-box--my-list'} dense={false}>
        <ListItem
          className={'speed-results-box--filter-list-item'}
          onClick={handleFilterClick}
          name={SPEED_FILTERS.HIGH}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedFilter === SPEED_FILTERS.HIGH ? 'rgba(245, 245, 245)' : '',
          }}
        >
          <ListItemIcon style={{ minWidth: 'min-content', width: 'min-content' }} name={SPEED_FILTERS.HIGH}>
            {selectedFilter === SPEED_FILTERS.HIGH ? (
              <CheckCircle style={{ color: 'green' }} name={SPEED_FILTERS.HIGH} />
            ) : (
              <Adjust style={{ color: 'green' }} name={SPEED_FILTERS.HIGH} />
            )}
          </ListItemIcon>
          <ListItemText
            className={`speed-results-box--my-list-item-text ${selectedFilter === SPEED_FILTERS.HIGH ? 'bolder' : ''}`}
            name={SPEED_FILTERS.HIGH}
            style={{ width: 'min-content', textAlign: 'left', marginLeft: 10 }}
            primary={'High speed'}
            secondary={`> ${DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH} mbps`}
          />
        </ListItem>
        <ListItem
          className={'speed-results-box--filter-list-item'}
          onClick={handleFilterClick}
          name={SPEED_FILTERS.MID}
          style={{ backgroundColor: selectedFilter === SPEED_FILTERS.MID ? 'rgba(245, 245, 245)' : '' }}
        >
          <ListItemIcon style={{ minWidth: 'min-content', width: 'min-content' }}>
            {selectedFilter === SPEED_FILTERS.MID ? (
              <CheckCircle style={{ color: '#e2e22d' }} name={SPEED_FILTERS.MID} />
            ) : (
              <Adjust style={{ color: '#e2e22d' }} name={SPEED_FILTERS.MID} />
            )}
          </ListItemIcon>
          <ListItemText
            className={`speed-results-box--my-list-item-text ${selectedFilter === SPEED_FILTERS.MID ? 'bolder' : ''}`}
            style={{ width: 'min-content', textAlign: 'left', marginLeft: 10 }}
            primary={'Mid speed'}
            secondary={`< ${DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.HIGH} mbps`}
          />
        </ListItem>
        <ListItem
          className={'speed-results-box--filter-list-item'}
          name={SPEED_FILTERS.LOW}
          onClick={handleFilterClick}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedFilter === SPEED_FILTERS.LOW ? 'rgba(245, 245, 245)' : '',
          }}
        >
          <ListItemIcon style={{ minWidth: 'min-content', width: 'min-content' }}>
            {selectedFilter === SPEED_FILTERS.LOW ? (
              <CheckCircle style={{ color: 'red' }} name={SPEED_FILTERS.LOW} />
            ) : (
              <Adjust style={{ color: 'red' }} name={SPEED_FILTERS.LOW} />
            )}
          </ListItemIcon>
          <ListItemText
            className={`speed-results-box--my-list-item-text ${selectedFilter === SPEED_FILTERS.LOW ? 'bolder' : ''}`}
            style={{ width: 'min-content', textAlign: 'left', marginLeft: 10 }}
            primary={'Low speed'}
            secondary={`< ${DOWNLOAD_SPEED_LOW_TO_MID_THRESHOLD.MID} mbps`}
          />
        </ListItem>
      </List>
    </div>
  );
};

export default SpeedResultsBox;
