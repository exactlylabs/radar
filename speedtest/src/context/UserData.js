import {createContext, useEffect, useState} from "react";
import {ADDRESS_PROVIDER} from "../utils/userMetadata";
import {STEPS} from "../components/StepsPage/utils/steps";

/**
 * Custom context provider to expose shared config application-wide
 * and prevent prop-drilling.
 * @type {React.Context<{}>}
 */
const UserDataContext = createContext({});

export const emptyContactInformation = {
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
}

export const emptyAddress = {
  address: '',
  coordinates: [],
  city: '',
  street: '',
  state: '',
  postal_code: '',
  house_number: ''
};

export const emptyUserData = {
  currentStep: STEPS.INITIAL,
  address: emptyAddress,
  terms: false,
  networkLocation: null,
  networkType: null,
  networkCost: '', // init with empty string to prevent console error regarding controlled vs. uncontrolled input value change
  addressProvider: ADDRESS_PROVIDER.MANUAL,
  altitude: null, // provided by browser geolocation API
  accuracy: null, // provided by browser geolocation API
  altitudeAccuracy: null, // provided by browser geolocation API
  speed: null, // provided by browser geolocation API
  heading: null, // provided by browser geolocation API
  expectedDownloadSpeed: undefined,
  expectedUploadSpeed: undefined,
  contactInformation: emptyContactInformation,
};

export const UserDataContextProvider = ({children}) => {

  const [userData, setUserData] = useState(emptyUserData);

  const setAddress = address => setUserData(prev => ({...prev, address}));
  const setTerms = status => setUserData(prev => ({...prev, terms: status}));
  const setNetworkLocation = location => setUserData(prev => ({...prev, networkLocation: location }));
  const setNetworkType = chosenOption => setUserData(prev => ({...prev, networkType: chosenOption}));
  const setNetworkCost = cost => setUserData(prev => ({...prev, networkCost: cost }));
  const setExpectedSpeeds = speeds => setUserData(prev => ({ ...prev, expectedDownloadSpeed: speeds.download, expectedUploadSpeed: speeds.upload }));
  const setContactInformation = info => setUserData(prev => ({ ...prev, contactInformation: info }));
  const setCurrentStep = step => setUserData(prev => ({...prev, currentStep: step}));

  return (
    <UserDataContext.Provider value={{userData, setUserData, setAddress, setTerms, setNetworkLocation, setNetworkType, setNetworkCost, setExpectedSpeeds, setContactInformation, setCurrentStep}}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataContext;