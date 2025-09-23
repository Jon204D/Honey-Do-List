import React from "react";

const ResetUsername: React.FC = () => {
    return (
        <div>
            <h1>Reset Username Page</h1>   
            <p>Please Enter Email:</p>
            <input type="text" placeholder="email" 
            style={{display: "block",}}/>
            <button>Save</button>
        </div>
    )
}

export default ResetUsername;