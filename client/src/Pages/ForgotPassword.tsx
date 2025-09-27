import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import { useNavigate } from "react-router-dom";
import { AuthInput, AuthButton } from "../components/AuthStyles";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Back to login page
    navigate("/login", {state: {message: "Password link set to your email!"}});
  }

  return (
    <AuthCard title="Forgot Password">
      <form
        onSubmit={handleSubmit}
        style = {{
          display: "flex", 
          flexDirection: "column", 
          gap: "10px"
        }}
      >

        <AuthInput
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthButton 
          type="submit" 
          variant="primary">
            Send Reset Link
        </AuthButton>

      </form>
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
    </AuthCard>
  )
}

export default ForgotPassword;