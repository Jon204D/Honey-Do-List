import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AuthCard from "../Components/Auth/AuthCard";
import FormMessage from "../Components/Auth/FormMessage";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthInput, AuthButton } from "../Components/Auth/AuthStyles";

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
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const saveLoginSession = (userData: any) => {
    const now = Date.now();
    const sessionExpiry = now + 3600000; // 1 hour

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginTimestamp", String(now));
    localStorage.setItem("sessionExpiry", String(sessionExpiry));
    localStorage.setItem("fakeUser", JSON.stringify(userData));
    window.dispatchEvent(new Event("sessionchange"));
  };

  const validateFields = (): string | null => {
    if (!email || !password) {
      return "All fields are required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format.";
    }
    return null;
  };

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
    const throttleDelay = 3000;

    if (now - lastSubmitTime.current < throttleDelay) {
      console.log("Request throttled. Please wait before submitting again.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    lastSubmitTime.current = now;

    try {
      // Get backend URL from environment
      const backendBase = (process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:5001").replace(/\/+$/, "");
      const loginUrl = `${backendBase}/api/users/login`;

      console.log('🔄 Attempting login to:', loginUrl);

      const response = await axios.post(
        loginUrl,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('✅ Login response:', response.status, response.data);

      if (response.data?.message === "Login successful") {
        const data = response.data;
        
        // Save auth token if provided
        if (data?.token) {
          localStorage.setItem("authToken", String(data.token));
        }
        
        if (!data?.user) {
          setFormMessage("Invalid server response.");
          setIsSubmitting(false);
          return;
        }
        
        saveLoginSession(data.user);
        navigate("/settings", { state: { message: "Welcome back!" } });
      } else {
        setFormMessage(response.data?.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("❌ Login error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          const serverMsg = err.response.data?.message || "Invalid credentials";
          setFormMessage(serverMsg);
        } else if (err.request) {
          // Request made but no response received
          console.error('No response from server. Check if backend is running.');
          setFormMessage(
            "Cannot connect to server. Please ensure the backend is running on port 5001."
          );
        } else {
          // Something else happened
          setFormMessage("An error occurred. Please try again.");
        }
      } else {
        setFormMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginRequest();
  };

  return (
    <AuthCard title="Log In">
      {formMessage && <FormMessage message={formMessage} />}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />

        <AuthButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </AuthButton>
      </form>

      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
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
  );
};

export default Login;