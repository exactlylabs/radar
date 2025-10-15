import React, { Suspense } from 'react';
import {ConfigContextProvider} from "./context/ConfigContext";
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import {ViewportContextProvider} from "./context/ViewportContext";
import {ConnectionContextProvider} from "./context/ConnectionContext";
import MainPage from "./components/MainPage/MainPage";
import {UserDataContextProvider} from "./context/UserData";
import {SpeedTestContextProvider} from "./context/SpeedTestContext";
import {AlertsContextProvider} from "./context/AlertsContext";
import {FiltersContextProvider} from "./context/FiltersContext";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  // Loading fallback while translations load
  const LoadingFallback = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px',
      color: '#666'
    }}>
      Loading...
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ViewportContextProvider>
        <ConfigContextProvider value={config}>
          <AlertsContextProvider>
            <ThemeProvider theme={theme}>
              <ConnectionContextProvider>
                <UserDataContextProvider>
                  <SpeedTestContextProvider>
                    <FiltersContextProvider>
                      <MainPage config={config}/>
                    </FiltersContextProvider>
                  </SpeedTestContextProvider>
                </UserDataContextProvider>
              </ConnectionContextProvider>
            </ThemeProvider>
          </AlertsContextProvider>
        </ConfigContextProvider>
      </ViewportContextProvider>
    </Suspense>
  );
};

export default App;
