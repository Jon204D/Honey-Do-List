import AuthCard from "../Components/AuthCard";
import React, {useState, useEffect} from "react";
import FormMessage from "../Components/FormMessage";
import {AuthButton} from "../Components/AuthStyles";
import EmailDisplay from "../Components/EmailDisplay";
import {useNavigate, useLocation} from "react-router-dom";
import PasswordDisplay from "../Components/PasswordDisplay";
import UsernameDisplay from "../Components/UsernameDisplay";

/* Account Settings
   - Displays username, email, and password
   - Allows user to edit username and password
   - Reads user data from localStorage, or backend later
   - Save changes to backend or falls back to localStorage
   - Lets user log out */
const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State variables for user info
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Success / Error Messages
  const [formMessage, setFormMessage] = useState<string | null>(
    location.state?.message || null
  )

  // Disables buttons while submitting
  const [isSubmitting, setIsSubmitting] = useState(false);


  /* Reads fakeUser from localStorage
     Populates username, email, and password */
  useEffect(() => {
    const storedUser = localStorage.getItem("fakeUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setPassword(parsedUser.password || "");
    }
  }, []);

  /* Sends updates to backend
     - If backend succeeds: updates state & localStorage
     - If backend fails: shows backend error message
     - If network error: fallback to localStorage */ 
  const saveUser = async (newUsername = username, newPassword = password,  message = "Settings updated successfully!") => {
    if (!newUsername || !newPassword) {
      setFormMessage("Username and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend Request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:3001'}/api/settings`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: newUsername,
          email,
          password: newPassword,
        }),
      }
      );

      // Backend Success
      if (response.ok) {
        setUsername(newUsername);
        setPassword(newPassword);

        // Save user in localStorage
        localStorage.setItem(
          "fakeUser",
          JSON.stringify({
            username: newUsername,
            email,
            password: newPassword,
          })
        )
        
        setFormMessage(message);        
      } else {
        // Backend responds with error
        const errorData = await response.json();
        setFormMessage(errorData.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Network error:", error);

      // fallback to localStorage
      localStorage.setItem(
        "fakeUser",
        JSON.stringify({
          username: newUsername,
          email,
          password: newPassword,
        })
      );
      setUsername(newUsername);
      setPassword(newPassword);
      setFormMessage(`${message} (saved locally)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clears the login flag from storage 
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login", {state: {message: "You have been logged out!"}});
  }

  return (
    /* Title */
    <AuthCard title="Account Settings">
      {formMessage && <FormMessage message={formMessage} />}


      {/* Username */}
      <UsernameDisplay
        username={username}
        password={password}
        saveUser={(newUsername, currentPassword) =>
          saveUser(newUsername, currentPassword, "Username updated!")
        }
        isSubmitting={isSubmitting}
      />

      {/* Email */}
      <EmailDisplay email={email}/>

      {/* Password */}
      <PasswordDisplay
        username={username}
        password={password}
        saveUser={(currentUsername, newPassword) =>
          saveUser(currentUsername, newPassword, "Password updated!")
        }
        isSubmitting={isSubmitting}
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