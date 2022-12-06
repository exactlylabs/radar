import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import { ViewportContextProvider } from './context/ViewportContent';
import Frame from "./components/Frame/Frame";
import HomePage from "./components/HomePage/HomePage";

const App = () => {
  return (
    <ViewportContextProvider>
      <BrowserRouter>
        <Frame>
          <Routes>
            <Route path={'/home'} element={<HomePage/>}/>
            <Route path={'*'} element={<Navigate to={'/home'} replace/>}/>
          </Routes>
        </Frame>
      </BrowserRouter>
    </ViewportContextProvider>
  );
}

export default App;
