// src/Pages/Settings.tsx
import AuthCard from "../Components/Auth/AuthCard";
import React, { useState, useEffect } from "react";
import FormMessage from "../Components/Auth/FormMessage";
import { AuthButton } from "../Components/Auth/AuthStyles";
import EmailDisplay from "../Components/Profile/EmailDisplay";
import { useNavigate, useLocation } from "react-router-dom";
import PasswordDisplay from "../Components/Profile/PasswordDisplay";
import UsernameDisplay from "../Components/Profile/UsernameDisplay";

/* Account Settings
   - Displays username, email, and password
   - Allows user to edit username and password
   - Reads user data from localStorage, or backend later
   - Save changes to backend or falls back to localStorage
   - Lets user log out */
const Settings: React.FC = () => {
  useEffect(() => {
    document.title = "Settings - Honey-Do List";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState<string>("");

  // State variables for user info
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Success / Error Messages
  const [formMessage, setFormMessage] = useState<string | null>(
    (location.state as any)?.message || null
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
      setUserId(parsedUser._id || parsedUser.id || "");
    }
  }, []);

  /* Sends updates to backend
     - If backend succeeds: updates state & localStorage
     - If backend fails: shows backend error message
     - If network error: fallback to localStorage */
  const saveUser = async (newUsername = username, newPassword = password,  message = "Settings updated successfully!",  onSuccess?: () => void) => {
    if (!newUsername || !newPassword) {
      setFormMessage("Username and password are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend Request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  // Logout → clear storage, notify navbar, go to Landing
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTimestamp");
    localStorage.removeItem("sessionExpiry");
    localStorage.removeItem("authToken");
    localStorage.removeItem("fakeUser");
    window.dispatchEvent(new Event("sessionchange"));
    navigate("/", { state: { message: "You have been logged out!" } });
  };

  return (
    <AuthCard title="Account Settings">
      {formMessage && <FormMessage message={formMessage} />}

      <UsernameDisplay
        username={username}
        password={password}
        saveUser={(newUsername, currentPassword) =>
          saveUser(newUsername, currentPassword, "Username updated!")
        }
        isSubmitting={isSubmitting}
      />

      <EmailDisplay email={email} />

      <PasswordDisplay
        username={username}
        password={password}
        saveUser={(currentUsername, newPassword) =>
          saveUser(currentUsername, newPassword, "Password updated!")
        }
        isSubmitting={isSubmitting}
      />

      <div style={{ marginTop: "20px" }}>
        <AuthButton onClick={handleLogout} variant="primary">
          Log Out
        </AuthButton>
      </div>
    </AuthCard>
  );
};

export default Settings;