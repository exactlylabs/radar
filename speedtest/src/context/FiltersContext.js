import {createContext, useState} from "react";
import {
  firstDayOfCurrentYear,
  firstDayOfLastYear, getInitialTime, getRangeLabel,
  getToday,
  lastDayOfLastYear,
  sixMonthsFromToday
} from "../utils/dates";

export const VIEW_BY = {
  CLASSIFICATION: 'classification',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
}

export const CLASSIFICATIONS = {
  NO_INTERNET: 'no-internet',
  UNSERVED: 'unserved',
  UNDERSERVED: 'underserved',
  SERVED: 'served',
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

export const DATE_RANGE_LABELS = {
  LAST_6_MONTHS: 'Last 6 months',
  THIS_YEAR: 'This year',
  LAST_YEAR: 'Last year',
  ALL_TIME: 'All time',
}

export const ALL_PROVIDERS_OPTION = {
  label: 'All providers',
  value: 'all_providers',
  default: true
}

const defaultFilters = {
  connectionTypes: [],
  isp: ALL_PROVIDERS_OPTION,
  from: getInitialTime('start'),
  to: getToday('end'),
  rangeLabel: DATE_RANGE_LABELS.ALL_TIME,
  minPrice: 0,
  maxPrice: 500,
  includeNoCost: true, // based on default design
  maxedOut: true,
  viewBy: VIEW_BY.CLASSIFICATION,
  viewByFilters: [CLASSIFICATIONS.NO_INTERNET, CLASSIFICATIONS.UNSERVED, CLASSIFICATIONS.UNDERSERVED, CLASSIFICATIONS.SERVED]
}

const FiltersContext = createContext(defaultFilters);

export const FiltersContextProvider = ({children}) => {

  const [filters, setFilters] = useState(defaultFilters);
  const [visibleIspList, setVisibleIspList] = useState(new Map());
  const [costDistributionList, setCostDistributionList] = useState([]);
  const [lastManualMapUpdate, setLastManualMapUpdate] = useState(new Date());

  const setConnectionTypes = connectionTypes => setFilters(prevState => ({...prevState, connectionTypes}));
  const setIsp = isp => setFilters(prevState => ({...prevState, isp}));
  const setFrom = from => setFilters(prevState => ({...prevState, from}));
  const setTo = to => setFilters(prevState => ({...prevState, to}));
  const setMinPrice = minPrice => setFilters(prevState => ({...prevState, minPrice}));
  const setMaxPrice = maxPrice => {
    setFilters(prevState => ({...prevState, maxPrice, maxedOut: false}));
  }
  const setMaxedOut = maxedOut => setFilters(prevState => ({...prevState, maxedOut}));
  const setIncludeNoCost = includeNoCost => setFilters(prevState => ({...prevState, includeNoCost}));
  const setRangeLabel = rangeLabel => setFilters(prevState => ({...prevState, rangeLabel}));

  const clearFilters = () => {
    setFilters(defaultFilters);
    setLastManualMapUpdate(new Date());
  }

  const setViewByFilters = viewByFilters => {
    setFilters(prevState => ({...prevState, viewByFilters}));
    setLastManualMapUpdate(new Date());
  }

  const setDateLabel = label => {
    if(label === DATE_RANGE_LABELS.LAST_6_MONTHS) {
      setFrom(sixMonthsFromToday('start'));
      setTo(getToday('end'));
    } else if (label === DATE_RANGE_LABELS.THIS_YEAR) {
      setFrom(firstDayOfCurrentYear('start'));
      setTo(getToday('end'));
    } else if (label === DATE_RANGE_LABELS.LAST_YEAR) {
      setFrom(firstDayOfLastYear('start'));
      setTo(lastDayOfLastYear('end'));
    } else if (label === DATE_RANGE_LABELS.ALL_TIME) {
      setFrom(getInitialTime('start'));
      setTo(getToday('end'));
    }
    setRangeLabel(label);
  }

  const setDates = (from, to) => {
    setFrom(from);
    setTo(to);
    setDateLabel(getRangeLabel(from, to));
  }

  const setViewBy = viewBy => {
    setFilters(prevState => ({
      ...prevState,
      viewBy,
      viewByFilters:
        viewBy === VIEW_BY.CLASSIFICATION ? Object.values(CLASSIFICATIONS) :
        viewBy === VIEW_BY.DOWNLOAD ? Object.values(SPEED_RANGE) :
        Object.values(SPEED_RANGE),
    }));
    setLastManualMapUpdate(new Date());
  }

  const getFiltersAsSearchParams = () => {
    const params = new URLSearchParams();
    filters.connectionTypes.forEach(ct => params.append('connection_type[]', ct));
    params.append('isp', filters.isp.value);
    params.append('from', filters.from.getTime());
    params.append('to', filters.to.getTime());
    params.append('min_price', filters.minPrice);
    params.append('max_price', filters.maxPrice);
    params.append('include_no_cost', filters.includeNoCost);
    params.append('maxed_out', filters.maxedOut);
    params.append('view_by', filters.viewBy);
    filters.viewByFilters.forEach(vbf => params.append('view_by_filters[]', vbf));
    return params;
  }

  return (
    <FiltersContext.Provider value={{filters, setMaxedOut, costDistributionList, setCostDistributionList, lastManualMapUpdate, clearFilters, setConnectionTypes, setIsp, setDateLabel, setDates, setMinPrice, setMaxPrice, setIncludeNoCost, setViewByFilters, setViewBy, visibleIspList, setVisibleIspList, getFiltersAsSearchParams}}>
      {children}
    </FiltersContext.Provider>
  );
}

export default FiltersContext;