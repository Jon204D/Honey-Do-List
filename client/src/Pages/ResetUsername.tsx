import React, {useState} from "react";

interface ResetUsernameProps {
  username: string;                         // Current username 
  onCancel: () => void;                     // If user cancels
  onSave: (newUsername: string) => void;    // If user saves new username
}

/* Editing Username */
const ResetUsername: React.FC<ResetUsernameProps> = ({username, onCancel, onSave}) => {
  const [newUsername, setNewUsername] = useState(username);

  return (
    <div>

      <input
        type="text"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
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
        <button onClick={() => onSave(newUsername)}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>

    </div>
  )
}

export default ResetUsername;