import React from "react";
import {useNavigate} from "react-router-dom";
import ProfileIcon from "../assets/Bee.svg";

/* Profile icon on the right of naviagtion bar 
   - If not logged in, go to "Login" page
   - If logged in, go to "Settings" page */
const ProfileLogo: React.FC = () => {
  const navigate = useNavigate();

  /* Check if the user is logged in by reading localStorage
     If "isLoggedIn" is set to "true", the user is logged in */
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/settings");
    } else {
      navigate("/login");
    }
  }

  return (
    /* Circular Wrapper */
    <div onClick={handleClick} className="icon-circle">                   
      <img src={ProfileIcon} alt="Profile" className="profile-icon" />
    </div>
  )
}

export default ProfileLogo;