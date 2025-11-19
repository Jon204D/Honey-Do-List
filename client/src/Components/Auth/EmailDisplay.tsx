import React from "react";

interface Props {
  email: string;
}

/* Read-only display of email */
const EmailDisplay: React.FC<Props> = ({email}) => {
  return (
    <div style = {{ 
        fontWeight: "bold", 
        marginBottom: "15px", 
        textAlign: "left" 
        }}
    >
      <label>Email</label>
      <p style = {{ 
        fontWeight: "normal", 
        marginTop: "5px" 
        }}
      >
        {email}
      </p>
    </div>
  )
}

export default EmailDisplay;
