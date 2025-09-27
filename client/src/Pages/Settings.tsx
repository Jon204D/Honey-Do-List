import React from "react";
import {Link} from "react-router-dom";

const Settings: React.FC = () => {
    return (
        <div>
            <h1>Settings Page</h1>
        
            <ul>
                <li><Link to="/resetusername">Reset Username</Link></li>
                <li><Link to="/resetpassword">Reset Password</Link></li>            
            </ul>
        </div> 
    )  
}

export default Settings;