import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AuthCard from "../Components/Auth/AuthCard";
import FormMessage from "../Components/Auth/FormMessage";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthInput, AuthButton } from "../Components/Auth/AuthStyles";

/* Displays Login Form
   - Calls backend or uses local fallback (env-gated)
   - Saves login session in localStorage (session for 1 hour)
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
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const saveLoginSession = (userData: any) => {
    const now = Date.now();
    const sessionExpiry = now + 3600000; // 1 hour

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginTimestamp", String(now));
    localStorage.setItem("sessionExpiry", String(sessionExpiry));
    // store user (for dev convenience only, guarded by env flag in code)
    localStorage.setItem("fakeUser", JSON.stringify(userData));
    window.dispatchEvent(new Event("sessionchange")); // notify navbar
  };

  /* Validation */
  const validateFields = (): string | null => {
    if (!email || !password) {
      return "All fields are required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format.";
    }
    return null;
  };

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
    const throttleDelay = 3000; // 3 seconds

    if (now - lastSubmitTime.current < throttleDelay) {
      console.log("Request throttled. Please wait before submitting again.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    lastSubmitTime.current = now;

    try {
      // Normalize backend base URL (trim trailing slashes) to avoid double slashes
      const backendBase = (process.env.REACT_APP_BACKEND_BASE_URL || "").replace(/\/+$/, "");
      const loginUrl = `${backendBase}/api/users/login`;

      const response = await axios.post(loginUrl, { email, password });

      // axios resolves only for 2xx status codes; check server-provided message
      if (response.data?.message === "Login successful") {
        const data = response.data;
        if (data?.token) localStorage.setItem("authToken", String(data.token));
        if (!data?.user) {
          setFormMessage("Invalid server response.");
          setIsSubmitting(false);
          return;
        }
        saveLoginSession(data.user);
        navigate("/settings", { state: { message: "Welcome back!" } });
      } else {
        // server returned 2xx but not a success message
        const errorData = response.data || {};
        setFormMessage(errorData.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);

      // If server responded with non-2xx, surface it instead of masking as network error
      if (axios.isAxiosError(err) && err.response) {
        const serverMsg = err.response.data?.message || "Invalid credentials";
        setFormMessage(serverMsg);
        setIsSubmitting(false);
        return;
      }

      // Network / CORS / no-response case: optionally attempt local fallback (dev only)
      const allowFallback = process.env.REACT_APP_ALLOW_FALLBACK === "true";
      if (allowFallback) {
        const savedUser = localStorage.getItem("fakeUser");
        if (savedUser) {
          try {
            const u = JSON.parse(savedUser);
            if (u?.email === email && u?.password === password) {
              saveLoginSession(u);
              navigate("/settings", { state: { message: "Welcome back! (offline)" } });
              setIsSubmitting(false);
              return;
            } else {
              // savedUser exists but credentials don't match -> show "Invalid credentials"
              setFormMessage("Invalid credentials");
              setIsSubmitting(false);
              return;
            }
          } catch (e) {
            console.warn("Could not parse fakeUser from localStorage", e);
          }
        }
      }

      // No savedUser or fallback disabled -> genuine network/CORS problem
      setFormMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Login Form */
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
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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