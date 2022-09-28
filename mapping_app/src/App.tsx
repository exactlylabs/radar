import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
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
