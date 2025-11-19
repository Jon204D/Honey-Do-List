import React, {useState, useEffect, useRef} from "react";
import AuthCard from "../Components/Auth/AuthCard";
import {useNavigate} from "react-router-dom";
import FormMessage from "../Components/Auth/FormMessage";
import {AuthInput, AuthButton} from "../Components/Auth/AuthStyles";

/* Request Password Reset Link
<<<<<<< HEAD
   - go back to the "Login" page
   - recieve message that the email was sent */
=======
   - Validates email
   - Sends request to backend
   - Shows success / error messages
   - Go back to the "Login" page */
>>>>>>> develop
const ForgotPassword: React.FC = () => {
   useEffect(() => {
        document.title = "Forgot Password - Honey-Do List";
    }, []);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Success / Error Message
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // Disable button while request is pending
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Throttle to prevent spam
  const lastSubmitTime = useRef<number>(0);

  // Validate Email
  const validateFields = (): string | null => {
    if (!email) {
      return "Email is required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Invalid email format.";
    }
    return null;
  }

  /* Calls backend API with email
     - If backend succeeds: navigates to login page with message
     - If backend fails: displays error message
     - If network error: show error message */ 
  const forgotPasswordRequest = async () => {
    const validationError = validateFields();
    if (validationError) {
      setFormMessage(validationError);
      return;
    }
    setFormMessage(null);
    
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
      // Backend Request
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/users/forgot-Password`, { 
        method: "POST",
        headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email}),
        }
      )

      if (response.ok) {
        // Redirect back to login with a message
        navigate("/login", {state: {message: "Password reset link sent to your email!"}});
      } else {
        // Backend responds with error
        const errorData = await response.json();
        setFormMessage(errorData.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Network error:", error);
      setFormMessage("Network error. Please try again later");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent default form submit fresh
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD

    /* Send success message to show code works */
    navigate("/login", {state: {message: "Password link set to your email!"}});
=======
>>>>>>> develop
  }

  return (
    // Title
    <AuthCard title="Forgot Password">
       {formMessage && <FormMessage message={formMessage}/>}

      {/* Forgot Password Form */}
      <form
        onSubmit={handleSubmit}
        style = {{
          display: "flex", 
          flexDirection: "column", 
          gap: "10px"
        }}
      >

        <AuthInput
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthButton 
          type="submit" 
          variant="primary"
          onClick={forgotPasswordRequest}
          disabled={isSubmitting}
        >
           {isSubmitting ? "Sending..." : "Send Reset Link"}
        </AuthButton>
      </form>

<<<<<<< HEAD
=======
      {/* Naviagte to Login */}
>>>>>>> develop
      <div 
        style = {{
          marginTop: "20px"
          }}
      > 
        <AuthButton 
          onClick={() => navigate("/login")} 
          variant="secondary">
            Back to Login
        </AuthButton>

      </div>
    </AuthCard>
  )
}

export default ForgotPassword;