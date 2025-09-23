import React from "react";

const ResetPassword: React.FC = () => {
    return (
        <div>
            <h1>Reset Password Page</h1>   
            <p>Please Enter new password:</p>
            <input type="text" placeholder="password" 
            style={{display: "block",}}/>
            <button>Save</button>
        </div>
    )
}

export default ResetPassword;