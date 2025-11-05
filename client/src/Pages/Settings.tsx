import AuthCard from "../Components/Auth/AuthCard";
import React, { useState, useEffect } from "react";
import FormMessage from "../Components/Auth/FormMessage";
import { AuthButton } from "../Components/Auth/AuthStyles";
import EmailDisplay from "../Components/Profile/EmailDisplay";
import { useNavigate, useLocation } from "react-router-dom";
import PasswordDisplay from "../Components/Profile/PasswordDisplay";
import UsernameDisplay from "../Components/Profile/UsernameDisplay";
import Delete from "../Components/Profile/Delete";

/* Account Settings
   - Displays username, email, and password
   - Allows user to edit username and password
   - Reads user data from localStorage, or backend later
   - Save changes to backend or falls back to localStorage
   - Lets user log out
   - Lets user delete account permanently */
const Settings: React.FC = () => {
  useEffect(() => {
    document.title = "Settings - Honey-Do List";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  
  // State variables for user info
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Success / Error Messages
  const [formMessage, setFormMessage] = useState<string | null>(
    (location.state as any)?.message || null
  );

  // Disables buttons while submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [loaded, setLoaded] = useState(false);

  /* Reads fakeUser from localStorage
     Populates username, email, and password */
  useEffect(() => {
    const storedUser = localStorage.getItem("fakeUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setPassword(parsedUser.password || "");
      setUserId(parsedUser._id || parsedUser.id || "");
    }
    setLoaded(true);
  }, []);

  /* Sends updates to backend
     - If backend succeeds: updates state & localStorage
     - If backend fails: shows backend error message
     - If network error: fallback to localStorage */
  const saveUser = async (newUsername = username, newPassword = password, message = "Settings updated successfully!", onSuccess?: () => void) => {
    if (!newUsername || !newPassword) {
      setFormMessage("Username and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/users/user/${userId}`, {
          method: "PUT",
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
            id: userId,
          })
        );

        setFormMessage(message);

        onSuccess?.();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormMessage(errorData.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Network error:", error);

      // Local fallback
      localStorage.setItem(
        "fakeUser",
        JSON.stringify({
          username: newUsername,
          email,
          password: newPassword,
          id: userId,
        })
      );
      setUsername(newUsername);
      setPassword(newPassword);
      setFormMessage(`${message} (saved locally)`);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear only session data (used for logout)
  const clearSession = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTimestamp");
    localStorage.removeItem("sessionExpiry");
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("sessionchange"));
  };

  // Clear everything including user (used for delete)
  const clearAllAndGoHome = (message: string) => {
    clearSession();
    localStorage.removeItem("fakeUser");
    navigate("/", { state: { message } });
  };

  // Clear only session (used for logout)
  const clearSessionAndGoHome = (message: string) => {
    clearSession();
    navigate("/", { state: { message } });
  };

  const handleLogout = () => {
    clearSessionAndGoHome("You have been logged out!");
  };

  if (!loaded) {
    return (
      <AuthCard title="Account Settings">
        <div>Loading settings…</div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Account Settings">
      {formMessage && <FormMessage message={formMessage}/>}

      <div style={{display: "flex", flexDirection: "column", gap: 24, textAlign: "left"}}>
        <UsernameDisplay
          username={username}
          password={password}
          saveUser={(newUsername, currentPassword, onSuccess) =>
            saveUser(newUsername, currentPassword, "Username updated!", onSuccess)
          }
          isSubmitting={isSubmitting}
        />

        <EmailDisplay email={email} />

        <PasswordDisplay
          username={username}
          password={password}
          saveUser={(currentUsername, newPassword, onSuccess) =>
            saveUser(currentUsername, newPassword, "Password updated!", onSuccess)
          }
          isSubmitting={isSubmitting}
        />

        
        {/* Delete (left) and Log Out (right) */}
        <div
          style={{marginTop: 16, paddingTop: 16,  borderTop: "1px solid rgba(255,165,0,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center"}}
        >
          <Delete
            userId={userId}
            clearAllAndGoHome={clearAllAndGoHome}
            setFormMessage={setFormMessage}
          />

          <AuthButton
            onClick={handleLogout}
            variant="primary"
            style={{ width: "fit-content" }}
          >
            Log Out
          </AuthButton>
        </div>
      </div>
    </AuthCard>
  );
};

export default Settings;