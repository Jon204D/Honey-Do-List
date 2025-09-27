import AuthCard from "../components/AuthCard";
import React, {useState, useEffect} from "react";
import {AuthButton} from "../components/AuthStyles";
import {useNavigate, useLocation} from "react-router-dom";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  const message = location.state?.message;

  {/* Reads fakeUser from localStorage*/}
  {/*Populates state variables with saved username, email, and password*/}
  useEffect(() => {
    const storedUser = localStorage.getItem("fakeUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setPassword(parsedUser.password || "");
    }
  }, []);

  {/*Saves updated user info back into localStorage*/}
  const saveUser = (newUsername = username, newPassword = password) => {
    localStorage.setItem(
      "fakeUser",
      JSON.stringify({username: newUsername, email, password: newPassword})
    )
  }

  {/*Clears the login flag from storage*/}
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login", {state: {message: "You have been logged out!"}});
  }

  return (
    <AuthCard title="Account Settings">
      {message && (
        <div 
          style = {{
            color: "orange", 
            marginBottom: "15px", 
            fontWeight: "bold"
          }}
        >
          {message}
        </div>
      )}

      {/* Username */}
      <div 
        style = {{
          fontWeight: "bold", 
          marginBottom: "15px", 
          textAlign: "left"
          }}
        >
          <label>Username</label>
          {editingUsername ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
                gap: "10px"
              }}
            >
              <AuthButton
                onClick={() => {
                  saveUser(username, password);
                  setEditingUsername(false);
                  navigate("/settings", {state: {message: "Username updated!" }
                  })
                }}
              >
                Save
              </AuthButton>
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
          <div
            style = {{
              display: "flex",
              justifyContent: "space-between", 
              alignItems: "center",            
              marginTop: "5px",
            }}
          >
            <p style={{fontWeight: "normal", margin: 0 }}>{username}</p>
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

      {/* Email */}
      <div 
        style = {{ 
          fontWeight: "bold", 
          marginBottom: "15px", 
          textAlign: "left" 
        }}
      >
        <label>Email</label>
        <p style={{ fontWeight: "normal", marginTop: "5px" }}>{email}</p>
      </div>

      {/* Password */}
      <div 
        style = {{ 
          fontWeight: "bold", 
          marginBottom: "15px", 
          textAlign: "left" 
        }}
      >
        <label>Password</label>
        {editingPassword ? (
          <>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style = {{
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                border: "1px solid orange",
                backgroundColor: "#222",
                color: "orange",
                borderRadius: "5px",
              }}
            />
            <div 
              style = {{ 
                marginTop: "10px", 
                display: "flex", 
                gap: "10px" 
              }}
            >
              <AuthButton
                onClick={() => {
                  saveUser(username, password);
                  setEditingPassword(false);
                  navigate("/settings", {state: {message: "Password updated!"} 
                  })
                }}
              >
                Save
              </AuthButton>
              <AuthButton 
                onClick={() => setEditingPassword(false)} 
                variant="secondary"
              >
                Cancel
              </AuthButton>
            </div>
          </>
        ) : (
          <>
            {/* password text + button on same row */}
            <div
              style= {{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "5px",
              }}
            >
              <p
                style = {{
                  fontWeight: "normal",
                  margin: 0,
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? password : "••••••••"}
              </p>

              <AuthButton 
                onClick={() => setEditingPassword(true)} 
                variant="secondary"
              >
                Reset Password
              </AuthButton>
            </div>

            {/* toggle */}
            <small style={{ color: "orange" }}>
              {showPassword ? "Click to hide" : "Click to show"}
            </small>
        </>
        )}
      </div>

      {/* Logout */}
      <div style={{ marginTop: "20px" }}>
        <AuthButton 
          onClick={handleLogout} 
          variant="primary"
        >
          Log Out
        </AuthButton>
      </div>
    </AuthCard>
  )
}

export default Settings;