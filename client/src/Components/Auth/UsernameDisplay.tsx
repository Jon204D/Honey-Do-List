import {useNavigate} from "react-router-dom";
import React, {useState, useEffect} from "react";
import {AuthButton} from "../components/AuthStyles";

interface Props {
  username: string;                                                 // Current saved username
  password: string;                                                 // Current saved password   
  saveUser: (newUsername: string, newPassword: string) => void;     // Saves updated user info
}

/* Displaying & Editing Username 
   - View Mode - shows username & "reset username" button
   - Edit Mode - shows input field & save/cancel buttons */
const UsernameDisplay: React.FC<Props> = ({username, password, saveUser}) => {
  const [editingUsername, setEditingUsername] = useState(false);        // Toggles between edit & view mode
  const [tempUsername, setTempUsername] = useState(username);           // Temporary input (in case user does not save)
  const navigate = useNavigate();

  /* Keeps tempUsername updated when parent username changes */
  useEffect(() => {
    setTempUsername(username);
  }, [username])

  return (
    <div
      style = {{
        fontWeight: "bold",
        marginBottom: "15px",
        textAlign: "left",
      }}
    >
      <label>Username</label>

      {editingUsername ? (
        <>
          {/* Edit Mode */}
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            style = {{
              width: "100%",
              padding: "8px",
              color: "orange",
              marginTop: "5px",
              borderRadius: "5px",
              backgroundColor: "#222",
              border: "1px solid orange",
            }}
          />
          <div
            style = {{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
            }}
          >
            {/* Save Button */}
            <AuthButton
              onClick={() => {
                saveUser(tempUsername, password);       // Call parent save function
                setEditingUsername(false);              // Exit edit mode
                navigate("/settings", {
                  state: {message: "Username updated!"},
                })
              }}
            >
              Save
            </AuthButton>

            {/* Cancel Button */}
            <AuthButton
              onClick={() => setEditingUsername(false)}
              variant="secondary"
            >
              Cancel
            </AuthButton>
          </div>
        </>
      ) : (
        <>

          {/* View Mode */}
          <div
            style = {{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "5px",
            }}
          >

            {/* Current Username */}
            <p style = {{ 
                fontWeight: "normal", 
                margin: 0 
                }}
            >
                {username}
            </p>

            {/* Switch to Edit */}
            <AuthButton
              onClick={() => setEditingUsername(true)}
              variant="secondary"
            >
              Reset Username
            </AuthButton>
          </div>
        </>
      )}
    </div>
  );
};

export default UsernameDisplay;