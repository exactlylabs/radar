import {ConfigContextProvider} from "./context/ConfigContext";
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import {ViewportContextProvider} from "./context/ViewportContext";
import {ConnectionContextProvider} from "./context/ConnectionContext";
import MainPage from "./components/MainPage/MainPage";
import {UserDataContextProvider} from "./context/UserData";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ViewportContextProvider>
      <ConfigContextProvider value={config}>
        <ThemeProvider theme={theme}>
          <ConnectionContextProvider>
            <UserDataContextProvider>
              <MainPage config={config}/>
            </UserDataContextProvider>
          </ConnectionContextProvider>
        </ThemeProvider>
      </ConfigContextProvider>
    </ViewportContextProvider>
  );
};

export default App;
