// src/App.tsx
import React from "react";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Settings from "./Pages/Settings";
import ForgotPassword from "./Pages/ForgotPassword";
import NavigationBar from './Components/Navigation/NavigationBar';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import InvitesPage from './Pages/Invite';
import Tasks from "./Pages/Tasks";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<NavigationBar/>}>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/tasks" element={<Tasks/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/invite" element={<InvitesPage/>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;