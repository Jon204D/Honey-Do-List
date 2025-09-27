import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import ForgotPassword from "./Pages/ForgotPassword";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import ResetPassword from "./Pages/ResetPassword";
import ResetUsername from "./Pages/ResetUsername";
import Settings from "./Pages/Settings";
import SignUp from "./Pages/SignUp";
import InvitesPage from './Pages/Invite';

const App: React.FC = () => 
{
  return (
    <Router>
      <nav style={{padding: "1rem", background: "#eee"}}>
        <Link to="/" style={{marginRight: "1rem"}}>Home</Link>
        <Link to="/signup" style={{marginRight: "1rem"}}>Sign Up</Link>
        <Link to="/login" style={{marginRight: "1rem"}}>Login</Link>
        <Link to="/settings" style={{marginRight: "1rem"}}>Settings</Link>
        <Link to="/invite" style={{marginRight: "1rem"}}>Invite</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/resetpassword" element={<ResetPassword/>} />
        <Route path="/resetusername" element={<ResetUsername/>} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/invite" element={<InvitesPage />} />
      </Routes>
    </Router>    
  )
}

export default App;
