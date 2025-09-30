import {useNavigate} from "react-router-dom";
import React, {useState, useRef} from "react";
import AuthCard from "../Components/AuthCard";
import FormMessage from "../Components/FormMessage";
import SignUpExtraButton from "../Components/SignUpExtraButon";
import {AuthInput, AuthButton} from "../Components/AuthStyles";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);

  const validateFields = (): string | null => {
    if (!username || !email || !password) {
      return 'All fields are required.';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters long.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format.';
    }
    return null;
  };

  const signUpRequest = async () => {
    // Field Validation
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
      console.log('Request throttled. Please wait before submitting again.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    lastSubmitTime.current = now;

    try {
      // Make the API POST request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:3001'}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      // Handle response
      if (response.ok) {
        loginNav("Account created! Please log in.");
      } else {
        const errorData = await response.json();
        console.error('Sign up failed:', errorData.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      
      // Fallback: Save fake user in localStorage for development
      localStorage.setItem(
        "fakeUser",
        JSON.stringify({ username, email, password })
      );
      loginNav("Account created! Please log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginNav = (message?: string) => {
    navigate("/login", { state: { message } });
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
  }

  return (

    /* Title */
    <AuthCard title="Create Account">
      {formMessage && <FormMessage message={formMessage} />}
      <form
        onSubmit={handleSignUp}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >

        {/* Username */}
        <AuthInput
          type="text"
          name="username"
          placeholder="Username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Email */}
        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Create Button */}
        <AuthButton
          type="submit"
          variant="primary"
          onClick={signUpRequest}
          disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </AuthButton>
      </form>

      {/* Navigate to Login */}
      <SignUpExtraButton/>
    </AuthCard>
  )
}

export default SignUp;