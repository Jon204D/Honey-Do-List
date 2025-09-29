import React, {useState} from "react";
import AuthCard from "../Components/AuthCard";
import {useNavigate, useLocation} from "react-router-dom";
import {AuthInput, AuthButton} from "../Components/AuthStyles";

/* Displays Login Form
   - Checks credentials saved in localStorage by SignUp
   - sets "isLoggedIn" flag if they match
   - displays success/error messages */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();               // Reading messages passed in navigation
  const [email, setEmail] = useState("");
  const message = location.state?.message;
  const [password, setPassword] = useState("");

  /* Login Form */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    /* Get the stored user from localStorage */
    const savedUser = localStorage.getItem("fakeUser");
  
    if (savedUser) {
      // Parse saved user and check credentials
      const {email: savedEmail, password: savedPassword} = JSON.parse(savedUser);

    if (email === savedEmail && password === savedPassword) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/settings", {state: {message: "Welcome back!"}});
    } else {
      navigate("/login", {state: {message: "Invalid email or password!"}});
    }
  } else {
    navigate("/signup", {state: {message: "No account found!"}});
  }
}

  return (
    <AuthCard title="Log In">
      {/* Success/Error Messages */}
      {message && <p style = {{color: "orange", fontWeight: "bold"}}>{message}</p>}   
      
      {/* Login Form */}
      <form onSubmit={handleLogin} style = {{display: "flex", flexDirection: "column", gap: "10px"}}>
        
        {/* Email Input */}
        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit Button */}
        <AuthButton 
          type="submit" 
          variant="primary">
            Log In
        </AuthButton>
      </form>

      {/* Forgot Password & Create Account */}
      <div 
        style = {{
          marginTop: "20px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px"
        }}
      >

        <AuthButton 
          onClick={() => navigate("/forgot-password")} 
          variant="secondary">
            Forgot Password?
        </AuthButton>

        <AuthButton 
          onClick={() => navigate("/signup")} 
          variant="secondary">
            Create Account
        </AuthButton>
        
      </div>
    </AuthCard>
  )
}

export default Login;