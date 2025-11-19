import React from "react";
import {AuthButton} from "./AuthStyles";
import {useNavigate} from "react-router-dom";

/* "Forgot Password?" & "Create Account" Buttons */
const LoginExtraButtons: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style = {{ 
        marginTop: "20px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "10px" 
      }}
    >

      <AuthButton 
        onClick = {() => navigate("/forgot-password")} 
        variant="secondary"
      >
        Forgot Password?
      </AuthButton>

      <AuthButton 
      data-tour="signup-button"  
        onClick={() => navigate("/signup")} 
        variant="secondary">
          Create Account
      </AuthButton>
    </div>
  );
};

export default LoginExtraButtons;