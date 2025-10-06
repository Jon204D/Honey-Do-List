import React, {useState, useEffect} from "react";

interface ResetPasswordProps {
  password: string;                         // Current password
  onCancel: () => void;                     // If user cancels
  onSave: (newPassword: string) => void;    // If user saves new password
}

/* Editing Password */
const ResetPassword: React.FC<ResetPasswordProps> = ({password, onCancel, onSave}) => {
   useEffect(() => {
        document.title = "Reset Password - Honey-Do List";
    }, []);

  const [newPassword, setNewPassword] = useState(password);

  return (
    <div>

      <input
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style = {{ 
          width: "100%", 
          padding: "8px", 
          marginTop: "5px" 
        }}
      />

      <div 
        style = {{ 
          marginTop: "10px", 
          display: "flex", 
          gap: "10px" 
        }}
      >
        <button onClick={() => onSave(newPassword)}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>

    </div>
  )
}

export default ResetPassword;