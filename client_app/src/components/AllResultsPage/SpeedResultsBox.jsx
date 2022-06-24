import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Adjust, CheckCircle } from '@mui/icons-material';
import { SPEED_FILTERS } from "../../constants";
import './SpeedResultsBox.css';

const SpeedResultsBox = ({ setFilter }) => {

  const [selectedFilter, setSelectedFilter] = useState(null);

  const selectFilter = filter => {
    if(selectedFilter === filter) {
      setSelectedFilter(null);
      setFilter(null);  
    } else {
      setSelectedFilter(filter);
      setFilter(filter);
    }
  }

  return (
    <Box component={Paper}>
      <List
        className={'my-list'}
        dense={false}
      >
        <ListItem
          className={'filter-list-item'}
          onClick={() => selectFilter(SPEED_FILTERS.HIGH)} 
          style={{ cursor: 'pointer', backgroundColor: selectedFilter === SPEED_FILTERS.HIGH ? 'rgba(245, 245, 245)' : ''}}
        >
          <ListItemIcon style={{minWidth: 'min-content', width: 'min-content'}}>
            {
              selectedFilter === SPEED_FILTERS.HIGH ?
              <CheckCircle style={{color: 'green'}}/> :
              <Adjust style={{color: 'green'}}/>
            }
          </ListItemIcon>
          <ListItemText
            className={`my-list-item-text ${selectedFilter === SPEED_FILTERS.HIGH ? 'bolder' : ''}`}
            style={{width: 'min-content', textAlign: 'left', marginLeft: 10}}
            primary={'High speed'}
            secondary={'> 50 mbps'}
          />
        </ListItem>
        <ListItem 
          className={'filter-list-item'}
          onClick={() => selectFilter(SPEED_FILTERS.MID)}
          style={{ backgroundColor: selectedFilter === SPEED_FILTERS.MID ? 'rgba(245, 245, 245)' : ''}}
        >
          <ListItemIcon style={{minWidth: 'min-content', width: 'min-content'}}>
            {
              selectedFilter === SPEED_FILTERS.MID ?
              <CheckCircle style={{color: '#e2e22d'}}/> :
              <Adjust style={{color: '#e2e22d'}}/>
            }
          </ListItemIcon>
          <ListItemText
            className={`my-list-item-text ${selectedFilter === SPEED_FILTERS.MID ? 'bolder' : ''}`}
            style={{width: 'min-content', textAlign: 'left', marginLeft: 10}}
            primary={'Mid speed'}
            secondary={'< 30 mbps'}
          />
        </ListItem>
        <ListItem 
          className={'filter-list-item'}
          onClick={() => selectFilter(SPEED_FILTERS.LOW)} 
          style={{ cursor: 'pointer', backgroundColor: selectedFilter === SPEED_FILTERS.LOW ? 'rgba(245, 245, 245)' : ''}}
        >
          <ListItemIcon style={{minWidth: 'min-content', width: 'min-content'}}>
            {
              selectedFilter === SPEED_FILTERS.LOW ?
              <CheckCircle style={{color: 'red'}}/> :
              <Adjust style={{color: 'red'}}/>
            }
          </ListItemIcon>
          <ListItemText 
            className={`my-list-item-text ${selectedFilter === SPEED_FILTERS.LOW ? 'bolder' : ''}`}
            style={{width: 'min-content', textAlign: 'left', marginLeft: 10}}
            primary={'Low speed'}
            secondary={'< 15 mbps'}
          />
        </ListItem>
      </List>
    </Box>
  );
}

export default SpeedResultsBox;