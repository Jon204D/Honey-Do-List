import AuthCard from "../Components/AuthCard";
import React, {useState, useEffect} from "react";
import {AuthButton} from "../Components/AuthStyles";
import EmailDisplay from "../Components/EmailDisplay";
import {useNavigate, useLocation} from "react-router-dom";
import PasswordDisplay from "../Components/PasswordDisplay";
import UsernameDisplay from "../Components/UsernameDisplay";

/* Account Settings
   - Displays username, email, and password
   - Allows user to reset username and password
   - Lets user log out */
const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* State variables for user info */
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* Success/Error Message */
  const message = location.state?.message;

  /* Reads fakeUser from localStorage
     Populates state variables with saved username, email, and password */
  useEffect(() => {
    const storedUser = localStorage.getItem("fakeUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setPassword(parsedUser.password || "");
    }
  }, []);

  /* Saves updated user info back into localStorage */
  const saveUser = (newUsername = username, newPassword = password) => {
    localStorage.setItem(
      "fakeUser",
      JSON.stringify({username: newUsername, email, password: newPassword})
    )
    setUsername(newUsername);
    setPassword(newPassword);
  }

  /* Clears the login flag from storage */
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login", {state: {message: "You have been logged out!"}});
  }

  return (
    /* Title */
    <AuthCard title="Account Settings">
      {message && <div style = {{color: "orange", marginBottom: "15px", fontWeight: "bold"}}>{message}</div>}

      {/* Username */}
      <UsernameDisplay
        username={username}
        password={password}
        saveUser={saveUser}
      />

      {/* Email */}
      <EmailDisplay email={email}/>

      {/* Password */}
      <PasswordDisplay
        username={username}
        password={password}
        saveUser={saveUser}
      />

      {/* Logout */}
      <div style={{marginTop: "20px"}}>
        <AuthButton 
          onClick={handleLogout} 
          variant="primary"
        >
          Log Out
        </AuthButton>
      </div>
    </AuthCard>
  )
}

export default Settings;