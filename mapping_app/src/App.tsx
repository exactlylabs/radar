import React, {useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ExplorePage from "./components/ExplorePage/ExplorePage";
import AboutPage from "./components/AboutPage/AboutPage";
import {Optional} from "./utils/types";
import { ViewportContextProvider } from './context/ViewportContent';
import {MenuContextProvider} from "./context/MenuContent";
import Frame from "./components/Frame/Frame";

const App = () => {

  const [userCenter, setUserCenter] = useState<Optional<Array<number>>>(null);

  return (
    <ViewportContextProvider>
      <MenuContextProvider>
        <BrowserRouter>
          <Frame centerOnUser={setUserCenter}>
            <Routes>
              <Route path={'/explore'} element={<ExplorePage userCenter={userCenter}/>}/>
              <Route path={'/about'} element={<AboutPage/>}/>
              <Route path={'*'} element={<Navigate to={'/explore'} replace />} />
            </Routes>
          </Frame>
        </BrowserRouter>
      </MenuContextProvider>
    </ViewportContextProvider>
  );
}

export default App;
