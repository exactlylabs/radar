import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ExplorePage from "./components/ExplorePage/ExplorePage";
import AboutPage from "./components/AboutPage/AboutPage";
import Frame from "./components/Frame/Frame";

const App = () => {

  return (
    <BrowserRouter>
      <Frame>
        <Routes>
          <Route path={'/explore'} element={<ExplorePage/>}/>
          <Route path={'/about'} element={<AboutPage/>}/>
          <Route path={'*'} element={<Navigate to={'/explore'} replace />} />
        </Routes>
      </Frame>
    </BrowserRouter>
  );
}

export default App;
