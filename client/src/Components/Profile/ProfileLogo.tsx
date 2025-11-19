// src/Components/Profile/ProfileLogo.tsx
import React from "react";
import {useNavigate} from "react-router-dom";
import ProfileIcon from "../../assets/Bee.svg";

/* Profile icon on the right of navigation bar 
   - If not logged in, go to "Login" page
   - If logged in, go to "Settings" page */
const ProfileLogo: React.FC = () => {
  const navigate = useNavigate();

  const isSessionValid = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) return false;
    const expiry = Number(localStorage.getItem("sessionExpiry") || 0);
    return !expiry || Date.now() < expiry;
  };

  const handleClick = () => {
    if (isSessionValid()) {
      navigate("/settings");
    } else {
      navigate("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="icon-circle"
      aria-label="Profile"
      style={{border: "none", padding: 0, cursor: "pointer"}}
    >
      <img src={ProfileIcon} alt="" className="profile-icon" />
    </button>
  )
}

export default ProfileLogo;