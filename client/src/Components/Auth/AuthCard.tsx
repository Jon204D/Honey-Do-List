import React from "react";

interface AuthCardProps {
  title: string;                  // Heading at the top of the card
  children: React.ReactNode;      // Contents inside the card (inputs, buttons)
}

/* Orange background with black card in the middle */
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
          transform: "translate(-50%, -50%)",           // Centers card
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