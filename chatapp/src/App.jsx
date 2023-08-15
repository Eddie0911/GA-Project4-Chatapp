import React from 'react';
import axios from 'axios';
import { UserContextProvider } from './Components/UserContext';
import Routes from './Components/Mainpage';
import { BrowserRouter as Router, Routes as ReactRoutes, Route } from 'react-router-dom';
import Shop from './Components/Shop';
import Setting from './Components/Setting';
import Social from './Components/Social';
import Friends from './Components/Friends';

function App() {
  axios.defaults.baseURL = 'http://localhost:4040/';
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Router>
        <ReactRoutes>
          <Route path="/" element={<Routes />} />
          <Route path='/friend' element={<Friends />} />
          <Route path='/setting' element={<Setting />} />
          <Route path="/social" element={<Social />} />
          <Route path="/shop" element={<Shop />} />
        </ReactRoutes>
      </Router>
    </UserContextProvider>
  );
}

export default App;

