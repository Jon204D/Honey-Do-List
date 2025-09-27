import React from "react";
import {useNavigate} from "react-router-dom";
import ProfileIcon from "../assets/Bee.svg";

const ProfileLogo: React.FC = () => {
  const navigate = useNavigate();

  // Check if the user is logged in by reading localStorage
  // If "isLoggedIn" is set to "true", the user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/settings");
    } else {
      navigate("/login");
    }
  }

  return (
    <div onClick={handleClick} className="icon-circle">
      <img src={ProfileIcon} alt="Profile" className="profile-icon" />
    </div>
  )
}

export default ProfileLogo;