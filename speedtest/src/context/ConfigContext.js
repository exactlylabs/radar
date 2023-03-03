import {createContext} from "react";

/**
 * Custom context provider to expose shared config application-wide
 * and prevent prop-drilling.
 * @type {React.Context<{}>}
 */
const ConfigContext = createContext({});

export const ConfigContextProvider = ConfigContext.Provider;

export default ConfigContext;