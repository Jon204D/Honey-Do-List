import React, { useState, useEffect, useRef } from "react";
import AuthCard from "../Components/Auth/AuthCard";
import FormMessage from "../Components/Auth/FormMessage";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthInput, AuthButton } from "../Components/Auth/AuthStyles";

/* Displays Login Form
   - Calls backend or uses local fallback
   - Saves login session in localStorage 
   - Session only valid for 1 hour
   - Displays success/error messages */
const Login: React.FC = () => {
  useEffect(() => {
    document.title = "Honey-Do List Login";
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formMessage, setFormMessage] = useState<string | null>(
    (location.state as any)?.message || null
  )

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const saveLoginSession = (userData: any) => {
    const now = Date.now();
    const sessionExpiry = now + 3600000; // 1 hour

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginTimestamp", String(now));
    localStorage.setItem("sessionExpiry", String(sessionExpiry));
    localStorage.setItem("fakeUser", JSON.stringify(userData));
    window.dispatchEvent(new Event("sessionchange")); // notify navbar
  }

  /* Validation */
  const validateFields = (): string | null => {
    if (!email || !password) {
      return "All fields are required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format.";
    }
    return null;
  }

  /* Request to Backend */
  const loginRequest = async () => {
    const validationError = validateFields();
    if (validationError) {
      setFormMessage(validationError);
      return;
    } else {
      setFormMessage(null);
    }

    // Throttle: Prevent submissions within 3 seconds
    const now = Date.now();
    const throttleDelay = 3000;   // 3 seconds

    if (now - lastSubmitTime.current < throttleDelay) {
      console.log("Request throttled. Please wait before submitting again.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    lastSubmitTime.current = now;

    try {
      // Make the API POST request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}api/users/login`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email, password}),
        }
      )

      /* Handle Response */
      if (response.ok) {
        const data = await response.json();
        // Optional: store token if backend returns it
        if (data?.token) localStorage.setItem("authToken", String(data.token));
        if (!data?.user) {
          setFormMessage("Invalid server response.");
          return;
        }
        saveLoginSession(data.user);
        navigate("/settings", { state: { message: "Welcome back!" } });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setFormMessage(errorData.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Network error:", error);

      // Fallback: Save fake user in localStorage for development
      const savedUser = localStorage.getItem("fakeUser");
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u?.email === email && u?.password === password) {
            saveLoginSession(u);
            navigate("/settings", { state: { message: "Welcome back! (offline)" } });
            return;
          }
        } catch {}
      }
      setFormMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* Login Form */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  }

  return (
    <AuthCard title="Log In">
      {formMessage && <FormMessage message={formMessage} />}

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {/* Email Input */}
        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */} 
        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit Button */}
        <AuthButton
          type="submit"
          variant="primary"
          onClick={loginRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </AuthButton>
      </form>

      {/* Forgot Password, Create Account, and Invite New User */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <AuthButton onClick={() => navigate("/forgot-password")} variant="secondary">
          Forgot Password?
        </AuthButton>

        <AuthButton onClick={() => navigate("/signup")} variant="secondary">
          Create Account
        </AuthButton>

        <AuthButton onClick={() => navigate("/invite")} variant="secondary">
          Invite New User
        </AuthButton>
      </div>

      </AuthCard>
  )
}

export default Login;