import {useNavigate} from "react-router-dom";
import React, {useState, useEffect} from "react";
import {AuthButton} from "../Auth/AuthStyles";

interface Props {
  username: string;                                                 // Current saved username   
  password: string;   
  isSubmitting: boolean;                                               // Current saved password   
  saveUser: (newUsername: string, newPassword: string) => void;     // Saves updated user info
}

/* Displaying & Editing Password 
   - View Mode - shows hidden password & "reset password" button
   - Edit Mode - shows input field & save/cancel buttons 
   - Toggle to show/hide password */
const PasswordDisplay: React.FC<Props> = ({username, password, saveUser, isSubmitting}) => {
  const [editingPassword, setEditingPassword] = useState(false);        // Toggles between edit & view mode
  const [showPassword, setShowPassword] = useState(false);              // Toggle to show/hide password
  const [tempPassword, setTempPassword] = useState(password);           // Temporary input (in case user does not save)
  const navigate = useNavigate();

  /* Keeps tempPassword updated when parent password changes */
  useEffect(() => {
    setTempPassword(password);
  }, [password])
  
  return (
    <div
      style={{
        fontWeight: "bold",
        marginBottom: "15px",
        textAlign: "left",
      }}
    >
      <label>Password</label>

      {editingPassword ? (
        <>

          {/* Edit Mode */}
          <input
            type="text"     // Not hidden so the user sees what they type
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}       // Update draft password
            style={{
              width: "80%",
              padding: "8px",
              marginTop: "5px",
              border: "1px solid orange",
              backgroundColor: "#222",
              color: "orange",
              borderRadius: "5px",
            }}
          />

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
            }}
          >

            {/* Save Button */}
            <AuthButton
              onClick={() => 
                saveUser(username, tempPassword)}
                disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </AuthButton>

            {/* Cancel Button */}
            <AuthButton
              onClick={() => setEditingPassword(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </AuthButton>
          </div>
        </>
      ) : (
        <>

          {/* View Mode */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            {/* Toggle Password */}
            <p
              style={{
                fontWeight: "normal",
                margin: 0,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? password : "••••••••"}
            </p>

            {/* Switch to Edit */}
            <AuthButton
              onClick={() => setEditingPassword(true)}
              variant="secondary"
            >
              Reset Password
            </AuthButton>
          </div>

          {/* Text Suggests Toggle */}
          <small style={{ color: "orange" }}>
            {showPassword ? "Click to hide" : "Click to show"}
          </small>
        </>
      )}
    </div>
  );
};

export default PasswordDisplay;