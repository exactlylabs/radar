import './App.css';
import {ConfigContextProvider} from "./context/ConfigContext";
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import {ViewportContextProvider} from "./context/ViewportContext";
import {
  Switch,
  Route,
  BrowserRouter as Router,
} from "react-router-dom";
import MainPage from "./components/MainPage/MainPage";
import OverviewPage from "./components/OverviewPage/OverviewPage";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ViewportContextProvider>
      <ConfigContextProvider value={config}>
        <ThemeProvider theme={theme}>
          <Router>
            <Switch>
              <Route exact path={'/overview'} component={OverviewPage}/>
              <Route>
                <MainPage config={config}/>
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </ConfigContextProvider>
    </ViewportContextProvider>
  );
};

export default App;
