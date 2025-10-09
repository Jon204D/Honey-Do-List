import "../../Styles/App.css"; 
import React from "react";
import ProfileLogo from "../Profile/ProfileLogo";
import {Outlet, Link} from "react-router-dom";
import {ReactComponent as HomeIcon} from "../../Assets/Honey.svg";

/* Navigation bar at the top of every page */
const NavigationBar: React.FC = () => {
  return (
    <div>
      <nav
        style = {{
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          background: "#212121",
          justifyContent: "space-between",
        }}
      >
        {/* Left: Home icon */}
        <Link to="/" className="icon-circle">
          <HomeIcon />
        </Link>

        {/* Middle: Title */}
         <Link to="/" className="title">
            Honey-Do List
        </Link>

        {/* Right: Profile icon */}
          <ProfileLogo />

      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default NavigationBar;