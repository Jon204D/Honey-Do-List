import React, {useState} from "react";
import AuthCard from "../components/AuthCard";
import {useNavigate, useLocation} from "react-router-dom";
import {AuthInput, AuthButton} from "../components/AuthStyles";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const message = location.state?.message;
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUser = localStorage.getItem("fakeUser");
  
    if (savedUser) {
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
      {message && <p style = {{color: "orange", fontWeight: "bold"}}>{message}</p>}
      <form onSubmit={handleLogin} style = {{display: "flex", flexDirection: "column", gap: "10px"}}>
        
        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <AuthButton 
          type="submit" 
          variant="primary">
            Log In
        </AuthButton>

      </form>
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