import React, {useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import ExplorePage from "./components/ExplorePage/ExplorePage";
import AboutPage from "./components/AboutPage/AboutPage";
import Frame from "./components/Frame/Frame";
import {Optional} from "./utils/types";

const App = () => {

  const [userCenter, setUserCenter] = useState<Optional<Array<number>>>(null);

  return (
    <BrowserRouter>
      <Frame centerOnUser={setUserCenter}>
        <Routes>
          <Route path={'/explore'} element={<ExplorePage userCenter={userCenter}/>}/>
          <Route path={'/about'} element={<AboutPage/>}/>
          <Route path={'*'} element={<Navigate to={'/explore'} replace />} />
        </Routes>
      </Frame>
    </BrowserRouter>
  );
}

export default App;
