import {ConfigContextProvider} from "./context/ConfigContext";
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import {ViewportContextProvider} from "./context/ViewportContext";
import {ConnectionContextProvider} from "./context/ConnectionContext";
import MainPage from "./components/MainPage/MainPage";
import {useEffect} from "react";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  useEffect(() => {
    // Always force meta tag for explicitly setting encoding
    const possibleCharsetTag = document.querySelector('[charset="UTF-8"]');
    if(!possibleCharsetTag) {
      const metaCharsetElement = document.createElement('meta');
      metaCharsetElement.setAttribute('charset', 'UTF-8');
      document.head.appendChild(metaCharsetElement);
    }
  }, []);

  return (
    <ViewportContextProvider>
      <ConfigContextProvider value={config}>
        <ThemeProvider theme={theme}>
          <ConnectionContextProvider>
            <MainPage config={config}/>
          </ConnectionContextProvider>
        </ThemeProvider>
      </ConfigContextProvider>
    </ViewportContextProvider>
  );
};

export default App;
