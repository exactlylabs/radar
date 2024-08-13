import {ConfigContextProvider} from "./context/ConfigContext";
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import {ViewportContextProvider} from "./context/ViewportContext";
import {ConnectionContextProvider} from "./context/ConnectionContext";
import MainPage from "./components/MainPage/MainPage";
import {UserDataContextProvider} from "./context/UserData";
import {SpeedTestContextProvider} from "./context/SpeedTestContext";
import {AlertsContextProvider} from "./context/AlertsContext";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ViewportContextProvider>
      <ConfigContextProvider value={config}>
        <AlertsContextProvider>
          <ThemeProvider theme={theme}>
            <ConnectionContextProvider>
              <UserDataContextProvider>
                <SpeedTestContextProvider>
                  <MainPage config={config}/>
                </SpeedTestContextProvider>
              </UserDataContextProvider>
            </ConnectionContextProvider>
          </ThemeProvider>
        </AlertsContextProvider>
      </ConfigContextProvider>
    </ViewportContextProvider>
  );
};

export default App;
