import React from "react";
import {Link} from "react-router-dom";

const Login: React.FC = () => {
    return (
        <div>
            <h1>Login Page</h1>
            
            <p>Please Enter Username:</p>
            <input type="text" placeholder="username" />
            <p>Please Enter Password:</p>
            <input type="text" placeholder="password" 
            style={{display: "block",}}/>
            <button>Submit</button>

            <ul>
                <li><Link to="/forgotpassword">Forgot Password</Link></li>
            </ul>
        </div> 
    )  
}
export default Login;