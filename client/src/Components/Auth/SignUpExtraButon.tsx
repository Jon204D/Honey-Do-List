import React from "react";
import {AuthButton} from "./AuthStyles";
import {useNavigate} from "react-router-dom";

const SignUpExtraButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div 
      style = {{ 
        marginTop: "20px" 
      }}
    >
      <AuthButton 
        onClick={() => navigate("/login")} 
        variant="secondary">
          Back to Login
      </AuthButton>
    </div>
  );
};

export default SignUpExtraButton;