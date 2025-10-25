import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/landing.css";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-card">

        <h3 className="subtitle">Please choose a login option:</h3>
        
        <div className="button-group">
          <button className="honey-rect" onClick={() => navigate("/Login")}>
            Log In
          </button>
          <button className="honey-rect" onClick={() => navigate("/SignUp")}>
            Sign Up
          </button>
          <button className="honey-rect" onClick={() => navigate("/Tasks")}>
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;