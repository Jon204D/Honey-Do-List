import React from "react";
import {Link} from "react-router-dom";

const NavigationBar: React.FC = () => {
    return (
        <nav style={{padding: "1rem", background: "#eee"}}>
            <Link to="/">Home</Link> | <Link to="/signup">SignUp</Link> | <Link to="/login">Login</Link> | <Link to="/settings">Settings</Link>
        </nav>
    )
}

export default NavigationBar;