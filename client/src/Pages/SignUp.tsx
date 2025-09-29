import React, {useState} from "react";
import AuthCard from "../Components/AuthCard";
import {useNavigate} from "react-router-dom";
import {AuthInput, AuthButton} from "../Components/AuthStyles";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // Save fake user in localStorage
    localStorage.setItem(
      "fakeUser",
      JSON.stringify({ username, email, password })
    )

    // Redirect with success message
    navigate("/login", { state: { message: "Account created! Please log in." } });
  }

  return (
    <AuthCard title="Create Account">
      <form
        onSubmit={handleSignUp}
        style = {{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px" 
        }}
      >
        <AuthInput
          type="text"
          name="username" 
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <AuthInput
          type="email"
          name="email" 
          placeholder="Email"
          autoComplete="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthInput
          type="password"
          name="password" 
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <AuthButton 
          type="submit" 
          variant="primary">
            Create Account
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

export default SignUp;