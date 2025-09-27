import React from 'react';
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import NavigationBar from './components/NavigationBar';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<NavigationBar/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/signup" element={<SignUp/>} />
        </Route>
      </Routes>
    </Router>    
  )
}

export default App;