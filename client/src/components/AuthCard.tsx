import React from "react";

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({title, children}) => {
  return (
    <div
      style = {{
        width: "100%",
        height: "100vh",
        backgroundColor: "orange", 
      }}
    >
      <div
        style = {{
          top: "50%",                  
          left: "50%",                 
          width: "300px",
          padding: "30px",
          color: "orange",
          position: "fixed",                                    
          textAlign: "center",
          borderRadius: "10px",
          backgroundColor: "#212121",
          transform: "translate(-50%, -50%)", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{margin: "0 0 15px 0"}}>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default AuthCard;