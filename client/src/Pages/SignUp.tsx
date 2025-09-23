import React from "react";

const SignUp: React.FC = () => {
    return ( 
        <div>
            <h1>Sign Up Page</h1>   

            <p>Please Enter Email:</p>
            <input type="text" placeholder="email" />
            <p>Please Enter Username:</p>
            <input type="text" placeholder="username" />
            <p>Please Enter Password:</p>
            <input type="text" placeholder="password" 
            style={{display: "block",}}/>
            <button>Save</button>
        </div>
    )
}

export default SignUp;