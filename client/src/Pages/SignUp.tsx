import React, {useState} from "react";
import AuthCard from "../components/AuthCard";
import {useNavigate} from "react-router-dom";
import {AuthInput, AuthButton} from "../components/AuthStyles";

/* Registers username, email, and password
   - Saves a fake user into localStorage
   - Goes back to the "Login" page */
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

    /* Title */
    <AuthCard title="Create Account">
      <form
        onSubmit={handleSignUp}
        style = {{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px" 
        }}
      >

        {/* Username */}
        <AuthInput
          type="text"
          name="username" 
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Email */}
        <AuthInput
          type="email"
          name="email" 
          placeholder="Email"
          autoComplete="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <AuthInput
          type="password"
          name="password" 
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Create Button */}
        <AuthButton 
          type="submit" 
          variant="primary">
            Create Account
        </AuthButton>
      </form>

      {/* Navigate to Login */}
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