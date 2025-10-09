import React from "react";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Settings from "./Pages/Settings";
import ForgotPassword from "./Pages/ForgotPassword";
import Tasks from "./Pages/Tasks";
import NavigationBar from "./Components/Navigation/NavigationBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <NavigationBar/>
      <Routes>
        <Route element={<NavigationBar/>}>
          <Route path="/" element={<Home/>}/>
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