import "../../Styles/App.css"; 
import React from "react";
import ProfileLogo from "../Profile/ProfileLogo";
import {Outlet, Link} from "react-router-dom";
import {ReactComponent as HomeIcon} from "../../assets/Honey.svg";

/* Navigation bar at the top of every page */
const NavigationBar: React.FC = () => {
  return (
    <div>
      <nav className="navbar">
        <div className="icon-wrapper">
          {/* Left: Home icon */}
        <Link to="/" className="icon-circle"> 
          <HomeIcon />
        </Link>
        <span className="icon-hover-text">Task Board</span>
        </div>
        

        {/* Middle: Title */}
         <Link to="/" className="title">
            Honey-Do List
        </Link>

        <div className="icon-wrapper">
             {/* Right: Profile icon */}
          <ProfileLogo />
          <span className="icon-hover-text">Profile</span>
        </div>
     

      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default NavigationBar;