import React from "react";

const ForgotPassword: React.FC = () => {
    return (
        <div>
            <h1>Forgot Password Page</h1>   
            <p>Please Enter Email or Username:</p>
            <input type="text" placeholder="email or username" 
            style={{display: "block",}}/>
            <button>Save</button>
        </div>
    )
}

export default ForgotPassword;