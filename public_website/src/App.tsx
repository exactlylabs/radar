import React, {ReactElement} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import { ViewportContextProvider } from './context/ViewportContent';
import { AppRoutes } from "./utils/navigation";
import Frame from "./components/Frame/Frame";
import HomePage from "./components/HomePage/HomePage";
import SiteMonitoringPage from "./components/SiteMonitoringPage/SiteMonitoringPage";
import BroadbandTestingPage from "./components/BroadbandTestingPage/BroadbandTestingPage";

const App = (): ReactElement => (
  <ViewportContextProvider>
    <BrowserRouter>
      <Frame>
        <Routes>
          <Route path={AppRoutes.BROADBAND_TESTING} element={<BroadbandTestingPage/>}/>
          <Route path={AppRoutes.SITE_MONITORING} element={<SiteMonitoringPage/>}/>
          <Route path={AppRoutes.HOME} element={<HomePage/>}/>
          <Route path={'*'} element={<Navigate to={AppRoutes.HOME} replace/>}/>
        </Routes>
      </Frame>
    </BrowserRouter>
  </ViewportContextProvider>
);

export default App;
