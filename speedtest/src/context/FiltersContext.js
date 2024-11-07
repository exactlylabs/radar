import {createContext, useState} from "react";

export const CLASSIFICATIONS = {
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
}

export const SPEED_RANGE = {
  NO_INTERNET: 'no-internet',
  LOW: 'low',
  MID: 'mid',
  HIGH: 'high',
}

export const CONNECTION_TYPES = {
  WIRED: 'wired',
  WIFI: 'wifi',
  CELLULAR: 'cellular',
}

const defaultFilters = {
  connectionTypes: [],
  isp: null,
  from: null,
  to: null,
  minPrice: 0,
  maxPrice: undefined,
  includeNoCost: true, // based on default design
  classification: CLASSIFICATIONS.DOWNLOAD,
  speedRange: [SPEED_RANGE.NO_INTERNET, SPEED_RANGE.LOW, SPEED_RANGE.MID, SPEED_RANGE.HIGH],
}

const FiltersContext = createContext(defaultFilters);

export const FiltersContextProvider = ({children}) => {

  const [filters, setFilters] = useState(defaultFilters);
  const [visibleIspList, setVisibleIspList] = useState(new Map());

  const setConnectionTypes = connectionTypes => setFilters(prevState => ({...prevState, connectionTypes}));
  const setIsp = isp => setFilters(prevState => ({...prevState, isp}));
  const setFrom = from => setFilters(prevState => ({...prevState, from}));
  const setTo = to => setFilters(prevState => ({...prevState, to}));
  const setMinPrice = minPrice => setFilters(prevState => ({...prevState, minPrice}));
  const setMaxPrice = maxPrice => setFilters(prevState => ({...prevState, maxPrice}));
  const setIncludeNoCost = includeNoCost => setFilters(prevState => ({...prevState, includeNoCost}));
  const setClassification = classification => setFilters(prevState => ({...prevState, classification}));
  const setSpeedRange = speedRange => setFilters(prevState => ({...prevState, speedRange}));
  const clearFilters = () => setFilters(defaultFilters);

  return (
    <FiltersContext.Provider value={{filters, clearFilters, setConnectionTypes, setIsp, setFrom, setTo, setMinPrice, setMaxPrice, setIncludeNoCost, setClassification, setSpeedRange, visibleIspList, setVisibleIspList}}>
      {children}
    </FiltersContext.Provider>
  );
}

export default FiltersContext;