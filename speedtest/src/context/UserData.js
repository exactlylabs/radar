import {createContext, useEffect, useState} from "react";
import {ADDRESS_PROVIDER} from "../utils/userMetadata";

/**
 * Custom context provider to expose shared config application-wide
 * and prevent prop-drilling.
 * @type {React.Context<{}>}
 */
const UserDataContext = createContext({});

export const emptyAddress = {
  address: '',
  coordinates: [],
  city: '',
  street: '',
  state: '',
  postal_code: '',
  house_number: ''
};

export const emptyNetworkLocation = {
  id: -1,
  iconSrc: null,
  iconSelectedSrc: null,
  iconLightSrc: null,
  iconPopupSrc: null,
  text: '',
};

export const UserDataContextProvider = ({children}) => {

  const [userData, setUserData] = useState({
    address: emptyAddress,
    terms: false,
    networkLocation: emptyNetworkLocation,
    networkType: null,
    networkCost: '', // init with empty string to prevent console error regarding controlled vs. uncontrolled input value change
    addressProvider: ADDRESS_PROVIDER.MANUAL,
    altitude: null, // provided by browser geolocation API
    accuracy: null, // provided by browser geolocation API
  });

  useEffect(() => {
    console.log('useEffect', userData);
  }, [userData]);

  const setAddress = address => setUserData(prev => ({...prev, address}));
  const setTerms = status => setUserData(prev => ({...prev, terms: status}));
  const setNetworkLocation = location => setUserData(prev => ({...prev, networkLocation: location }));
  const setNetworkType = chosenOption => setUserData(prev => ({...prev, networkType: chosenOption}));
  const setNetworkCost = cost => setUserData(prev => ({...prev, networkCost: cost }));

  return (
    <UserDataContext.Provider value={{userData, setUserData, setAddress, setTerms, setNetworkLocation, setNetworkType, setNetworkCost}}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataContext;